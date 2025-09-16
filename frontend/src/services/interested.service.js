import { apiClient } from './api.service';

const getInterested = () => apiClient.get('/interested');
const addInterested = (eventId) => apiClient.post(`/interested/${eventId}`);
const removeInterested = (eventId) => apiClient.delete(`/interested/${eventId}`);

const interestedService = { getInterested, addInterested, removeInterested };
export default interestedService;