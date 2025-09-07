import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getCurrentUser = (token) => {
  return axios.get(`${API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const createUser = (userData) => {
  return axios.post(`${API_URL}/api/users`, userData);
};

const userService = {
  getCurrentUser,
  createUser,
};

export default userService;