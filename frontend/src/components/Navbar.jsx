import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Mapa Wydarzeń</Link>
      <div className="nav-links">
        <Link to="/add-event">Dodaj wydarzenie</Link>
        <Link to="/login">Zaloguj się</Link>
      </div>
    </nav>
  );
};

export default Navbar;