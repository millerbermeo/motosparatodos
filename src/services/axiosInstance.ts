import axios from 'axios';

// Función para obtener una cookie por nombre
// function getCookie(name: string) {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop().split(';').shift();
// }

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,            // <- clave

  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token antes de cada request
api.interceptors.request.use((config) => {
  const token = "7eefd1646707eca6a8f792b6751738780e57867b2031a1cf1d207818fc2dd92d"
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
