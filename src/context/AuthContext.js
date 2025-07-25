import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken]           = useState(null);
  const [userId, setUserId]         = useState(null);
  const [isAuthenticated, setAuthenticated] = useState(false);

  // On mount, load from storage
  useEffect(() => {
    const storedToken = localStorage.getItem('fb_token') || sessionStorage.getItem('fb_token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const { subject } = jwtDecode(storedToken);
        setUserId(subject);
        setAuthenticated(true);
      } catch {
        // invalid token in storage
        localStorage.removeItem('fb_token');
        sessionStorage.removeItem('fb_token');
      }
    }
  }, []);

  // Call on successful login
  function login(newToken, remember) {
    // decode userId
    const { subject } = jwtDecode(newToken);
    if (remember) localStorage.setItem('fb_token', newToken);
    else          sessionStorage.setItem('fb_token', newToken);

    setToken(newToken);
    setUserId(subject);
    setAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem('fb_token');
    sessionStorage.removeItem('fb_token');
    setToken(null);
    setUserId(null);
    setAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ token, userId, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
