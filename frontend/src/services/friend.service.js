// frontend/src/services/friend.service.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const friendService = {
  // Search for a user by email or username
  searchUser: async (emailOrUsername, token) => {
    return axios.post(`${API_URL}/api/friends/search`, {
      emailOrUsername
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  },

  // Send friend request
  sendFriendRequest: async (friendId, token) => {
    return axios.post(`${API_URL}/api/friends/request`, {
      friendId: parseInt(friendId)
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  },

  // Get list of friends
  getFriends: async (token) => {
    return axios.get(`${API_URL}/api/friends`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Get pending requests (received)
  getPendingRequests: async (token) => {
    return axios.get(`${API_URL}/api/friends/requests/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Get sent requests
  getSentRequests: async (token) => {
    return axios.get(`${API_URL}/api/friends/requests/sent`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Accept friend request
  acceptFriendRequest: async (requestId, token) => {
    return axios.put(`${API_URL}/api/friends/requests/${requestId}/accept`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Reject friend request
  rejectFriendRequest: async (requestId, token) => {
    return axios.put(`${API_URL}/api/friends/requests/${requestId}/reject`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Remove friend
  removeFriend: async (friendId, token) => {
    return axios.delete(`${API_URL}/api/friends/${friendId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Get friend's interested events
  getFriendInterestedEvents: async (friendId, token) => {
    return axios.get(`${API_URL}/api/friends/${friendId}/interested`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

export default friendService;