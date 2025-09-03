import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';

// Import komponentów i stron
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventDetailsPage from './pages/EventDetailsPage';
import AddEventPage from './pages/AddEventPage';

import './App.css';

function App() {
  // Stan dla filtrów (wyszukiwania i daty) jest teraz na najwyższym poziomie.
  const [filters, setFilters] = useState({ search: '', date: '' });

  // Ta funkcja będzie wywołana przez Navbar, gdy użytkownik coś wyszuka.
  const handleSearch = (searchFilters) => {
    console.log('App received new filters:', searchFilters);
    setFilters(searchFilters);
  };

  return (
    // APIProvider opakowuje całą aplikację, udostępniając kontekst Google Maps
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div className="App">
        {/* Navbar otrzymuje funkcję 'onSearch' jako prop */}
        <Navbar onSearch={handleSearch} />
        <main className="main-content-full-page">
          <Routes>
            {/* HomePage otrzymuje aktualny stan filtrów jako prop */}
            <Route path="/" element={<HomePage filters={filters} />} />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/add-event" element={<AddEventPage />} />
            <Route path="/event/:id" element={<EventDetailsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </APIProvider>
  );
}

export default App;