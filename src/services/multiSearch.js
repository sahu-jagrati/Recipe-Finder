/**
 * Multi-API search layer.
 * Calls TheMealDB + Spoonacular + Edamam in parallel (whichever are enabled),
 * merges and deduplicates results, and handles keyword fallback.
 */
import * as mealdb      from './api';
import * as spoonacular from './spoonacular';
import * as edamam      from './edamam';

// Words that are too generic to use as standalone search keywords
const STOPWORDS = new Set([
  'and', 'with', 'the', 'for', 'from', 'that', 'this', 'are', 'was',
  'has', 'have', 'sauce', 'style', 'make', 'made', 'easy', 'best',
  'homemade', 'quick', 'simple', 'classic', 'spicy', 'creamy',
]);

/** Deduplicate by idMeal */
const dedup = (meals) => {
  const seen = new Set();
  return meals.filter((m) => {
    if (seen.has(m.idMeal)) return false;
    seen.add(m.idMeal);
    return true;
  });
};

/** Run all settled, flatten successes */
const mergeSettled = (results) =>
  results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

/** Tag MealDB results with _source for badge display */
const tagMealDB = (meals) => meals.map((m) => ({ ...m, _source: 'mealdb' }));

/**
 * Search by name across all enabled APIs.
 * Returns { meals, isRelated }
 *   isRelated = true means exact query had 0 results and we fell back to keywords
 */
export const multiSearchByName = async (query) => {
  // ── Pass 1: exact query on all APIs simultaneously ──
  const pass1 = await Promise.allSettled([
    mealdb.searchByName(query).then(tagMealDB),
    spoonacular.searchByName(query),
    edamam.searchByName(query),
  ]);

  const exact = dedup(mergeSettled(pass1));
  if (exact.length > 0) return { meals: exact, isRelated: false };

  // ── Pass 2: keyword fallback (MealDB only — saves API quota) ──
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));

  if (words.length === 0) return { meals: [], isRelated: false };

  const pass2 = await Promise.allSettled(
    words.map((w) => mealdb.searchByName(w).then(tagMealDB))
  );

  const fallback = dedup(mergeSettled(pass2));
  return { meals: fallback, isRelated: fallback.length > 0 };
};

/**
 * Search by ingredient across enabled APIs.
 */
export const multiSearchByIngredient = async (ingredient) => {
  const results = await Promise.allSettled([
    mealdb.searchByIngredient(ingredient).then(tagMealDB),
    spoonacular.searchByIngredient(ingredient),
    // Edamam doesn't have a dedicated ingredient filter endpoint
  ]);
  return dedup(mergeSettled(results));
};

/**
 * Fetch full recipe detail based on ID prefix.
 *   spoon-{id}   → Spoonacular (checks cache first)
 *   edamam-{id}  → Edamam      (checks cache first)
 *   custom-{id}  → localStorage (handled by caller, not here)
 *   {numeric}    → TheMealDB
 */
export const getDetailById = async (id) => {
  if (id.startsWith('spoon-')) {
    // Check in-memory cache first (avoids re-fetching after a search)
    const cached = spoonacular.cacheGet(id);
    if (cached) return cached;
    return spoonacular.getById(id.replace('spoon-', ''));
  }

  if (id.startsWith('edamam-')) {
    const cached = edamam.cacheGet(id);
    if (cached) return cached;
    return edamam.getById(id.replace('edamam-', ''));
  }

  // TheMealDB numeric id
  const meal = await mealdb.getMealById(id);
  return meal ? { ...meal, _source: 'mealdb' } : null;
};

/** Convenience: which APIs are currently active */
export const activeAPIs = () => {
  const list = ['TheMealDB'];
  if (spoonacular.isEnabled()) list.push('Spoonacular');
  if (edamam.isEnabled())      list.push('Edamam');
  return list;
};
