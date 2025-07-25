import React, { useState, useEffect } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  // Fetch latest posts on mount
  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch('/api/posts?limit=6'); // your API
        const data = await res.json();
        setPosts(data);
        setFiltered(data);
      } catch (err) {
        console.error('Failed to load posts', err);
      }
    }
    loadPosts();
  }, []);

  // Filter posts by title as user types
  useEffect(() => {
    setFiltered(
      posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, posts]);

  return (
    <div className="home-page">
      {/* Hero section */}
      <section className="hero">
        <div className="hero-overlay">
          <h1 className="hero-title">Discover Delicious Recipes</h1>
          <p className="hero-subtitle">
            From quick weeknight dinners to gourmet weekend feasts.
          </p>
          <input
            type="text"
            className="hero-search"
            placeholder="Search recipes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        {['Vegan', 'Desserts', 'Quick Meals', 'Healthy', 'Baking'].map(cat => (
          <button key={cat} className="cat-badge">
            {cat}
          </button>
        ))}
      </section>

      {/* Latest posts */}
      <section className="posts-grid">
        {filtered.length ? (
          filtered.map(post => (
            <article key={post.id} className="post-card">
              <Link to={`/posts/${post.id}`}>
                <div
                  className="post-image"
                  style={{ backgroundImage: `url(${post.imageUrl})` }}
                />
                <div className="post-content">
                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <span className="read-more">Read More →</span>
                </div>
              </Link>
            </article>
          ))
        ) : (
          <p className="no-results">No recipes found.</p>
        )}
      </section>
    </div>
  );
}