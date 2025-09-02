
import React from 'react';
import MapContainer from '../components/MapContainer';
import './HomePage.css';


const HomePage = () => {
  return (
    <div className="homepage-container">
      <h1 className="homepage-title">Witaj na interaktywnej mapie wydarzeń!</h1>
      <div className="homepage-map">
        <MapContainer />
      </div>
    </div>
  );
};

export default HomePage;