import { NavLink } from 'react-router-dom';
import { FiSun, FiMoon, FiHeart, FiHome, FiPlusCircle } from 'react-icons/fi';
import { useRecipe } from '../context/RecipeContext';

export default function Navbar() {
  const { darkMode, toggleDarkMode, favorites } = useRecipe();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          🍽️ <span className="logo-text">Recipe</span>Finder
        </NavLink>

        {/* Right side */}
        <div className="navbar-right">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FiHome size={15} />
            <span className="link-label">Home</span>
          </NavLink>

          <NavLink
            to="/favorites"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FiHeart size={15} />
            <span className="link-label">Favorites</span>
            {favorites.length > 0 && (
              <span className="fav-badge">{favorites.length}</span>
            )}
          </NavLink>

          {/* Add Recipe — highlighted button */}
          <NavLink to="/add-recipe" className="nav-add-btn">
            <FiPlusCircle size={15} />
            <span>Add Recipe</span>
          </NavLink>

          <button
            className="icon-btn"
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FiSun size={17} /> : <FiMoon size={17} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
