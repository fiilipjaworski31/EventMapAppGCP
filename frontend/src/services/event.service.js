import axios from 'axios';

// Get the base URL for the backend from environment variables
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches all events from the API, with optional filtering.
 * @param {object} filters - An object with filters, e.g., { search: 'concert', date: '2025-09-10' }
 * @returns {Promise} An Axios promise with the list of events.
 */
const getAllEvents = (filters = {}) => {
  // Use URLSearchParams to easily build the query string (e.g., ?search=concert&date=...)
  const params = new URLSearchParams();
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.date) {
    params.append('date', filters.date);
  }

  const request = axios.get(`${API_URL}/api/events`, { params });
  
  // Log the raw data to the console for easy inspection
  request.then(response => {
    console.log("Data received from events API:", response.data);
  });
  
  return request;
};

/**
 * Fetches a single event by its ID.
 * @param {string|number} id - The ID of the event.
 * @returns {Promise} An Axios promise with the event data.
 */
const getEventById = (id) => {
  return axios.get(`${API_URL}/api/events/${id}`);
};

/**
 * Creates a new event by sending data to the API.
 * @param {object} eventData - The data for the new event.
 * @param {string} token - The authenticated user's JWT.
 * @returns {Promise} An Axios promise with the newly created event data.
 */
const createEvent = (eventData, token) => {
  return axios.post(`${API_URL}/api/events`, eventData, {
    headers: {
      // Include the token for authorization
      Authorization: `Bearer ${token}`
    }
  });
};

// Export an object containing all service functions
const eventService = {
  getAllEvents,
  getEventById,
  createEvent,
};

export default eventService;