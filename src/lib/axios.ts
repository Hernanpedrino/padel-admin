import axios from 'axios';
import Cookies from 'js-cookie';
import { cerrarSesion } from './sesion';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Solo lo usa el SUPERADMIN para indicar con qué complejo opera
  const complejo = Cookies.get('complejo');
  if (complejo && Cookies.get('rol') === 'superadmin') {
    config.headers['X-Complejo-Id'] = complejo;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      cerrarSesion();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
