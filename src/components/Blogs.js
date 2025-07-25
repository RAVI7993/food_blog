import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Blogs.css';

export default function Blogs() {
  const { userId, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      return navigate('/login', { replace: true });
    }

    const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5050'
      }/food_blog/posts/mine?userId=${encodeURIComponent(userId)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.status === 200) setPosts(data.results);
        else console.error(data.message);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, userId, navigate]);

  if (loading) return <div className="blogs-page">Loading your blogs…</div>;

  return (
    <div className="blogs-page">
      <h1>My Blogs</h1>
      {posts.length === 0 && <p>You haven’t written any posts yet.</p>}
      <ul className="blogs-list">
        {posts.map(post => (
          <li key={post.id} className="blogs-item">
            <h2>{post.title}</h2>
            <p>{post.content.slice(0, 100)}…</p>
            {post.video_url && (
              <a href={post.video_url} target="_blank" rel="noreferrer">
                Watch Video
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
