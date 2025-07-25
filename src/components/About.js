// File: src/components/About.js
import React, { useEffect, useState } from 'react';
import { FaUsers, FaPenFancy, FaHeart, FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';
import './About.css';
import raviPhoto from './images/60111.jpg'; // Adjust path as necessary

const teamMembers = [
  {
    id: 1,
    name: 'Ravi Teja',
    role: 'Founder & Developer',
    photo: raviPhoto,
    socials: { twitter: '#', github: '#', linkedin: '#' },
  },
  
];

export default function About() {
  const [stats, setStats] = useState({ users: 0, posts: 0, favorites: 0 });

  // Simple counter animation
  useEffect(() => {
    const target = { users: 1200, posts: 3500, favorites: 8900 };
    let start = { ...stats };
    const duration = 1500;
    const startTime = performance.now();

    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      setStats({
        users: Math.floor(start.users + (target.users - start.users) * progress),
        posts: Math.floor(start.posts + (target.posts - start.posts) * progress),
        favorites: Math.floor(start.favorites + (target.favorites - start.favorites) * progress),
      });
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="about-page">
      {/* Hero Banner */}
      <section className="about-hero">
        <div className="about-hero-overlay">
          <h1>About Food Blog</h1>
          <p>Our passion is connecting food lovers through shared stories, recipes, and videos.</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-mv">
        <div className="mv-card">
          <h2>Our Mission</h2>
          <p>To empower every home cook to share and discover culinary creations in a seamless, engaging community.</p>
        </div>
        <div className="mv-card">
          <h2>Our Vision</h2>
          <p>To become the world’s go-to platform for food inspiration, where multimedia storytelling meets community curation.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="stat">
          <FaUsers size={40} />
          <div className="stat-number">{stats.users.toLocaleString()}</div>
          <div className="stat-label">Registered Users</div>
        </div>
        <div className="stat">
          <FaPenFancy size={40} />
          <div className="stat-number">{stats.posts.toLocaleString()}</div>
          <div className="stat-label">Blog Posts</div>
        </div>
        <div className="stat">
          <FaHeart size={40} />
          <div className="stat-number">{stats.favorites.toLocaleString()}</div>
          <div className="stat-label">Favorites Saved</div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <h2>Meet The Team</h2>
        <div className="team-grid">
          {teamMembers.map(member => (
            <div key={member.id} className="team-card">
              <img src={member.photo} alt={member.name} className="team-photo" />
              <h3>{member.name}</h3>
              <p className="team-role">{member.role}</p>
              <div className="team-socials">
                <a href={member.socials.twitter}><FaTwitter /></a>
                <a href={member.socials.github}><FaGithub /></a>
                <a href={member.socials.linkedin}><FaLinkedin /></a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
