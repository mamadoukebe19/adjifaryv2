import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const stockAPI = {
  getPbaTypes: () => api.get('/stock/pba-types'),
  getDailyStock: (date) => api.get(`/stock/daily/${date}`),
  saveDailyStock: (data) => api.post('/stock/daily', data),
  saveInitialStock: (data) => api.post('/stock/initial-stock', data),
  getStockHistory: (params) => api.get('/stock/history', { params }),
  getDashboardData: () => api.get('/stock/dashboard'),
};

export default api;