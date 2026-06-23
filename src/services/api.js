import axios from 'axios';

const BASE = 'https://www.themealdb.com/api/json/v1/1';

export const searchByName = async (query) => {
  const { data } = await axios.get(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  return data.meals || [];
};

// Common words that aren't useful as standalone search terms
const STOPWORDS = new Set([
  'and', 'with', 'the', 'for', 'from', 'that', 'this', 'are', 'was',
  'has', 'have', 'sauce', 'style', 'make', 'made', 'easy', 'best',
]);

/**
 * Try exact query first. If nothing found, split into keywords and
 * search each one, then merge & deduplicate the results.
 * Returns { meals, isRelated } where isRelated=true means it fell back.
 */
export const smartSearchByName = async (query) => {
  // 1. Exact / partial match
  const exact = await searchByName(query);
  if (exact.length > 0) return { meals: exact, isRelated: false };

  // 2. Keyword fallback
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));

  if (words.length === 0) return { meals: [], isRelated: false };

  const results = await Promise.allSettled(words.map((w) => searchByName(w)));

  const seen = new Set();
  const meals = [];
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const meal of r.value) {
        if (!seen.has(meal.idMeal)) {
          seen.add(meal.idMeal);
          meals.push(meal);
        }
      }
    }
  }

  return { meals, isRelated: meals.length > 0 };
};

export const searchByIngredient = async (ingredient) => {
  const { data } = await axios.get(`${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`);
  return data.meals || [];
};

export const filterByCategory = async (category) => {
  const { data } = await axios.get(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  return data.meals || [];
};

export const getMealById = async (id) => {
  const { data } = await axios.get(`${BASE}/lookup.php?i=${id}`);
  return data.meals?.[0] || null;
};

export const getCategories = async () => {
  const { data } = await axios.get(`${BASE}/categories.php`);
  return data.categories || [];
};

export const getIngredients = (meal) => {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), measure: measure?.trim() || '' });
    }
  }
  return ingredients;
};
