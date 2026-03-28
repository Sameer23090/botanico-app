import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Plants APIs
export const plantsAPI = {
  getAll: () => api.get('/plants'),
  getById: (id) => api.get(`/plants/${id}`),
  create: (formData) => {
    return api.post('/plants', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, formData) => {
    return api.put(`/plants/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/plants/${id}`),
  getStats: (id) => api.get(`/plants/${id}/stats`),
};

// Updates APIs
export const updatesAPI = {
  getByPlantId: (plantId) => api.get(`/updates/plant/${plantId}`),
  getById: (id) => api.get(`/updates/${id}`),
  create: (formData) => {
    return api.post('/updates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, formData) => {
    return api.put(`/updates/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/updates/${id}`),
  getTimeline: (plantId) => api.get(`/updates/plant/${plantId}/timeline`),
};

// Helper functions
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export default api;
