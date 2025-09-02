import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import { useAuth } from '../context/AuthContext';

const AddEventPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Stany dla wszystkich pól z bazy danych
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Musisz być zalogowany, aby dodać wydarzenie.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) {
      setError('Szerokość i długość geograficzna muszą być poprawnymi liczbami.');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const eventData = {
        title,
        description,
        latitude: lat,
        longitude: lon,
        address,
        start_time: startTime, // Wymagane przez bazę danych!
        end_time: endTime || null, // Wyślij null, jeśli puste
      };
      
      await eventService.createEvent(eventData, token);
      
      navigate('/'); 

    } catch (err) {
      setError('Wystąpił błąd podczas dodawania wydarzenia. Spróbuj ponownie.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Dodaj nowe wydarzenie</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tytuł:</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Opis:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label>Adres:</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <div>
          <label>Czas rozpoczęcia:</label>
          <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
        </div>
        <div>
          <label>Czas zakończenia (opcjonalnie):</label>
          <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
        <div>
          <label>Szerokość geograficzna (Latitude):</label>
          <input type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} required placeholder="np. 52.2297" />
        </div>
        <div>
          <label>Długość geograficzna (Longitude):</label>
          <input type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} required placeholder="np. 21.0122" />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Dodawanie...' : 'Dodaj wydarzenie'}
        </button>
      </form>
    </div>
  );
};

export default AddEventPage;