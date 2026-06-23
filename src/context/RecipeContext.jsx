import { createContext, useContext, useState, useEffect } from 'react';

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  /* ---------- Dark mode ---------- */
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('rf-dark') === 'true'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('rf-dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((p) => !p);

  /* ---------- Favorites ---------- */
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rf-favorites')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('rf-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (meal) =>
    setFavorites((prev) => {
      const found = prev.find((m) => m.idMeal === meal.idMeal);
      return found ? prev.filter((m) => m.idMeal !== meal.idMeal) : [...prev, meal];
    });

  const isFavorite = (id) => favorites.some((m) => m.idMeal === id);

  /* ---------- Custom Recipes ---------- */
  const [customRecipes, setCustomRecipes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rf-custom-recipes')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('rf-custom-recipes', JSON.stringify(customRecipes));
  }, [customRecipes]);

  /** Add a new custom recipe; returns the generated idMeal */
  const addCustomRecipe = (recipe) => {
    const id = `custom-${Date.now()}`;
    const newRecipe = { ...recipe, idMeal: id, isCustom: true };
    setCustomRecipes((prev) => [newRecipe, ...prev]);
    return id;
  };

  /** Overwrite an existing custom recipe by id */
  const updateCustomRecipe = (id, updates) =>
    setCustomRecipes((prev) =>
      prev.map((r) => (r.idMeal === id ? { ...r, ...updates } : r))
    );

  /** Delete a custom recipe and remove it from favorites too */
  const deleteCustomRecipe = (id) => {
    setCustomRecipes((prev) => prev.filter((r) => r.idMeal !== id));
    setFavorites((prev) => prev.filter((m) => m.idMeal !== id));
  };

  /** Lookup a single custom recipe by id */
  const getCustomRecipe = (id) => customRecipes.find((r) => r.idMeal === id) || null;

  return (
    <RecipeContext.Provider
      value={{
        darkMode, toggleDarkMode,
        favorites, toggleFavorite, isFavorite,
        customRecipes, addCustomRecipe, updateCustomRecipe, deleteCustomRecipe, getCustomRecipe,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export const useRecipe = () => useContext(RecipeContext);
