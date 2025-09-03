// frontend/src/pages/HomePage.jsx

import React from 'react';
import MapContainer from '../components/MapContainer';
import './HomePage.css';

const HomePage = ({ filters }) => {
  return (
    <div className="homepage-container">
      {/* --- ZMIANA TUTAJ --- */}
      <div className="homepage-header">
        <h1 className="homepage-title">Interaktywna Mapa Wydarzeń</h1>
        <p className="homepage-subtitle">Odkrywaj, wyszukuj i dodawaj wydarzenia w swojej okolicy.</p>
      </div>
      {/* --- KONIEC ZMIANY --- */}
      
      <div className="homepage-map">
        <MapContainer filters={filters} />
      </div>
    </div>
  );
};

export default HomePage;