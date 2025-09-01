import axios from 'axios';

// UWAGA: Zmień ten adres URL na adres Twojej wdrożonej usługi Cloud Run, gdy będzie gotowa.
// Na razie, testuje i użyje adresu lokalnego.
const API_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
});

// Funkcja do pobierania wszystkich wydarzeń
export const getEvents = () => {
  return apiClient.get('/events');
};

export const createEvent = async (eventData, token) => {
  return apiClient.post('/events', eventData, {
    headers: {
      Authorization: `Bearer ${token}` // Dołącza token do nagłówka
    }
  });
};