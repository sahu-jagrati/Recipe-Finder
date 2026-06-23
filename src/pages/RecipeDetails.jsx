import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHeart, FiYoutube, FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { getDetailById } from '../services/multiSearch';
import { extractIngredients } from '../utils/helpers';
import { useRecipe } from '../context/RecipeContext';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const SOURCE_LABEL = {
  mealdb:      { label: 'TheMealDB',   icon: '🍽️', color: '#e63946' },
  spoonacular: { label: 'Spoonacular', icon: '🥄', color: '#2e7d32' },
  edamam:      { label: 'Edamam',      icon: '🍃', color: '#1565c0' },
};

export default function RecipeDetails() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { toggleFavorite, isFavorite, getCustomRecipe, deleteCustomRecipe } = useRecipe();

  const [meal,    setMeal]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const isCustom      = id?.startsWith('custom-');
  const isSpoonacular = id?.startsWith('spoon-');
  const isEdamam      = id?.startsWith('edamam-');

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (isCustom) {
      const recipe = getCustomRecipe(id);
      recipe ? setMeal(recipe) : setError('Recipe not found.');
      setLoading(false);
      return;
    }

    // TheMealDB, Spoonacular, or Edamam
    getDetailById(id)
      .then((data) => {
        if (!data) throw new Error('Recipe not found');
        setMeal(data);
      })
      .catch((err) => setError(err.message || 'Failed to load recipe.'))
      .finally(() => setLoading(false));
  }, [id, isCustom, getCustomRecipe]);

  const handleDelete = () => {
    if (!window.confirm(`Delete "${meal.strMeal}"? This cannot be undone.`)) return;
    deleteCustomRecipe(id);
    navigate('/');
  };

  if (loading) return <Loader message="Loading recipe details…" />;
  if (error)
    return (
      <div className="container">
        <ErrorMessage message={error} onRetry={() => navigate(-1)} />
      </div>
    );
  if (!meal) return null;

  const ingredients = extractIngredients(meal);
  const liked       = isFavorite(meal.idMeal);
  const srcMeta     = isCustom ? null : SOURCE_LABEL[meal._source] || SOURCE_LABEL.mealdb;

  return (
    <motion.div
      className="detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container">
        <button className="detail-back" onClick={() => navigate(-1)}>
          <FiArrowLeft size={15} /> Back
        </button>

        <div className="detail-grid">
          {/* ── Left: image ── */}
          <motion.div
            className="detail-img-col"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="detail-img-frame">
              <img className="detail-img" src={meal.strMealThumb} alt={meal.strMeal} />
            </div>

            <div className="detail-quick-info">
              {meal.strCategory && <span className="info-chip">🍽️ {meal.strCategory}</span>}
              {meal.strArea     && <span className="info-chip">🌍 {meal.strArea}</span>}
              {ingredients.length > 0 && (
                <span className="info-chip">🥄 {ingredients.length} ingredients</span>
              )}
              {isCustom  && <span className="info-chip custom-chip">✏️ My Recipe</span>}
              {srcMeta   && (
                <span className="info-chip" style={{ color: srcMeta.color }}>
                  {srcMeta.icon} {srcMeta.label}
                </span>
              )}
            </div>
          </motion.div>

          {/* ── Right: info ── */}
          <motion.div
            className="detail-info-col"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="detail-tags">
              {meal.strCategory && <span className="tag tag-cat">{meal.strCategory}</span>}
              {meal.strArea     && <span className="tag tag-area">🌍 {meal.strArea}</span>}
              {isCustom         && <span className="tag tag-custom">✏️ My Recipe</span>}
              {isSpoonacular    && <span className="tag tag-spoon">🥄 Spoonacular</span>}
              {isEdamam         && <span className="tag tag-edamam">🍃 Edamam</span>}
            </div>

            <h1 className="detail-title">{meal.strMeal}</h1>

            {/* Actions */}
            <div className="detail-actions">
              <button
                className={`btn-fav ${liked ? 'saved' : ''}`}
                onClick={() => toggleFavorite(meal)}
              >
                <FiHeart size={16} fill={liked ? 'currentColor' : 'none'} />
                {liked ? 'Saved to Favorites' : 'Save to Favorites'}
              </button>

              {meal.strYoutube && (
                <a className="btn-yt" href={meal.strYoutube} target="_blank" rel="noopener noreferrer">
                  <FiYoutube size={16} /> Watch on YouTube
                </a>
              )}

              {/* External source link for Spoonacular / Edamam */}
              {meal.strSource && (
                <a className="btn-source" href={meal.strSource} target="_blank" rel="noopener noreferrer">
                  <FiExternalLink size={15} /> Full Recipe
                </a>
              )}

              {isCustom && (
                <>
                  <Link to={`/edit-recipe/${id}`} className="btn-edit">
                    <FiEdit2 size={15} /> Edit
                  </Link>
                  <button className="btn-delete" onClick={handleDelete}>
                    <FiTrash2 size={15} /> Delete
                  </button>
                </>
              )}
            </div>

            {/* Edamam notice */}
            {isEdamam && (
              <div className="edamam-notice">
                <span>🍃</span>
                <p>
                  Edamam provides ingredient lists only — full step-by-step instructions
                  are available at the{' '}
                  {meal.strSource ? (
                    <a href={meal.strSource} target="_blank" rel="noopener noreferrer">
                      original source
                    </a>
                  ) : 'original source'}.
                </p>
              </div>
            )}

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <div className="detail-section">
                <h2 className="section-heading">Ingredients</h2>
                <div className="ingredients-grid">
                  {ingredients.map(({ name, measure, thumb }) => (
                    <div key={name} className="ingredient-row">
                      <img
                        className="ing-img"
                        src={thumb}
                        alt={name}
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                      <span className="ing-name">{name}</span>
                      {measure && <span className="ing-measure">{measure}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="detail-section">
              <h2 className="section-heading">
                {isEdamam ? 'Instructions' : 'Instructions'}
              </h2>
              <p className="instructions-text">{meal.strInstructions}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
