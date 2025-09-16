// frontend/src/services/friend.service.js
import { apiClient } from './api.service';

const friendService = {
  searchUser: async (emailOrUsername) => apiClient.post('/friends/search', { emailOrUsername }),
  sendFriendRequest: async (friendId) => apiClient.post('/friends/request', { friendId: parseInt(friendId) }),
  getFriends: async () => apiClient.get('/friends'),
  getPendingRequests: async () => apiClient.get('/friends/requests/pending'),
  getSentRequests: async () => apiClient.get('/friends/requests/sent'),
  acceptFriendRequest: async (requestId) => apiClient.put(`/friends/requests/${requestId}/accept`),
  rejectFriendRequest: async (requestId) => apiClient.put(`/friends/requests/${requestId}/reject`),
  removeFriend: async (friendId) => apiClient.delete(`/friends/${friendId}`),
  getFriendInterestedEvents: async (friendId) => apiClient.get(`/friends/${friendId}/interested`),
};

export default friendService;