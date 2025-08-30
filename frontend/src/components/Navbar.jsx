import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importuj hook useAuth
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './Navbar.css';

const Navbar = () => {
  const { currentUser } = useAuth(); // Pobierz informacje o użytkowniku z kontekstu

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Wylogowano pomyślnie!');
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Mapa Wydarzeń</Link>
      <div className="nav-links">
        {currentUser ? (
          <>
            <span>Witaj, {currentUser.email}</span>
            <Link to="/add-event">Dodaj wydarzenie</Link>
            <button onClick={handleLogout} className="logout-button">Wyloguj</button>
          </>
        ) : (
          <Link to="/login">Zaloguj się</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;