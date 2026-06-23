import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from '../pages/Home';
import RecipeDetails from '../pages/RecipeDetails';
import Favorites from '../pages/Favorites';
import AddRecipe from '../pages/AddRecipe';

export default function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/add-recipe" element={<AddRecipe />} />
        <Route path="/edit-recipe/:id" element={<AddRecipe />} />
      </Routes>
    </AnimatePresence>
  );
}
