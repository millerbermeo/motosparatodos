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
  const token = "e9a0a7c07ca5587db5c24f1859149e35e4aa15d730dd3de0a1d10f9185833c65"; // O donde guardes tu token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
