// File: src/components/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';
import { jwtDecode } from 'jwt-decode';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errs.email = 'Please enter a valid email address';
    }
    if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    return errs;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors(errs => ({ ...errs, [name]: null, form: null }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userEmail: form.email,
        Password: form.password
      };

      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/food_blog/autenticate/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      const data = await res.json();
      // LoginAppCtrl returns { status, message, token } always HTTP 200
      if (data.status === 200) {
        // use AuthContext to store token and update auth state
        const rawToken = data.token;
        // decode to get userId
        const { subject: userId } = jwtDecode(rawToken);
        // store both token & userId in context
        login(rawToken, form.remember);
        navigate('/blogs', { replace: true });
      } else {
        setErrors({ form: data.message || 'Login failed. Please try again.' });
      }
    } catch {
      setErrors({ form: 'Network error. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Login</h1>
        {errors.form && <div className="form-error">{errors.form}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          {/* Remember Me */}
          <div className="form-group checkbox-group">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={form.remember}
              onChange={handleChange}
            />
            <label htmlFor="remember">Remember Me</label>
          </div>

          {/* Submit */}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? <div className="spinner" /> : 'Login'}
          </button>
        </form>

        <p className="switch-auth">
          Don’t have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}
