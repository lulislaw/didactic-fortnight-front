import axios from 'axios';

const api = axios.create({
  baseURL: 'http://' + import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
