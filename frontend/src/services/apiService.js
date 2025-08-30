import axios from 'axios';

// UWAGA: Zmień ten adres URL na adres Twojej wdrożonej usługi Cloud Run, gdy będzie gotowa.
// Na razie, testuje i użyje adresu lokalnego.
const API_URL = 'http://localhost:8080/api'; // Przykładowy lokalny adres URL

const apiClient = axios.create({
  baseURL: API_URL,
});

// Funkcja do pobierania wszystkich wydarzeń
export const getEvents = () => {
  return apiClient.get('/events');
};

// Tutaj w przyszłości dodam więcej funkcji (dodawanie, usuwanie, edycja)