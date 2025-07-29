import React, {
    useState,
    useEffect,
    useContext,
    useCallback,
    useMemo
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useDropzone } from 'react-dropzone';
import Select from 'react-select';
import debounce from 'lodash.debounce';
import axios from 'axios';
import './EditPost.css';

export default function EditPost() {
    const { id } = useParams();                    // slug or numeric ID
    const { userId, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5050';

    // Lookup data
    const [cats, setCats] = useState([]);
    const [cuisines, setCuisines] = useState([]);
    const [tagOptions, setTagOptions] = useState([]);
    const [dietaryTagOptions, setDietaryTagOptions] = useState([]);

    // Form state
    const [form, setForm] = useState({
        title: '',
        slug: '',
        excerpt: '',
        ingredients: [''],
        steps: [''],
        category: '',
        cuisine: '',
        dietaryTags: [],   // array of option objects
        tags: [],          // array of option objects
        prepTime: '',
        cookTime: '',
        servings: '',
        difficulty: 'Easy',
        nutrition: { calories: '', protein: '', fat: '', carbs: '' },
        publishDate: new Date().toISOString().slice(0, 16),
        videoUrl: '',
        metaTitle: '',
        metaDescription: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(true);

    // 1) Load lookup lists once
    useEffect(() => {
        (async () => {
            try {
                const [catRes, cuiRes, tagRes, dietRes] = await Promise.all([
                    axios.get(`${apiBase}/food_blog/categories`),
                    axios.get(`${apiBase}/food_blog/cuisines`),
                    axios.get(`${apiBase}/food_blog/tags`),
                    axios.get(`${apiBase}/food_blog/dietary-tags`)
                ]);
                setCats(catRes.data.results);
                setCuisines(cuiRes.data.results);
                setTagOptions((tagRes.data.results || []).map(t => ({ value: t.id, label: t.name })));
                setDietaryTagOptions((dietRes.data.results || []).map(d => ({ value: d.id, label: d.name })));
            } catch (err) {
                console.error('Failed to load lookups', err);
            }
        })();
    }, [apiBase]);

    // 2) Load post data once when `id` or auth changes
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
            return;
        }
        setLoading(true);
        axios.get(`${apiBase}/food_blog/posts/${id}`)
            .then(({ data }) => {
                if (data.status !== 200) throw new Error(data.message);
                const p = data.result;
                // Convert publish_date to datetime-local
                const dt = new Date(p.publish_date);
                const pad = n => String(n).padStart(2, '0');
                const local = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}` +
                    `T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

                setForm({
                    title: p.title,
                    slug: p.slug,
                    excerpt: p.excerpt,
                    ingredients: p.ingredients || [''],
                    steps: p.steps || [''],
                    category: p.category_id || '',
                    cuisine: p.cuisine_id || '',
                    dietaryTags: (p.dietary_tags || []).map(d => ({ value: d.id, label: d.name })),
                    tags: (p.tags || []).map(t => ({ value: t.id, label: t.name })),
                    prepTime: p.prep_time_min || '',
                    cookTime: p.cook_time_min || '',
                    servings: p.servings || '',
                    difficulty: p.difficulty || 'Easy',
                    nutrition: {
                        calories: p.nutrition_cal || '',
                        protein: p.nutrition_pro || '',
                        fat: p.nutrition_fat || '',
                        carbs: p.nutrition_carbs || ''
                    },
                    publishDate: local,
                    videoUrl: p.video_url || '',
                    metaTitle: p.meta_title || '',
                    metaDescription: p.meta_description || ''
                });
                setPreview(p.featured_image);
            })
            .catch(err => {
                console.error('Failed to load post', err);
                alert('Could not load post data');
                navigate('/blogs');
            })
            .finally(() => setLoading(false));
    }, [apiBase, id, isAuthenticated, navigate]);

    // Generic change
    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    // Ingredients & Steps handlers
    const updateList = (key, idx, val) => {
        setForm(f => {
            const arr = [...f[key]];
            arr[idx] = val;
            return { ...f, [key]: arr };
        });
    };
    const addList = key =>
        setForm(f => ({ ...f, [key]: [...f[key], ''] }));
    const removeList = (key, idx) =>
        setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

    // React-select handlers
    const onDietaryChange = opts =>
        setForm(f => ({ ...f, dietaryTags: opts || [] }));
    const onTagsChange = opts =>
        setForm(f => ({ ...f, tags: opts || [] }));

    // Dropzone for image
    const onDrop = useCallback(files => {
        const file = files[0];
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'image/*': [] }, maxFiles: 1
    });

    // Debounced videoUrl
    const handleSearchDebounced = useMemo(() =>
        debounce(q => setForm(f => ({ ...f, videoUrl: q })), 300),
        []);

    // Submit
    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        try {
            const fd = new FormData();
            fd.append('userId', userId);
            fd.append('title', form.title);
            fd.append('slug', form.slug);
            fd.append('excerpt', form.excerpt);
            form.ingredients.forEach(i => fd.append('ingredients', i));
            form.steps.forEach(s => fd.append('steps', s));
            fd.append('categoryId', form.category);
            fd.append('cuisineId', form.cuisine);
            form.dietaryTags.forEach(d => fd.append('dietaryTags', d.value));
            form.tags.forEach(t => fd.append('tags', t.value));
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

            const res = await axios.put(
                `${apiBase}/food_blog/posts/${id}`,
                fd,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: p => setUploadProgress(Math.round((p.loaded * 100) / p.total))
                }
            );

            if (res.data.status === 200) {
                alert('Post updated!');
                navigate(`/posts/${form.slug}`);
            } else {
                throw new Error(res.data.message);
            }
        } catch (err) {
            console.error('Update failed', err);
            alert(err.message || 'Failed to update');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="edit-post"><p>Loading…</p></div>;
    }

    return (
        <div className="edit-post">
            <h1>Edit Recipe</h1>
            <form onSubmit={handleSubmit}>

                {/* Title & Slug */}
                <div className="row">
                    <div className="field">
                        <label>Title *</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="field">
                        <label>Slug *</label>
                        <input
                            name="slug"
                            value={form.slug}
                            onChange={handleChange}
                            required
                        />
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
                        required
                    />
                </div>

                {/* Ingredients */}
                <div className="field">
                    <label>Ingredients *</label>
                    {form.ingredients.map((ing, i) => (
                        <div key={i} className="sub-row">
                            <input
                                value={ing}
                                onChange={e => updateList('ingredients', i, e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => removeList('ingredients', i)}>×</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addList('ingredients')}>+ Add Ingredient</button>
                </div>

                {/* Steps */}
                <div className="field">
                    <label>Preparation Steps *</label>
                    {form.steps.map((st, i) => (
                        <div key={i} className="sub-row">
                            <textarea
                                rows="2"
                                value={st}
                                onChange={e => updateList('steps', i, e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => removeList('steps', i)}>×</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addList('steps')}>+ Add Step</button>
                </div>

                {/* Category / Cuisine */}
                <div className="row">
                    <div className="field">
                        <label>Category *</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select…</option>
                            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="field">
                        <label>Cuisine</label>
                        <select
                            name="cuisine"
                            value={form.cuisine}
                            onChange={handleChange}
                        >
                            <option value="">—</option>
                            {cuisines.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Tags */}
                <div className="row">
                    <div className="field">
                        <label>Dietary Tags</label>
                        <Select
                            isMulti
                            options={dietaryTagOptions}
                            value={form.dietaryTags}
                            onChange={onDietaryChange}
                        />
                    </div>
                    <div className="field">
                        <label>General Tags</label>
                        <Select
                            isMulti
                            options={tagOptions}
                            value={form.tags}
                            onChange={onTagsChange}
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
                            required
                        />
                    </div>
                    <div className="field">
                        <label>Cook Time (min) *</label>
                        <input
                            name="cookTime"
                            type="number"
                            value={form.cookTime}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="field">
                        <label>Servings *</label>
                        <input
                            name="servings"
                            type="number"
                            value={form.servings}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="field">
                        <label>Difficulty</label>
                        <select
                            name="difficulty"
                            value={form.difficulty}
                            onChange={handleChange}
                        >
                            {['Easy', 'Medium', 'Hard'].map(d => (
                                <option key={d} value={d}>{d}</option>
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
                                type="number"
                                value={form.nutrition[n]}
                                onChange={e => {
                                    const v = e.target.value;
                                    setForm(f => ({
                                        ...f,
                                        nutrition: { ...f.nutrition, [n]: v }
                                    }));
                                }}
                            />
                        </div>
                    ))}
                </fieldset>

                {/* Publish Date */}
                <div className="field">
                    <label>Publish On</label>
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
                    <div
                        {...getRootProps()}
                        className={`dropzone ${isDragActive ? 'active' : ''}`}
                    >
                        <input {...getInputProps()} />
                        {preview
                            ? <img src={preview} className="preview" alt="Preview" />
                            : <p>Drag & drop or click to select</p>
                        }
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <p>Uploading: {uploadProgress}%</p>
                    )}
                </div>

                {/* Video URL */}
                <div className="field">
                    <label>Video URL</label>
                    <input
                        name="videoUrl"
                        type="url"
                        defaultValue={form.videoUrl}
                        onChange={e => handleSearchDebounced(e.target.value)}
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

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Saving…' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}
