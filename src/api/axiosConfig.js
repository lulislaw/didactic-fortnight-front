import axios from 'axios';

export const baseUrl = 'http://' + import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;
