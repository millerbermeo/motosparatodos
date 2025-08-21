// import axios from 'axios';

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true,
  
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use((config) => {
//   return config;
// });


import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor para incluir el Bearer token en cada request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Interceptor para manejar respuestas de error (ej: 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Cerrar sesión en el store
      useAuthStore.getState().logout();

      // Redirigir al login (ajusta según tu router)
      window.location.reload
    }

    return Promise.reject(error);
  }
);
