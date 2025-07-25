import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
    address: '',
    mobileNo: '',
    agree: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.userName.trim())   errs.userName = 'Username is required';
    if (!form.firstName.trim())  errs.firstName = 'First name is required';
    if (!form.lastName.trim())   errs.lastName = 'Last name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      errs.email = 'Please enter a valid email';
    if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm)
      errs.confirm = 'Passwords do not match';
    if (!form.address.trim())
      errs.address = 'Address is required';
    if (!form.mobileNo.match(/^[0-9]{7,15}$/))
      errs.mobileNo = 'Enter a valid phone number';
    if (!form.agree)
      errs.agree = 'You must agree to the Terms & Conditions';
    return errs;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
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
        userName:  form.userName,
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        password:  form.password,
        address:   form.address,
        mobileNo:  form.mobileNo
      };
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/food_blog/autenticate/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      const data = await res.json();
      if (res.ok) {
        navigate('/login', { state: { message: data.message } });
      } else {
        setErrors({ form: data.message || 'Registration failed' });
      }
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Register</h1>
        {errors.form && <div className="form-error">{errors.form}</div>}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className="form-row">
            {/* Username */}
            <div className="form-group">
              <label htmlFor="userName">Username</label>
              <input
                id="userName"
                name="userName"
                type="text"
                value={form.userName}
                onChange={handleChange}
                aria-invalid={!!errors.userName}
              />
              {errors.userName && <span className="error">{errors.userName}</span>}
            </div>

            {/* First Name */}
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && <span className="error">{errors.firstName}</span>}
            </div>
          </div>

          <div className="form-row">
            {/* Last Name */}
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && <span className="error">{errors.lastName}</span>}
            </div>

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
          </div>

          <div className="form-row">
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

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange}
                aria-invalid={!!errors.confirm}
              />
              {errors.confirm && <span className="error">{errors.confirm}</span>}
            </div>
          </div>

          <div className="form-row">
            {/* Address */}
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                aria-invalid={!!errors.address}
              />
              {errors.address && <span className="error">{errors.address}</span>}
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label htmlFor="mobileNo">Mobile Number</label>
              <input
                id="mobileNo"
                name="mobileNo"
                type="tel"
                value={form.mobileNo}
                onChange={handleChange}
                aria-invalid={!!errors.mobileNo}
              />
              {errors.mobileNo && <span className="error">{errors.mobileNo}</span>}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="form-group checkbox-group">
            <input
              id="agree"
              name="agree"
              type="checkbox"
              checked={form.agree}
              onChange={handleChange}
            />
            <label htmlFor="agree">
              I agree to the <a href="/terms">Terms &amp; Conditions</a>
            </label>
          </div>
          {errors.agree && <span className="error">{errors.agree}</span>}

          {/* Submit */}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? <div className="spinner" /> : 'Register'}
          </button>
        </form>

        <p className="switch-auth">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
