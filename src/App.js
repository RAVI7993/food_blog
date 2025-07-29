import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';
import Dashboard from './components/Dashboard';
import Blogs from './components/Blogs';
import CreateBlog from './components/CreateBlog';
import PostDetail from './components/PostDetail';
import EditPost from './components/EditPost';
import PublicPost from './components/PublicPost';
import Profile from './components/Profile';

export default function App() {
  return (
    <div className="App">
      <NavBar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/:slug"  element={<PublicPost />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/create" element={<CreateBlog />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/posts/edit/:id" element={<EditPost />} />
          
        </Routes>
      </div>
    </div>
  );
}
