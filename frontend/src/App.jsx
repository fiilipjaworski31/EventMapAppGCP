// frontend/src/App.jsx

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps'; // <-- Ważny import

// Import komponentów
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventDetailsPage from './pages/EventDetailsPage';
import AddEventPage from './pages/AddEventPage';

import './App.css';

function App() {
  return (
    // Opakowujemy całą aplikację w APIProvider, podając klucz API
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
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