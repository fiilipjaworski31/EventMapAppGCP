import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import komponentów
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import EventDetailsPage from './pages/EventDetailsPage';
import AddEventPage from './pages/AddEventPage';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/add-event" element={<AddEventPage />} />
            <Route path="/event/:id" element={<EventDetailsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;