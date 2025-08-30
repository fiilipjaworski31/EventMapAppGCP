import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { createEvent } from '../services/apiService'; // Import funkcji API
import { useNavigate } from 'react-router-dom';
import './AddEventPage.css';

const AddEventPage = () => {
  const { currentUser } = useAuth(); // Pobierz zalogowanego użytkownika
  const navigate = useNavigate(); // Do przekierowania po sukcesie

  const [title, setTitle] = useState('');
  // ... inne stany (description, date, etc.) bez zmian

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Musisz być zalogowany, aby dodać wydarzenie.');
      return;
    }

    try {
      const token = await currentUser.getIdToken(); // Pobierz token Firebase
      const newEvent = { title, description, date, latitude, longitude };
      
      await createEvent(newEvent, token); // Wyślij dane i token do API

      alert('Wydarzenie dodane pomyślnie!');
      navigate('/'); // Przekieruj na stronę główną
    } catch (error) {
      console.error('Błąd podczas dodawania wydarzenia:', error);
      alert('Wystąpił błąd. Sprawdź konsolę, aby uzyskać więcej informacji.');
    }
  };

  // ... reszta komponentu (return z formularzem) bez zmian
};

export default AddEventPage;