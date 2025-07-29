import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './CreateBlog.css';

export default function CreateBlog() {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useContext(AuthContext);

  // Form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    ingredients: [''],
    steps: [''],
    category: '',
    cuisine: '',
    dietaryTags: '',
    tags: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'Easy',
    nutrition: { calories:'', protein:'', fat:'', carbs:'' },
    publishDate: new Date().toISOString().slice(0,16),
    videoUrl: '',
    metaTitle: '',
    metaDescription: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  // Generic handler for text inputs
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(errs => ({ ...errs, [name]: null }));
  };

  // Ingredients
  const updateIngredient = (idx, val) => {
    setForm(f => {
      const arr = [...f.ingredients];
      arr[idx] = val;
      return { ...f, ingredients: arr };
    });
  };
  const addIngredient = () =>
    setForm(f => ({ ...f, ingredients: [...f.ingredients, ''] }));
  const removeIngredient = idx =>
    setForm(f => ({
      ...f,
      ingredients: f.ingredients.filter((_, i) => i !== idx)
    }));

  // Steps
  const updateStep = (idx, val) => {
    setForm(f => {
      const arr = [...f.steps];
      arr[idx] = val;
      return { ...f, steps: arr };
    });
  };
  const addStep = () =>
    setForm(f => ({ ...f, steps: [...f.steps, ''] }));
  const removeStep = idx =>
    setForm(f => ({
      ...f,
      steps: f.steps.filter((_, i) => i !== idx)
    }));

  // Image file + preview
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Basic validation
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.slug.trim())  errs.slug  = 'Slug is required';
    if (!form.excerpt.trim()) errs.excerpt = 'Excerpt is required';
    if (!form.category) errs.category = 'Category is required';
    if (isNaN(form.servings) || !form.servings)
      errs.servings = 'Servings must be a number';
    if (isNaN(form.prepTime) || !form.prepTime)
      errs.prepTime = 'Prep time required';
    if (isNaN(form.cookTime) || !form.cookTime)
      errs.cookTime = 'Cook time required';
    if (!form.ingredients.every(i => i.trim()))
      errs.ingredients = 'Fill or remove all ingredients';
    if (!form.steps.every(s => s.trim()))
      errs.steps = 'Fill or remove all steps';
    return errs;
  };

  // Submit via FormData
  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const fd = new FormData();
    fd.append('userId', userId);
    fd.append('title', form.title);
    fd.append('slug', form.slug);
    fd.append('excerpt', form.excerpt);
    form.ingredients.forEach(ing => fd.append('ingredients', ing));
    form.steps.forEach(st => fd.append('steps', st));
    fd.append('categoryId', form.category);
    fd.append('cuisineId', form.cuisine);
    form.dietaryTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .forEach(dt => fd.append('dietaryTags', dt));
    form.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .forEach(tag => fd.append('tags', tag));
    fd.append('prepTime', form.prepTime);
    fd.append('cookTime', form.cookTime);
    fd.append('servings', form.servings);
    fd.append('difficulty', form.difficulty);
    fd.append('nutrition', JSON.stringify(form.nutrition));
    fd.append('publishDate', new Date(form.publishDate).toISOString());
    if (imageFile) fd.append('featuredImage', imageFile);
    fd.append('videoUrl', form.videoUrl);
    fd.append('metaTitle', form.metaTitle);
    fd.append('metaDescription', form.metaDescription);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/food_blog/posts/create`,
        {
          method: 'POST',
          body: fd
        }
      );
      const data = await res.json();
      if (data.status === 201) {
        navigate('/blogs', { replace: true });
      } else {
        alert(data.message || 'Create failed');
      }
    } catch {
      alert('Network error');
    }
  };

  return (
    <div className="create-blog-advanced">
      <h1>Create New Recipe</h1>
      <form onSubmit={handleSubmit}>
        {/* Title & Slug */}
        <div className="row">
          <div className="field">
            <label>Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
            />
            {errors.title && (
              <small className="error">{errors.title}</small>
            )}
          </div>
          <div className="field">
            <label>Slug *</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
            />
            {errors.slug && (
              <small className="error">{errors.slug}</small>
            )}
          </div>
        </div>

        {/* Excerpt */}
        <div className="field">
          <label>Excerpt *</label>
          <textarea
            name="excerpt"
            rows="2"
            value={form.excerpt}
            onChange={handleChange}
          />
          {errors.excerpt && (
            <small className="error">{errors.excerpt}</small>
          )}
        </div>

        {/* Ingredients */}
        <div className="field">
          <label>Ingredients *</label>
          {form.ingredients.map((ing, i) => (
            <div key={i} className="sub-row">
              <input
                value={ing}
                onChange={e => updateIngredient(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeIngredient(i)}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={addIngredient}>
            + Add Ingredient
          </button>
          {errors.ingredients && (
            <small className="error">{errors.ingredients}</small>
          )}
        </div>

        {/* Steps */}
        <div className="field">
          <label>Preparation Steps *</label>
          {form.steps.map((step, i) => (
            <div key={i} className="sub-row">
              <textarea
                rows="2"
                value={step}
                onChange={e => updateStep(i, e.target.value)}
              />
              <button type="button" onClick={() => removeStep(i)}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={addStep}>
            + Add Step
          </button>
          {errors.steps && (
            <small className="error">{errors.steps}</small>
          )}
        </div>

        {/* Category & Cuisine */}
        <div className="row">
          <div className="field">
            <label>Category *</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
            />
            {errors.category && (
              <small className="error">{errors.category}</small>
            )}
          </div>
          <div className="field">
            <label>Cuisine</label>
            <input
              name="cuisine"
              value={form.cuisine}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="row">
          <div className="field">
            <label>Dietary Tags</label>
            <input
              name="dietaryTags"
              value={form.dietaryTags}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>General Tags</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Times & Servings */}
        <div className="row">
          <div className="field">
            <label>Prep Time (min) *</label>
            <input
              name="prepTime"
              type="number"
              value={form.prepTime}
              onChange={handleChange}
            />
            {errors.prepTime && (
              <small className="error">{errors.prepTime}</small>
            )}
          </div>
          <div className="field">
            <label>Cook Time (min) *</label>
            <input
              name="cookTime"
              type="number"
              value={form.cookTime}
              onChange={handleChange}
            />
            {errors.cookTime && (
              <small className="error">{errors.cookTime}</small>
            )}
          </div>
          <div className="field">
            <label>Servings *</label>
            <input
              name="servings"
              type="number"
              value={form.servings}
              onChange={handleChange}
            />
            {errors.servings && (
              <small className="error">{errors.servings}</small>
            )}
          </div>
          <div className="field">
            <label>Difficulty</label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
            >
              {['Easy', 'Medium', 'Hard'].map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nutrition */}
        <fieldset className="nutrition">
          <legend>Nutrition Facts</legend>
          {['calories', 'protein', 'fat', 'carbs'].map(n => (
            <div key={n} className="sub-row">
              <label>{n.charAt(0).toUpperCase() + n.slice(1)}</label>
              <input
                name={`nut_${n}`}
                type="number"
                value={form.nutrition[n]}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    nutrition: { ...f.nutrition, [n]: e.target.value }
                  }))
                }
              />
            </div>
          ))}
        </fieldset>

        {/* Publish Date */}
        <div className="field">
          <label>Publish on</label>
          <input
            type="datetime-local"
            name="publishDate"
            value={form.publishDate}
            onChange={handleChange}
          />
        </div>

        {/* Featured Image */}
        <div className="field">
          <label>Featured Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="image-preview"
            />
          )}
        </div>

        {/* Video URL */}
        <div className="field">
          <label>Video URL</label>
          <input
            name="videoUrl"
            type="url"
            value={form.videoUrl}
            onChange={handleChange}
          />
        </div>

        {/* SEO */}
        <div className="field">
          <label>Meta Title</label>
          <input
            name="metaTitle"
            value={form.metaTitle}
            onChange={handleChange}
          />
        </div>
        <div className="field">
          <label>Meta Description</label>
          <textarea
            name="metaDescription"
            rows="2"
            value={form.metaDescription}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn">
          Publish Recipe
        </button>
      </form>
    </div>
  );
}
