// File: src/components/Profile.js

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate }                from 'react-router-dom';
import { AuthContext }               from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { token, user, logout } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    // redirect if not logged in
    if (!token || !user?.id) {
      navigate('/login', { replace: true });
      return;
    }

    (async () => {
      setLoading(true);
      try {
        // include userId in query
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5050'}` +
          `/food_blog/autenticate/profile?userId=${encodeURIComponent(user.id)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        if (body.status !== 200) {
          throw new Error(body.message || 'Failed to load profile');
        }
        setProfile(body.result);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user, navigate]);

  if (loading) {
    return <div className="profile-page"><p>Loading profile…</p></div>;
  }
  if (error) {
    return (
      <div className="profile-page error">
        <p>Error: {error}</p>
        <button
          className="btn logout"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          Logout
        </button>
      </div>
    );
  }
  if (!profile) {
    navigate('/login', { replace: true });
    return null;
  }

  const {
    id,
    userName,
    firstName,
    lastName,
    email,
    address,
    mobileNo,
    created_at,
    updated_at
  } = profile;

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-grid">
        <span>ID:</span>              <span>{id}</span>
        <span>Username:</span>        <span>{userName}</span>
        <span>First Name:</span>      <span>{firstName}</span>
        <span>Last Name:</span>       <span>{lastName}</span>
        <span>Email:</span>           <span>{email}</span>
        <span>Address:</span>         <span>{address || '—'}</span>
        <span>Mobile No:</span>       <span>{mobileNo || '—'}</span>
        <span>Created At:</span>      <span>{new Date(created_at).toLocaleString()}</span>
        <span>Last Updated At:</span> <span>{new Date(updated_at).toLocaleString()}</span>
      </div>

      <button
        className="btn logout"
        onClick={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      >
        Logout
      </button>
    </div>
  );
}
