import axios from 'axios';

// Función para obtener una cookie por nombre
// function getCookie(name: string) {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop().split(';').shift();
// }

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_AUTH_TOKEN; // Define este valor en tu .env

  console.log(token)
  if (token) {
    config.headers['Cookie'] = `auth_token=${token}`;
  }
  return config;
});