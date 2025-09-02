import axios from 'axios';

// Pobieramy bazowy URL naszego backendu ze zmiennych środowiskowych Vite
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Pobiera wszystkie wydarzenia z API.
 * @returns {Promise} Obietnica Axios z listą wydarzeń.
 */
const getAllEvents = () => {
  return axios.get(`${API_URL}/api/events`);
};

/**
 * Tworzy nowe wydarzenie, wysyłając dane do API.
 * @param {object} eventData - Dane nowego wydarzenia (np. { title, description, ... }).
 * @param {string} token - Token JWT zalogowanego użytkownika.
 * @returns {Promise} Obietnica Axios z danymi nowo utworzonego wydarzenia.
 */
const createEvent = (eventData, token) => {
  return axios.post(`${API_URL}/api/events`, eventData, {
    headers: {
      // Dołączamy token do nagłówka Authorization, aby backend wiedział, kto tworzy wydarzenie
      Authorization: `Bearer ${token}`
    }
  });
};

// Eksportujemy obiekt, który zawiera wszystkie nasze funkcje,
// aby można było ich łatwo używać w innych częściach aplikacji.
const eventService = {
  getAllEvents,
  createEvent,
};

export default eventService;