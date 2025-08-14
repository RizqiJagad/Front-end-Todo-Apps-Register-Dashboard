import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://fe-test-api.nwappservice.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApiClient = axios.create({
  baseURL: 'https://fe-test-api.nwappservice.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

authApiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);