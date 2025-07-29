import React, { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email is required';
    if (!form.message.trim()) errs.message = 'Message cannot be empty';
    return errs;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async e => {
  e.preventDefault();
  const validation = validate();
  if (Object.keys(validation).length) {
    setErrors(validation);
    return;
  }

  try {
    const response = await fetch('http://localhost:5050/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (response.ok) {
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } else {
      setStatus('error');
      console.error('Contact API error:', data.message);
    }
  } catch (err) {
    console.error('Network error:', err);
    setStatus('error');
  }
};


  return (
    <div className="contact-page">
      <h1>Contact Us</h1>

      <div className="contact-grid">
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              aria-invalid={!!errors.name}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

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

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              aria-invalid={!!errors.message}
            />
            {errors.message && <span className="error">{errors.message}</span>}
          </div>

          <button type="submit" className="btn">Send Message</button>

          {status === 'success' && <p className="status success">Thank you! We’ll be in touch soon.</p>}
          {status === 'error'   && <p className="status error">Oops—something went wrong. Please try again.</p>}
        </form>

        <div className="contact-info">
          <h2>Our Office</h2>
          <p>123 Culinary Lane<br/>Food City, FC 45678</p>
          <p>Phone: (123) 456-7890<br/>Email: support@foodblog.com</p>


        </div>
      </div>
    </div>
);
}
