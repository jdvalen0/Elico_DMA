import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Manejar 401 y 403 (token inválido o sin permisos)
    if ((error.response?.status === 401 || error.response?.status === 403) && !window.location.pathname.includes('/login')) {
      console.warn('Token inválido, expirado o sin permisos (', error.response?.status, '), redirigiendo a login...');
      localStorage.removeItem('token');
      // Limpiar Redux también
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Log de errores para debugging
    if (error.code === 'ERR_NETWORK') {
      console.error('Error de red:', {
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
    } else if (error.response?.status === 403) {
      console.error('Error 403 Forbidden:', {
        message: error.message,
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    
    return Promise.reject(error);
  }
);
