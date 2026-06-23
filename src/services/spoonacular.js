/**
 * Spoonacular Recipe API
 * Free tier: 150 points/day  |  360,000+ recipes
 * Sign up: https://spoonacular.com/food-api/console#Dashboard
 */
import axios from 'axios';

const KEY = import.meta.env.VITE_SPOONACULAR_KEY;
const BASE = 'https://api.spoonacular.com';

export const isEnabled = () => Boolean(KEY);

// In-memory cache so detail pages don't re-fetch what search already returned
const _cache = new Map();
export const cacheSet = (id, data) => _cache.set(id, data);
export const cacheGet = (id) => _cache.get(id) || null;

/** Strip HTML tags from Spoonacular's HTML instruction strings */
const stripHtml = (html) =>
  html ? html.replace(/<[^>]+>/g, '').replace(/\s{2,}/g, ' ').trim() : '';

/** Capitalize first letter */
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

/** Convert Spoonacular recipe object → MealDB-shaped normalized object */
const normalize = (r) => {
  // Build strIngredient1…20 / strMeasure1…20 fields
  const fields = {};
  const ings = r.extendedIngredients || [];
  for (let i = 0; i < 20; i++) {
    fields[`strIngredient${i + 1}`] = ings[i]?.nameClean || ings[i]?.name || '';
    fields[`strMeasure${i + 1}`] = ings[i]?.original || '';
  }

  // Build step-by-step instructions
  let instructions = '';
  if (r.analyzedInstructions?.length) {
    instructions = r.analyzedInstructions
      .flatMap((section) => section.steps || [])
      .map((s) => `Step ${s.number}: ${s.step}`)
      .join('\n\n');
  } else if (r.instructions) {
    instructions = stripHtml(r.instructions);
  }
  if (!instructions) instructions = stripHtml(r.summary) || 'See full recipe at source.';

  const meal = {
    idMeal: `spoon-${r.id}`,
    strMeal: r.title || '',
    strMealThumb: r.image || '',
    strCategory: cap(r.dishTypes?.[0]) || 'Miscellaneous',
    strArea: cap(r.cuisines?.[0]) || '',
    strInstructions: instructions,
    strYoutube: null,
    strSource: r.sourceUrl || null,
    _source: 'spoonacular',
    ...fields,
  };

  cacheSet(meal.idMeal, meal);
  return meal;
};

/** Search recipes by name */
export const searchByName = async (query) => {
  if (!isEnabled()) return [];
  const { data } = await axios.get(`${BASE}/recipes/complexSearch`, {
    params: {
      query,
      number: 24,
      addRecipeInformation: true,
      fillIngredients: true,
      apiKey: KEY,
    },
  });
  return (data.results || []).map(normalize);
};

/** Search recipes that use a given ingredient */
export const searchByIngredient = async (ingredient) => {
  if (!isEnabled()) return [];
  // Step 1: get IDs by ingredient
  const { data: list } = await axios.get(`${BASE}/recipes/findByIngredients`, {
    params: { ingredients: ingredient, number: 16, apiKey: KEY },
  });
  if (!list?.length) return [];

  // Step 2: bulk-fetch full info (uses 1 API point per recipe)
  const ids = list.map((r) => r.id).join(',');
  const { data: bulk } = await axios.get(`${BASE}/recipes/informationBulk`, {
    params: { ids, apiKey: KEY },
  });
  return (bulk || []).map(normalize);
};

/** Fetch full detail by Spoonacular numeric ID */
export const getById = async (numericId) => {
  if (!isEnabled()) return null;
  const { data } = await axios.get(`${BASE}/recipes/${numericId}/information`, {
    params: { apiKey: KEY },
  });
  return normalize(data);
};
