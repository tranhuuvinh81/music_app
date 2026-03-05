//music-mobile-app/api/api.js
import axios from 'axios';

// Thay chuỗi bên dưới bằng link Backend thực tế của bạn trên Render nhé!
// Ví dụ: 'https://music-backend-xyz.onrender.com'
const API_URL = 'https://music-app-m38o.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;