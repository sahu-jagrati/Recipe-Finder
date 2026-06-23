import { useState, useCallback } from 'react';
import {
  multiSearchByName,
  multiSearchByIngredient,
} from '../services/multiSearch';
import { filterByCategory } from '../services/api';

export function useFetchRecipes() {
  const [meals,     setMeals]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [isRelated, setIsRelated] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const fetchByName = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    setLastQuery(query);
    try {
      const { meals: data, isRelated: related } = await multiSearchByName(query);
      setMeals(data);
      setIsRelated(related);
    } catch {
      setError('Failed to fetch recipes. Please try again.');
      setMeals([]);
      setIsRelated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByIngredient = useCallback(async (ingredient) => {
    setLoading(true);
    setError(null);
    setLastQuery(ingredient);
    setIsRelated(false);
    try {
      const data = await multiSearchByIngredient(ingredient);
      setMeals(data);
    } catch {
      setError('Failed to fetch recipes. Please try again.');
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByCategory = useCallback(async (category) => {
    setLoading(true);
    setError(null);
    setIsRelated(false);
    setLastQuery('');
    try {
      // Category browsing stays on MealDB (it has structured categories)
      const data = await filterByCategory(category);
      setMeals(data.map((m) => ({ ...m, _source: 'mealdb' })));
    } catch {
      setError('Failed to fetch recipes. Please try again.');
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    meals, loading, error, isRelated, lastQuery,
    fetchByName, fetchByIngredient, fetchByCategory,
  };
}
