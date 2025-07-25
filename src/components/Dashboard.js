import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ posts: 0, favorites: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Grab token from either storage
  const token =
    localStorage.getItem('fb_token') ||
    sessionStorage.getItem('fb_token');

  useEffect(() => {
    if (!token) {
      return navigate('/login', { replace: true });
    }

    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5050';

    async function loadDashboard() {
      try {
        const [postsRes, favRes] = await Promise.all([
          fetch(`${apiBase}/food_blog/post/getall`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${apiBase}/food_blog/favorites/user`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const postsData = await postsRes.json();
        const favData = await favRes.json();

        // postsData.results is an array of posts
        const posts = postsData.results || [];
        const favs  = favData.results  || [];

        setStats({ posts: posts.length, favorites: favs.length });
        setRecent(posts.slice(-5).reverse()); // last 5 posts
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate, token]);

  if (loading) {
    return <div className="dashboard-page">Loading…</div>;
  }

  return (
    <div className="dashboard-page">
      <h1>Your Dashboard</h1>

      <div className="stats-cards">
        <div className="card">
          <h2>{stats.posts}</h2>
          <p>My Posts</p>
        </div>
        <div className="card">
          <h2>{stats.favorites}</h2>
          <p>Favorites</p>
        </div>
      </div>

      <section className="recent-posts">
        <h2>Recent Posts</h2>
        {recent.length ? (
          <ul>
            {recent.map(post => (
              <li key={post.id}>
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
                <span className="date">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>You haven’t written any posts yet. <Link to="/create">Create one now!</Link></p>
        )}
      </section>
    </div>
  );
}
