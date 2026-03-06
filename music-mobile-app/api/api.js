// music-mobile-app/api/api.js
import axios from 'axios';

// Dùng luôn Server thực tế trên Render cho xịn!
const API_URL = 'https://music-app-m38o.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;