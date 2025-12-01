import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds
});

// Request interceptor - add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updatePassword: (currentPassword, newPassword) => 
    api.put('/auth/update-password', { currentPassword, newPassword })
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  updateLanguage: (language) => api.put('/user/language', { language }),
  deleteAccount: () => api.delete('/user/account')
};

// Food Scanning APIs
export const foodAPI = {
  scanFood: (imageFile, mealType, notes) => {
    const formData = new FormData();
    formData.append('foodImage', imageFile);
    if (mealType) formData.append('mealType', mealType);
    if (notes) formData.append('notes', notes);
    
    return api.post('/food/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getFoodLogs: (params = {}) => api.get('/food/logs', { params }),
  getFoodLogById: (id) => api.get(`/food/logs/${id}`),
  updateFoodLog: (id, data) => api.put(`/food/logs/${id}`, data),
  deleteFoodLog: (id) => api.delete(`/food/logs/${id}`),
  getStatistics: (period = '7d') => api.get('/food/statistics', { params: { period } })
};

// Glucose APIs
export const glucoseAPI = {
  addReading: (readingData) => api.post('/glucose/reading', readingData),
  getReadings: (params = {}) => api.get('/glucose/readings', { params }),
  getTrend: (period = '7d') => api.get('/glucose/trend', { params: { period } }),
  getPrediction: () => api.get('/glucose/prediction'),
  getWhatIfScenario: (scenarioType, parameters = {}) => 
    api.post('/glucose/what-if', { scenarioType, parameters }),
  getStatistics: (period = '7d') => api.get('/glucose/statistics', { params: { period } }),
  deleteReading: (id) => api.delete(`/glucose/reading/${id}`)
};

// ABHA APIs
export const abhaAPI = {
  linkABHA: (abhaNumber, abhaAddress) => api.post('/abha/link', { abhaNumber, abhaAddress }),
  getProfile: () => api.get('/abha/profile'),
  getRecords: (type, limit = 20) => api.get('/abha/records', { params: { type, limit } }),
  queryRecords: (query, language = 'en') => api.post('/abha/query', { query, language }),
  shareWithDoctor: (doctorId, recordIds) => api.post('/abha/share', { doctorId, recordIds }),
  syncRecords: () => api.post('/abha/sync')
};

// Doctor APIs
export const doctorAPI = {
  getAllPatients: () => api.get('/doctor/patients'),
  getHighRiskPatients: () => api.get('/doctor/patients/high-risk'),
  getPatientDetail: (id) => api.get(`/doctor/patients/${id}`),
  getPatientAnalytics: (id, period = '30d') => 
    api.get(`/doctor/patients/${id}/analytics`, { params: { period } }),
  updatePatientNote: (id, note) => api.put(`/doctor/patients/${id}/note`, { note })
};

// Voice APIs
export const voiceAPI = {
  processCommand: (transcript, language, intent) => 
    api.post('/voice/command', { transcript, language, intent }),
  textToSpeech: (text, language = 'en-US') => 
    api.post('/voice/speak', { text, language })
};

export default api;
