// File: src/components/NavBar.js
import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // your context
import './NavBar.css';

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(open => !open);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  // Define two sets of nav items
  const publicLinks = [
    { to: '/',     label: 'Home'       },
    { to: '/about',label: 'About Us'   },
    { to: '/contact', label: 'Contact' },
    { to: '/login',  label: 'Login'    },
    { to: '/register', label: 'Register'}
  ];

  const privateLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/blogs',     label: 'Blogs'  },
    { to: '/profile',   label: 'Profile'   },
    { to: '/favourites',label: 'Favourites'},
  ];

  return (
    <header className="navbar-container">
      <div className="logo">
        <NavLink to="/" onClick={closeMenu}>🍴 FoodBlog</NavLink>
      </div>

      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`navbar ${menuOpen ? 'open' : ''}`}>
        {isAuthenticated
          ? privateLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className="nav-item"
                activeclassname="active"
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))
          : publicLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className="nav-item"
                activeclassname="active"
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))
        }

        {isAuthenticated && (
          <button className="nav-item logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}
