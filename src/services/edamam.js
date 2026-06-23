/**
 * Edamam Recipe Search API v2
 * Free tier: 10,000 calls/month  |  2,300,000+ recipes
 * Sign up: https://developer.edamam.com/  →  Recipe Search API
 */
import axios from 'axios';

const APP_ID  = import.meta.env.VITE_EDAMAM_APP_ID;
const APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;
const BASE    = 'https://api.edamam.com/api/recipes/v2';

export const isEnabled = () => Boolean(APP_ID && APP_KEY);

// In-memory cache
const _cache = new Map();
export const cacheSet = (id, data) => _cache.set(id, data);
export const cacheGet = (id) => _cache.get(id) || null;

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

/**
 * Edamam doesn't expose full step-by-step instructions — only ingredient
 * lines and a source URL. We build the best description we can.
 */
const normalize = (recipe) => {
  const fields = {};
  const lines = recipe.ingredientLines || [];
  for (let i = 0; i < 20; i++) {
    // Store the full line as the "measure" and parse a name from it
    const line = lines[i] || '';
    const words = line.split(' ');
    fields[`strIngredient${i + 1}`] = line ? (words.slice(words.length > 2 ? 2 : 1).join(' ') || line) : '';
    fields[`strMeasure${i + 1}`]    = line ? (words.slice(0, 2).join(' ')) : '';
  }

  const instructions =
    `Full step-by-step instructions are available at the source website.\n\n` +
    `Ingredient list:\n${lines.map((l) => `• ${l}`).join('\n')}`;

  const id = recipe.uri?.split('#recipe_')[1] || Date.now().toString();

  const meal = {
    idMeal: `edamam-${id}`,
    strMeal: recipe.label || '',
    strMealThumb: recipe.image || '',
    strCategory: cap(recipe.dishType?.[0]) || cap(recipe.mealType?.[0]) || 'Miscellaneous',
    strArea: cap(recipe.cuisineType?.[0]) || '',
    strInstructions: instructions,
    strYoutube: null,
    strSource: recipe.url || null,
    _source: 'edamam',
    ...fields,
  };

  cacheSet(meal.idMeal, meal);
  return meal;
};

/** Search recipes by keyword */
export const searchByName = async (query) => {
  if (!isEnabled()) return [];
  const { data } = await axios.get(BASE, {
    params: { type: 'public', q: query, app_id: APP_ID, app_key: APP_KEY },
  });
  return (data.hits || []).map((hit) => normalize(hit.recipe));
};

/** Fetch single recipe by Edamam recipe ID */
export const getById = async (edamamId) => {
  if (!isEnabled()) return null;
  const { data } = await axios.get(`${BASE}/${edamamId}`, {
    params: { type: 'public', app_id: APP_ID, app_key: APP_KEY },
  });
  return normalize(data.recipe);
};
