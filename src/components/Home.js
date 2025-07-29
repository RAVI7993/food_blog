import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import debounce from 'lodash.debounce';
import './Home.css';

export default function Home() {
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  const [posts, setPosts]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch]       = useState('');
  const [activeCat, setActiveCat] = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // 1️⃣ Load categories + latest posts on mount
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        // Fetch categories
        const catRes = await fetch(`${apiBase}/food_blog/categories`);
        if (!catRes.ok) throw new Error(`Categories HTTP ${catRes.status}`);
        const catJson = await catRes.json();
        if (catJson.status !== 200) throw new Error(catJson.message);
        // Fetch latest 6 posts
        const postRes = await fetch(`${apiBase}/food_blog/posts/all?limit=6`);
        if (!postRes.ok) throw new Error(`Posts HTTP ${postRes.status}`);
        const postJson = await postRes.json();
        if (postJson.status !== 200) throw new Error(postJson.message);

        if (!cancelled) {
          setCategories(catJson.results);
          setPosts(postJson.results);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [apiBase]);

  // 2️⃣ Debounced search input
  const handleSearchDebounced = useMemo(
    () => debounce(q => setSearch(q.trim()), 300),
    []
  );
  const onSearchChange = e => handleSearchDebounced(e.target.value);

  // 3️⃣ Compute filtered posts
  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchCat = activeCat ? p.category === activeCat : true;
      const q = search.toLowerCase();
      return matchCat && (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q)
      );
    });
  }, [posts, activeCat, search]);

  if (loading) return <div className="home-page"><div className="loader">Loading…</div></div>;
  if (error)   return <div className="home-page error">Error: {error}</div>;

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay">
          <h1>Discover Delicious Recipes</h1>
          <p>From quick weeknight dinners to gourmet weekend feasts.</p>
          <input
            type="text"
            placeholder="Search recipes..."
            onChange={onSearchChange}
            className="hero-search"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <button
          className={`cat-badge ${activeCat === '' ? 'active' : ''}`}
          onClick={() => setActiveCat('')}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`cat-badge ${activeCat === cat.name ? 'active' : ''}`}
            onClick={() => setActiveCat(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </section>

      {/* Posts Grid */}
      <section className="posts-grid">
        {filtered.length > 0 ? (
          filtered.map(post => (
            <article key={post.id} className="post-card">
              <Link to={`/posts/${post.id}`}>
                <div
                  className="post-image"
                  style={{ backgroundImage: `url(${post.featured_image})` }}
                />
                <div className="post-content">
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <div className="post-meta">
                    <span>{post.category}</span>
                    <span>{post.cuisine}</span>
                    <span className="read-more">Read More →</span>
                  </div>
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
