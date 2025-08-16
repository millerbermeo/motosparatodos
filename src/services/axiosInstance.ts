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

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el Bearer token en cada request
api.interceptors.request.use((config) => {
  const token = "b3a7de5d3d899e667cc0c42b26ada5ef69cfeb9ec40720d30f877420d12289c1"; // O donde guardes tu token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
