import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiArrowLeft, FiCheck, FiImage } from 'react-icons/fi';
import { useRecipe } from '../context/RecipeContext';

const CATEGORIES = [
  'Beef', 'Breakfast', 'Chicken', 'Dessert', 'Goat', 'Lamb',
  'Miscellaneous', 'Pasta', 'Pork', 'Seafood', 'Side',
  'Starter', 'Vegan', 'Vegetarian', 'Other',
];

const PLACEHOLDER_IMG = 'https://placehold.co/600x400/f4a261/ffffff?text=My+Recipe';

const emptyIngredient = () => ({ id: Date.now() + Math.random(), name: '', measure: '' });

function validate(form, ingredients) {
  const errors = {};
  if (!form.strMeal.trim()) errors.strMeal = 'Recipe name is required.';
  else if (form.strMeal.trim().length < 3) errors.strMeal = 'Name must be at least 3 characters.';
  if (!form.strInstructions.trim()) errors.strInstructions = 'Instructions are required.';
  else if (form.strInstructions.trim().length < 20) errors.strInstructions = 'Please add more detailed instructions.';
  if (!ingredients.some((ing) => ing.name.trim())) errors.ingredients = 'Add at least one ingredient.';
  return errors;
}

export default function AddRecipe() {
  const navigate = useNavigate();
  const { id } = useParams(); // present on /edit-recipe/:id
  const isEdit = Boolean(id);
  const { addCustomRecipe, updateCustomRecipe, getCustomRecipe } = useRecipe();

  const [form, setForm] = useState({
    strMeal: '',
    strCategory: 'Other',
    strArea: '',
    strMealThumb: '',
    strInstructions: '',
  });
  const [ingredients, setIngredients] = useState([emptyIngredient(), emptyIngredient(), emptyIngredient()]);
  const [errors, setErrors] = useState({});
  const [imgError, setImgError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (!isEdit) return;
    const recipe = getCustomRecipe(id);
    if (!recipe) { navigate('/'); return; }

    setForm({
      strMeal: recipe.strMeal || '',
      strCategory: recipe.strCategory || 'Other',
      strArea: recipe.strArea || '',
      strMealThumb: recipe.strMealThumb || '',
      strInstructions: recipe.strInstructions || '',
    });

    // Reconstruct ingredients list from MealDB fields
    const ings = [];
    for (let i = 1; i <= 20; i++) {
      const name = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (name && name.trim()) ings.push({ id: i, name, measure: measure || '' });
    }
    if (ings.length) setIngredients(ings);
  }, [id, isEdit, getCustomRecipe, navigate]);

  /* ---- Handlers ---- */
  const handleField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleIngChange = (ingId, field) => (e) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === ingId ? { ...ing, [field]: e.target.value } : ing))
    );
    if (errors.ingredients) setErrors((prev) => ({ ...prev, ingredients: '' }));
  };

  const addIngredient = () =>
    setIngredients((prev) => [...prev, emptyIngredient()]);

  const removeIngredient = (ingId) =>
    setIngredients((prev) => prev.filter((ing) => ing.id !== ingId));

  /* ---- Convert ingredients → MealDB fields ---- */
  const buildMealDBIngredients = () => {
    const fields = {};
    const filled = ingredients.filter((ing) => ing.name.trim());
    for (let i = 0; i < 20; i++) {
      fields[`strIngredient${i + 1}`] = filled[i]?.name.trim() || '';
      fields[`strMeasure${i + 1}`] = filled[i]?.measure.trim() || '';
    }
    return fields;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form, ingredients);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const recipe = {
      ...form,
      strMeal: form.strMeal.trim(),
      strMealThumb: form.strMealThumb.trim() || PLACEHOLDER_IMG,
      strInstructions: form.strInstructions.trim(),
      ...buildMealDBIngredients(),
    };

    if (isEdit) {
      updateCustomRecipe(id, recipe);
      setSubmitted(true);
      setTimeout(() => navigate(`/recipe/${id}`), 800);
    } else {
      const newId = addCustomRecipe(recipe);
      setSubmitted(true);
      setTimeout(() => navigate(`/recipe/${newId}`), 800);
    }
  };

  const previewSrc = form.strMealThumb.trim() || PLACEHOLDER_IMG;

  return (
    <motion.div
      className="add-recipe-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Page Header */}
      <div className="form-page-hero">
        <div className="container">
          <button className="detail-back" onClick={() => navigate(-1)}>
            <FiArrowLeft size={15} /> Back
          </button>
          <h1 className="form-page-title">
            {isEdit ? '✏️ Edit Recipe' : '➕ Add Your Own Recipe'}
          </h1>
          <p className="form-page-sub">
            {isEdit
              ? 'Update your saved recipe below.'
              : 'Create a custom recipe and save it to your collection.'}
          </p>
        </div>
      </div>

      <form className="recipe-form container" onSubmit={handleSubmit} noValidate>

        {/* ── Section 1: Basic Info ── */}
        <div className="form-section">
          <h2 className="form-section-title">Basic Info</h2>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Recipe Name *</label>
            <input
              className={`form-input ${errors.strMeal ? 'input-error' : ''}`}
              type="text"
              placeholder="e.g. Butter Paneer Masala"
              value={form.strMeal}
              onChange={handleField('strMeal')}
            />
            {errors.strMeal && <span className="field-error">{errors.strMeal}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.strCategory}
                onChange={handleField('strCategory')}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cuisine / Area</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. Indian, Italian, Mexican…"
                value={form.strArea}
                onChange={handleField('strArea')}
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Cover Image ── */}
        <div className="form-section">
          <h2 className="form-section-title"><FiImage size={15} /> Cover Image</h2>
          <div className="form-group">
            <label className="form-label">Image URL (optional)</label>
            <input
              className="form-input"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={form.strMealThumb}
              onChange={(e) => {
                setImgError(false);
                handleField('strMealThumb')(e);
              }}
            />
          </div>
          <div className="img-preview-box">
            {!imgError ? (
              <img
                src={previewSrc}
                alt="preview"
                onError={() => setImgError(true)}
              />
            ) : (
              <span>⚠️ Could not load image — a placeholder will be used</span>
            )}
          </div>
        </div>

        {/* ── Section 3: Ingredients ── */}
        <div className="form-section">
          <h2 className="form-section-title">Ingredients</h2>
          {errors.ingredients && (
            <span className="field-error" style={{ display: 'block', marginBottom: '0.75rem' }}>
              {errors.ingredients}
            </span>
          )}

          <div className="ingredient-header-row">
            <span className="ing-col-label">Ingredient</span>
            <span className="ing-col-label">Amount / Measure</span>
            <span />
          </div>

          <div className="ingredient-list">
            <AnimatePresence>
              {ingredients.map((ing, idx) => (
                <motion.div
                  key={ing.id}
                  className="ingredient-form-row"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    className="form-input"
                    type="text"
                    placeholder={`Ingredient ${idx + 1}`}
                    value={ing.name}
                    onChange={handleIngChange(ing.id, 'name')}
                  />
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. 2 cups"
                    value={ing.measure}
                    onChange={handleIngChange(ing.id, 'measure')}
                  />
                  <button
                    type="button"
                    className="btn-remove-ing"
                    onClick={() => removeIngredient(ing.id)}
                    title="Remove ingredient"
                    disabled={ingredients.length === 1}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button type="button" className="btn-add-ing" onClick={addIngredient}>
            <FiPlus size={14} /> Add Ingredient
          </button>
        </div>

        {/* ── Section 4: Instructions ── */}
        <div className="form-section">
          <h2 className="form-section-title">Instructions</h2>
          <div className="form-group">
            <label className="form-label">Step-by-step instructions *</label>
            <textarea
              className={`form-textarea ${errors.strInstructions ? 'input-error' : ''}`}
              placeholder="Describe how to prepare this recipe step by step…"
              value={form.strInstructions}
              onChange={handleField('strInstructions')}
              rows={8}
            />
            {errors.strInstructions && (
              <span className="field-error">{errors.strInstructions}</span>
            )}
            <span className="char-count">{form.strInstructions.length} characters</span>
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="form-submit-area">
          <motion.button
            type="submit"
            className={`btn-submit ${submitted ? 'btn-success' : ''}`}
            disabled={submitted}
            whileTap={{ scale: 0.97 }}
          >
            {submitted ? (
              <><FiCheck size={16} /> {isEdit ? 'Saved!' : 'Recipe Added!'}</>
            ) : (
              <>{isEdit ? '💾 Save Changes' : '➕ Add Recipe'}</>
            )}
          </motion.button>
          <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>

      </form>
    </motion.div>
  );
}
