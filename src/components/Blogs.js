import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Blogs.css';

export default function Blogs() {
  const { userId, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${apiBase}/food_blog/posts/mine?userId=${encodeURIComponent(userId)}`
        );
        const data = await res.json();
        if (data.status === 200) {
          setPosts(data.results);
        } else {
          throw new Error(data.message || 'Failed to load posts');
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [isAuthenticated, userId, navigate, apiBase]);

  const handleDelete = async postId => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(
        `${apiBase}/food_blog/posts/${postId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        }
      );
      const data = await res.json();
      if (data.status === 200) {
        setPosts(p => p.filter(p => p.id !== postId));
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch {
      alert('Network error');
    }
  };

  if (loading) {
    return <div className="blogs-page">Loading your blogs…</div>;
  }
  if (error) {
    return <div className="blogs-page">Error: {error}</div>;
  }

  return (
    <div className="blogs-page">
      <h1>My Blogs</h1>
      {posts.length === 0 ? (
        <p>
          You haven’t written any posts yet.{' '}
          <Link to="/create">Create one now!</Link>
        </p>
      ) : (
        <div className="blogs-grid">
          {posts.map(post => (
            <div key={post.id} className="blog-card">
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="card-image"
                />
              )}
              <div className="card-content">
                <h2 className="card-title">
                  <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                </h2>
                <div className="card-meta">
                  <span className="category">{post.category || '—'}</span>
                  <span className="cuisine">{post.cuisine || '—'}</span>
                  <span className="date">
                    {new Date(post.publish_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="excerpt">{post.excerpt}</p>
                <div className="card-actions">
                  <Link to={`/posts/${post.id}`} className="btn-link">
                    Read More
                  </Link>
                  <Link to={`/posts/edit/${post.id}`} className="btn-link">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
