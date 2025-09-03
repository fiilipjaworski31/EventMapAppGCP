// frontend/src/components/Navbar.jsx

import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './Navbar.css'; // We'll create this CSS file for styling

// A simple SVG component for the search icon
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const Navbar = ({ onSearch }) => {
  const { currentUser } = useAuth(); // Pobierz informacje o aktualnym użytkowniku
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search: searchTerm, date: selectedDate });
    setShowSearch(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo">EventMap</Link>
      </div>
      
      <div className="nav-center">
        {/* Pokazuj "Dodaj Wydarzenie" tylko dla zalogowanych użytkowników */}
        {currentUser && (
          <NavLink to="/add-event" className="nav-link">Dodaj Wydarzenie</NavLink>
        )}
      </div>

      <div className="nav-right">
        <div className="nav-search">
          <button onClick={() => setShowSearch(!showSearch)} className="search-toggle-button">
            <SearchIcon />
          </button>
          {showSearch && (
            <form onSubmit={handleSubmit} className="search-form-popup">
              <input type="text" placeholder="Szukaj..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              <button type="submit">Filtruj</button>
            </form>
          )}
        </div>
        
        {/* Warunkowo wyświetlaj linki w zależności od stanu logowania */}
        {currentUser ? (
          <div className="nav-auth">
            <span className="nav-username">Witaj, {currentUser.email}</span>
            <button onClick={handleLogout} className="nav-link logout-button">
              Wyloguj się
            </button>
          </div>
        ) : (
          <div className="nav-auth">
            <NavLink to="/register" className="nav-link">Rejestracja</NavLink>
            <NavLink to="/login" className="nav-link">Zaloguj się</NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;