import axios from 'axios';

// Pobieram bazowy URL z naszych zmiennych środowiskowych
const API_URL = import.meta.env.VITE_API_URL;

// Funkcja do pobierania wszystkich recenzji dla konkretnego wydarzenia
const getReviewsForEvent = (eventId) => {
  return axios.get(`${API_URL}/api/events/${eventId}/reviews`);
};

// Funkcja do dodawania nowej recenzji
// Wymaga eventId, danych recenzji oraz tokenu zalogowanego użytkownika
const addReview = (eventId, reviewData, token) => {
  return axios.post(`${API_URL}/api/events/${eventId}/reviews`, reviewData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

const reviewService = {
  getReviewsForEvent,
  addReview,
};

export default reviewService;