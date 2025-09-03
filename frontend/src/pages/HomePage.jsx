// frontend/src/pages/HomePage.jsx

import React from 'react';
import MapContainer from '../components/MapContainer';
import './HomePage.css'; // Assuming you will add styles here

const HomePage = () => {
  return (
    <div className="homepage-container">
      <div className="homepage-header">
        <h1 className="homepage-title">Interaktywna Mapa Wydarzeń</h1>
        <p className="homepage-subtitle">Odkrywaj, wyszukuj i dodawaj wydarzenia w swojej okolicy.</p>
      </div>
      <div className="homepage-map">
        <MapContainer />
      </div>
    </div>
  );
};

export default HomePage;