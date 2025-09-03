import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getInterested = (token) => {
  return axios.get(`${API_URL}/api/interested`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const addInterested = (eventId, token) => {
  return axios.post(`${API_URL}/api/interested/${eventId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const removeInterested = (eventId, token) => {
  return axios.delete(`${API_URL}/api/interested/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const interestedService = {
  getInterested,
  addInterested,
  removeInterested,
};

export default interestedService;