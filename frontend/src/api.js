import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 
                (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

export const plantsAPI = {
  getAll: () => api.get('/plants'),
  getById: (id) => api.get(`/plants/${id}`),
  create: (data) => api.post('/plants', data),
  update: (id, data) => api.put(`/plants/${id}`, data),
  delete: (id) => api.delete(`/plants/${id}`),
  getStats: (id) => api.get(`/plants/${id}/stats`),
};

export const updatesAPI = {
  getByPlantId: (plantId) => api.get(`/updates/plant/${plantId}`),
  getById: (id) => api.get(`/updates/${id}`),
  create: (data) => api.post('/updates', data),
  update: (id, data) => api.put(`/updates/${id}`, data),
  delete: (id) => api.delete(`/updates/${id}`),
  getTimeline: (plantId) => api.get(`/updates/plant/${plantId}/timeline`),
};

// New Upload API
export const uploadAPI = {
  uploadImage: (formData) => {
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
};

export const marketplaceAPI = {
  getListings: (params) => api.get('/marketplace', { params }),
  createListing: (data) => api.post('/marketplace', data),
  getMyListings: () => api.get('/marketplace/my-listings'),
};

export const aiAPI = {
  consult: (plantId) => api.post('/ai/consult', { plantId }),
  diagnose: (imageUrl, plantId) => api.post('/ai/diagnose', { imageUrl, plantId })
};

export const achievementAPI = {
  getUnlocked: () => api.get('/achievements'),
  unlock: (data) => api.post('/achievements/unlock', data)
};

export const remindersAPI = {
  getAll: () => api.get('/reminders'),
  create: (data) => api.post('/reminders', data),
  complete: (id) => api.patch(`/reminders/${id}/complete`)
};

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
