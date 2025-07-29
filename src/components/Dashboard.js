import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useContext(AuthContext);
  const [stats,  setStats ]  = useState({ posts: 0, favorites: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5050';
    const fetchData = async () => {
      try {
        // Fetch posts
        const postsRes = await fetch(
          `${apiBase}/food_blog/posts/mine?userId=${encodeURIComponent(userId)}`
        );
        const postsData = await postsRes.json();
        const posts = postsData.results || [];

        // Fetch favorites
        const favRes = await fetch(
          `${apiBase}/food_blog/favorites/user?userId=${encodeURIComponent(userId)}`
        );
        const favData = await favRes.json();
        const favs = favData.results || [];

        setStats({ posts: posts.length, favorites: favs.length });
        setRecent(posts.slice(-5).reverse()); // show last 5 posts
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, userId, navigate]);

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
          <p>
            You haven’t written any posts yet.{' '}
            <Link to="/create">Create one now!</Link>
          </p>
        )}
      </section>
    </div>
  );
}
