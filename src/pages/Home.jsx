import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiPlusCircle } from 'react-icons/fi';
import SearchBar from '../components/SearchBar';
import RecipeCard from '../components/RecipeCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { useFetchRecipes } from '../hooks/useFetchRecipes';
import { useRecipe } from '../context/RecipeContext';
import { getCategories } from '../services/api';
import { activeAPIs } from '../services/multiSearch';

const VEG_CATEGORIES = ['Vegetarian', 'Vegan', 'Side'];
const NONVEG_LABELS = { Beef: '🥩', Chicken: '🍗', Lamb: '🍖', Pork: '🐷', Seafood: '🦞' };

export default function Home() {
  const { meals, loading, error, isRelated, lastQuery, fetchByName, fetchByIngredient, fetchByCategory } =
    useFetchRecipes();
  const { customRecipes } = useRecipe();

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Chicken');
  const [searchActive, setSearchActive] = useState(false);
  const [searchType, setSearchType] = useState('name');

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { fetchByCategory('Chicken'); }, [fetchByCategory]);

  const handleSearch = useCallback((query, type) => {
    setActiveCategory('');
    setSearchActive(true);
    setSearchType(type);
    if (type === 'ingredient') fetchByIngredient(query);
    else fetchByName(query);
  }, [fetchByIngredient, fetchByName]);

  const handleCategory = useCallback((cat) => {
    setActiveCategory(cat);
    setSearchActive(false);
    fetchByCategory(cat);
  }, [fetchByCategory]);

  const categoryIcon = (cat) => {
    if (VEG_CATEGORIES.includes(cat.strCategory)) return '🥦';
    if (cat.strCategory === 'Dessert') return '🍰';
    return NONVEG_LABELS[cat.strCategory] || '🍽️';
  };

  const sectionTitle = searchActive
    ? isRelated ? `Related recipes for "${lastQuery}"` : `Results for "${lastQuery}"`
    : activeCategory ? `${activeCategory} Recipes` : 'Recipes';

  return (
    <div>
      {/* Hero + Search */}
      <section className="hero">
        <div className="hero-content">
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Discover Delicious Recipes 🍴
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Search by name or ingredient · Filter by category · Save your favorites
          </motion.p>

          {/* Active API pills */}
          <motion.div
            className="api-status-row"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="api-status-label">Searching across:</span>
            {activeAPIs().map((api) => (
              <span key={api} className="api-pill">{api}</span>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <SearchBar onSearch={handleSearch} />
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="filter-section">
        <p className="filter-label">Browse by category</p>
        <div className="category-strip">
          {categories.map((cat) => (
            <button
              key={cat.idCategory}
              className={`cat-pill ${activeCategory === cat.strCategory ? 'active' : ''}`}
              onClick={() => handleCategory(cat.strCategory)}
            >
              <img
                src={cat.strCategoryThumb} alt={cat.strCategory}
                onError={(e) => (e.target.style.display = 'none')}
              />
              {categoryIcon(cat)} {cat.strCategory}
            </button>
          ))}
        </div>
      </div>

      <div className="main-content">

        {/* ── Your Recipes Section ── */}
        {customRecipes.length > 0 && (
          <motion.div
            className="your-recipes-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="section-header">
              <div>
                <h2 className="section-title">✏️ Your Recipes</h2>
                <p className="section-sub">Recipes you created</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="result-chip">{customRecipes.length} saved</span>
                <Link to="/add-recipe" className="add-recipe-chip">
                  <FiPlusCircle size={13} /> Add New
                </Link>
              </div>
            </div>
            <div className="recipes-grid">
              {customRecipes.map((meal, i) => (
                <RecipeCard key={meal.idMeal} meal={meal} index={i} />
              ))}
            </div>
            <div className="section-divider" />
          </motion.div>
        )}

        {/* ── API Results Section ── */}
        {!loading && !error && meals.length > 0 && (
          <div className="section-header">
            <div>
              <h2 className="section-title">{sectionTitle}</h2>
              {isRelated && (
                <p className="related-note">
                  💡 Exact match not found — showing the closest recipes we have
                </p>
              )}
            </div>
            <span className="result-chip">{meals.length} results</span>
          </div>
        )}

        {loading && <Loader />}

        {error && !loading && (
          <ErrorMessage
            message={error}
            onRetry={() => fetchByCategory(activeCategory || 'Chicken')}
          />
        )}

        {!loading && !error && meals.length === 0 && (
          <div className="empty-search">
            <span className="big-icon">🍳</span>
            <h3>{searchActive && lastQuery ? `"${lastQuery}" not found` : 'No recipes found'}</h3>
            <p>
              {searchActive && searchType === 'name'
                ? "This dish isn't in our database yet. Try a key ingredient like \"paneer\", \"pasta\", or \"chicken\"."
                : searchActive && searchType === 'ingredient'
                ? 'No recipes match that ingredient. Try a simpler term like "tomato" or "garlic".'
                : 'Try a different keyword or browse the categories above.'}
            </p>
            {searchActive && (
              <Link to="/add-recipe" className="btn-go-home" style={{ marginTop: '1.25rem' }}>
                <FiPlusCircle size={15} /> Add it yourself
              </Link>
            )}
          </div>
        )}

        {!loading && !error && meals.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              className="recipes-grid"
              key={sectionTitle}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {meals.map((meal, i) => (
                <RecipeCard key={meal.idMeal} meal={meal} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
