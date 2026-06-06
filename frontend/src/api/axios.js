import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
});

// Attach token from localStorage on each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ascentium_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Surface a nicer error.message
api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (err.response?.data?.message) {
      err.message = err.response.data.message;
    }
    // Auto-logout on 401 (token expired) - except for /auth/* endpoints
    if (err.response?.status === 401 && !/\/auth\//.test(err.config?.url || '')) {
      localStorage.removeItem('ascentium_token');
      localStorage.removeItem('ascentium_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
