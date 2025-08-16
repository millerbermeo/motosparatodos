import axios from 'axios';

export const api = axios.create({
  baseURL: "http://tuclick.vozipcolombia.net.co/motos/back",
  withCredentials: true,
  
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  return config;
});
