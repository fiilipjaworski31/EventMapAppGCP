import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Baza API. Zawsze bez końcowego '/'
const RAW_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';
const BASE = RAW_BASE.replace(/\/+$/, '');

// Globalny klient z bazowym prefiksem '/api'
export const apiClient = axios.create({ baseURL: `${BASE}/api` });

// Automatyczne dołączanie tokenu do każdego żądania (jeśli użytkownik zalogowany)
apiClient.interceptors.request.use(async (config) => {
  try {
    const user = getAuth().currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
  } catch (_) {
    // cicho ignoruj brak auth
  }
  return config;
});

// Pomocnicze funkcje (zachowane dla kompatybilności)
export const getEvents = (params) => apiClient.get('/events', { params });
export const createEvent = async (eventData, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  return apiClient.post('/events', eventData, { headers });
};