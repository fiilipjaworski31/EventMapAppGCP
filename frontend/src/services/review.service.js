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

// Funkcja do aktualizacji istniejącej recenzji
const updateReview = (eventId, reviewId, reviewData, token) => {
  return axios.put(`${API_URL}/api/events/${eventId}/reviews/${reviewId}`, reviewData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Funkcja do usuwania recenzji
const deleteReview = (eventId, reviewId, token) => {
  return axios.delete(`${API_URL}/api/events/${eventId}/reviews/${reviewId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

const reviewService = {
  getReviewsForEvent,
  addReview,
  updateReview,
  deleteReview,
};

export default reviewService;