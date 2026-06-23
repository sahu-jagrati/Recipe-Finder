import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome } from 'react-icons/fi';
import { useRecipe } from '../context/RecipeContext';
import RecipeCard from '../components/RecipeCard';

export default function Favorites() {
  const { favorites } = useRecipe();

  return (
    <div>
      {/* Page Hero */}
      <div className="page-hero">
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          ❤️ Your Favorites
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {favorites.length > 0
            ? `${favorites.length} recipe${favorites.length !== 1 ? 's' : ''} saved`
            : 'Save recipes from the home page'}
        </motion.p>
      </div>

      {/* Content */}
      <div className="favorites-content">
        {favorites.length === 0 ? (
          <motion.div
            className="empty-favorites"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="empty-icon">🤍</div>
            <h2>No favorites yet</h2>
            <p>
              Browse recipes and tap the heart icon to save your favorites here.
            </p>
            <Link to="/" className="btn-go-home">
              <FiHome size={16} /> Browse Recipes
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="recipes-grid">
              {favorites.map((meal, i) => (
                <RecipeCard key={meal.idMeal} meal={meal} index={i} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
