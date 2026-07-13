import axios from 'axios';

// Usar variable de entorno si existe, sino fallback a localhost (desarrollo)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token en cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar 401 (token expirado) y 403 (no autorizado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo disparar auth-failed si el usuario ESTABA autenticado (tenía token).
      // Si no tenía token, es simplemente un endpoint protegido — no hay sesión que expiró.
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (hadToken) {
        window.dispatchEvent(new CustomEvent('auth-failed'));
      }
    }
    if (error.response?.status === 403) {
      // No tiene permiso
      console.warn('No autorizado:', error.response.data?.error);
    }
    return Promise.reject(error);
  }
);

export default api;
