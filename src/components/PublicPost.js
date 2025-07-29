import React, { useState, useEffect } from 'react';
import { useParams, Link }     from 'react-router-dom';
import './PostDetail.css'; // reuse your PostDetail styles

export default function PublicPost() {
  const { slug } = useParams();
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  const [post, setPost]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${apiBase}/food_blog/posts/${encodeURIComponent(slug)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        if (body.status !== 200) throw new Error(body.message);
        if (!cancelled) setPost(body.result);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [apiBase, slug]);

  if (loading) {
    return <div className="post-detail"><p>Loading…</p></div>;
  }
  if (error) {
    return (
      <div className="post-detail error">
        <p>Oops: {error}</p>
        <Link to="/" className="btn">← Back to Home</Link>
      </div>
    );
  }
  if (!post) {
    return (
      <div className="post-detail">
        <p>Recipe not found.</p>
        <Link to="/" className="btn">← Back to Home</Link>
      </div>
    );
  }

  const {
    title,
    excerpt,
    content,
    featured_image,
    video_url,
    publish_date,

    category,
    cuisine,

    ingredients = [],
    steps       = [],

    dietary_tags: dietaryTags = [],
    tags         = [],

    prep_time_min,
    cook_time_min,
    servings,
    difficulty,

    nutrition_cal,
    nutrition_pro,
    nutrition_fat,
    nutrition_carbs,

    meta_title,
    meta_description
  } = post;

  return (
    <div className="post-detail">
      <Link to="/" className="btn" style={{ marginBottom: '1rem' }}>
        ← Back to Home
      </Link>

      <h1>{title}</h1>

      <div className="post-meta">
        {category && <span className="badge">{category}</span>}
        {cuisine  && <span className="badge">{cuisine}</span>}
        {publish_date && (
          <span className="badge">
            {new Date(publish_date).toLocaleDateString()}
          </span>
        )}
        <span className="badge">Prep: {prep_time_min}m</span>
        <span className="badge">Cook: {cook_time_min}m</span>
        <span className="badge">Serves: {servings}</span>
        <span className="badge">Difficulty: {difficulty}</span>
      </div>

      {featured_image && (
        <img
          src={featured_image}
          alt={title}
          className="post-image"
        />
      )}

      {excerpt && <p className="excerpt"><em>{excerpt}</em></p>}

      {/* Ingredients */}
      {ingredients.length > 0 && (
        <section className="section">
          <h2>Ingredients</h2>
          <ul>
            {ingredients.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <section className="section">
          <h2>Preparation Steps</h2>
          <ol>
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      {/* Full content */}
      {content && (
        <section className="section">
          <h2>Full Recipe</h2>
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </section>
      )}

      {/* Video */}
      {video_url && (
        <p className="video-link">
          <a href={video_url} target="_blank" rel="noreferrer">
            ▶ Watch Video
          </a>
        </p>
      )}

      {/* Tags */}
      {(dietaryTags.length > 0 || tags.length > 0) && (
        <div className="tags">
          {dietaryTags.map(t => (
            <span key={t.id} className="tag dietary">
              {t.name}
            </span>
          ))}
          {tags.map(t => (
            <span key={t.id} className="tag">
              {t.name}
            </span>
          ))}
        </div>
      )}

      {/* Nutrition */}
      <section className="section nutrition">
        <h2>Nutrition Facts</h2>
        <ul>
          <li>Calories: {nutrition_cal}</li>
          <li>Protein: {nutrition_pro}g</li>
          <li>Fat: {nutrition_fat}g</li>
          <li>Carbs: {nutrition_carbs}g</li>
        </ul>
      </section>

      {/* SEO */}
      <section className="section seo">
        <h2>SEO</h2>
        <p><strong>Meta Title:</strong> {meta_title || '—'}</p>
        <p><strong>Meta Description:</strong> {meta_description || '—'}</p>
      </section>
    </div>
  );
}
