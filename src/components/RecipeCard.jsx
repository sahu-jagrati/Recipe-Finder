import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiArrowRight, FiExternalLink } from 'react-icons/fi';
import { useRecipe } from '../context/RecipeContext';

const SOURCE_META = {
  spoonacular: { label: 'Spoonacular', color: 'source-spoon', icon: '🥄' },
  edamam:      { label: 'Edamam',      color: 'source-edamam', icon: '🍃' },
  mealdb:      { label: 'MealDB',      color: 'source-mealdb', icon: '🍽️' },
};

export default function RecipeCard({ meal, index = 0 }) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useRecipe();
  const liked    = isFavorite(meal.idMeal);
  const source   = SOURCE_META[meal._source] || null;
  const isCustom = meal.idMeal?.startsWith('custom-');

  const handleFav = (e) => {
    e.stopPropagation();
    toggleFavorite(meal);
  };

  return (
    <motion.div
      className="recipe-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
      onClick={() => navigate(`/recipe/${meal.idMeal}`)}
      layout
    >
      {/* Image */}
      <div className="card-img-wrap">
        <img
          className="card-img"
          src={meal.strMealThumb}
          alt={meal.strMeal}
          loading="lazy"
        />

        {/* Source badge — top-left */}
        {source && (
          <span className={`source-badge ${source.color}`}>
            {source.icon} {source.label}
          </span>
        )}
        {isCustom && (
          <span className="source-badge source-custom">✏️ My Recipe</span>
        )}

        {/* Favorite button — top-right */}
        <button
          className={`fav-toggle ${liked ? 'liked' : ''}`}
          onClick={handleFav}
          title={liked ? 'Remove from favorites' : 'Save to favorites'}
        >
          <FiHeart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Body */}
      <div className="card-body">
        <h3 className="card-title">{meal.strMeal}</h3>
        <div className="card-tags">
          {meal.strCategory && (
            <span className="tag tag-cat">{meal.strCategory}</span>
          )}
          {meal.strArea && (
            <span className="tag tag-area">🌍 {meal.strArea}</span>
          )}
        </div>
        <div className="card-footer">
          <span className="view-btn">
            {meal._source === 'edamam' ? (
              <><FiExternalLink size={12} /> View Recipe</>
            ) : (
              <>View Recipe <FiArrowRight size={13} /></>
            )}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
