// frontend/src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import interestedService from '../services/interested.service';
import FriendsModal from './FriendsModal'; // DODANE: Import modala znajomych
import './Navbar.css';

// A simple SVG component for the search icon
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

// DODANA: Ikona znajomych
const FriendsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const Navbar = ({ onSearch }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [showInterested, setShowInterested] = useState(false);
  const [interestedEvents, setInterestedEvents] = useState([]);
  
  // DODANE: Stan dla modala znajomych
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  useEffect(() => {
    if (currentUser && showInterested) {
      const fetchInterested = async () => {
        try {
          const token = await currentUser.getIdToken();
          const response = await interestedService.getInterested(token);
          setInterestedEvents(response.data);
        } catch (error) {
          console.error("Błąd podczas pobierania polubionych wydarzeń:", error);
        }
      };
      fetchInterested();
    }
  }, [currentUser, showInterested]);

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
    setShowInterested(false);
  };
  
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
    <>
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
          {/* DODANY: Przycisk znajomych - tylko dla zalogowanych */}
          {currentUser && (
            <div className="nav-friends">
              <button 
                onClick={() => setShowFriendsModal(true)} 
                className="friends-toggle-button"
                title="Znajomi"
              >
                <FriendsIcon />
              </button>
            </div>
          )}

          {/* Przycisk zainteresowań - tylko dla zalogowanych */}
          {currentUser && (
              <div className="nav-interested">
                  <button onClick={() => setShowInterested(!showInterested)} className="interested-toggle-button">
                      <HeartIcon />
                  </button>
                  {showInterested && (
                      <div className="interested-popup">
                          {interestedEvents.length > 0 ? (
                              <ul>
                                  {interestedEvents.map(event => (
                                      <li key={event.id} onClick={() => handleEventClick(event.id)}>
                                          {event.title}
                                      </li>
                                  ))}
                              </ul>
                          ) : (
                              <p>Brak polubionych wydarzeń.</p>
                          )}
                      </div>
                  )}
              </div>
            )}
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

      {/* DODANY: Modal znajomych */}
      <FriendsModal 
        isOpen={showFriendsModal} 
        onClose={() => setShowFriendsModal(false)} 
      />
    </>
  );
};

export default Navbar;