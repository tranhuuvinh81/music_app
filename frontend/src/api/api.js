// // frontend/src/api/api.js
// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:5000',
// });

// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;

// frontend/src/api/api.js
import axios from 'axios';

// SỬA LẠI: Dùng process.env.REACT_APP_... thay vì import.meta.env
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: baseURL,
  // withCredentials: true, // Bật lên nếu cần gửi cookie
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;