import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const getFriends = (token) => {
  return axios.get(`${API_URL}/api/friends`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const sendFriendRequest = (username, token) => {
  return axios.post(`${API_URL}/api/friends`, { username }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const getPendingRequests = (token) => {
  return axios.get(`${API_URL}/api/friends/requests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const acceptFriendRequest = (requesterId, token) => {
  return axios.put(`${API_URL}/api/friends/accept/${requesterId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const declineFriendRequest = (requesterId, token) => {
  return axios.put(`${API_URL}/api/friends/decline/${requesterId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const removeFriend = (friendId, token) => {
  return axios.delete(`${API_URL}/api/friends/${friendId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const getFriendInterestedEvents = (friendId, token) => {
  return axios.get(`${API_URL}/api/friends/${friendId}/events`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const friendsService = {
  getFriends,
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriendInterestedEvents,
};

export default friendsService;