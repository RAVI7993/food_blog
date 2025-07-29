import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './PostDetail.css';

export default function PostDetail() {
  const { id } = useParams();                // slug or numeric ID
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [post, setPost]     = useState(null);
  const [loading, setLoading] = useState(true);
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    fetch(`${apiBase}/food_blog/posts/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(({ status, result, message }) => {
        if (status === 200) setPost(result);
        else throw new Error(message);
      })
      .catch(err => {
        console.error(err);
        alert('Post not found');
        navigate('/blogs');
      })
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, navigate, apiBase]);

  if (loading) return <div className="post-detail">Loading…</div>;
  if (!post)   return <div className="post-detail">Post not found</div>;

  // Destructure all the advanced fields:
  const {
    title,
    slug,
    excerpt,
    ingredients = [],
    steps = [],
    category,
    cuisine,
    tags = [],
    dietary_tags: dietaryTags = [],
    prep_time_min,
    cook_time_min,
    servings,
    difficulty,
    nutrition_cal,
    nutrition_pro,
    nutrition_fat,
    nutrition_carbs,
    publish_date,
    featured_image,
    video_url,
    meta_title,
    meta_description
  } = post;

  return (
    <div className="post-detail">
      <h1>{title}</h1>

      {/* Featured image */}
      {featured_image && (
        <img src={featured_image} alt={title} className="post-image" />
      )}

      {/* Excerpt */}
      {excerpt && <p className="excerpt"><em>{excerpt}</em></p>}

      {/* Meta badges */}
      <div className="post-meta">
        {category && <span className="badge">{category}</span>}
        {cuisine  && <span className="badge">{cuisine}</span>}
        <span className="badge">
          {new Date(publish_date).toLocaleString()}
        </span>
        <span className="badge">Prep: {prep_time_min}m</span>
        <span className="badge">Cook: {cook_time_min}m</span>
        <span className="badge">Serves: {servings}</span>
        <span className="badge">Difficulty: {difficulty}</span>
      </div>

      {/* Ingredients */}
      <section className="section">
        <h2>Ingredients</h2>
        <ul>
          {ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
      </section>

      {/* Preparation Steps */}
      <section className="section">
        <h2>Preparation Steps</h2>
        <ol>
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* Full content (HTML) */}
      {post.content && (
        <section className="section">
          <h2>Full Recipe</h2>
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: post.content }}
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
      <div className="tags">
        {dietaryTags.length > 0 &&
          dietaryTags.map(t => (
            <span key={t.id} className="tag dietary">
              {t.name}
            </span>
          ))}
        {tags.length > 0 &&
          tags.map(t => (
            <span key={t.id} className="tag">
              {t.name}
            </span>
          ))}
      </div>

      {/* Nutrition facts */}
      <section className="section nutrition">
        <h2>Nutrition Facts</h2>
        <ul>
          <li>Calories: {nutrition_cal}</li>
          <li>Protein: {nutrition_pro}g</li>
          <li>Fat: {nutrition_fat}g</li>
          <li>Carbs: {nutrition_carbs}g</li>
        </ul>
      </section>

      {/* SEO fields */}
      <section className="section seo">
        <h2>SEO</h2>
        <p>
          <strong>Meta Title:</strong> {meta_title || '—'}
        </p>
        <p>
          <strong>Meta Description:</strong> {meta_description || '—'}
        </p>
      </section>

      {/* Actions */}
      <div className="actions">
        <Link to={`/posts/edit/${slug}`} className="btn">
          Edit
        </Link>
        <Link to="/blogs" className="btn">
          Back to My Blogs
        </Link>
      </div>
    </div>
  );
}
