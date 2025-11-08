import axios from 'axios';

// Use environment variable or default to production API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.archive.mehh.ae/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true only if using cookies
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request interceptor - Token present:', !!token);
    console.log('Request URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set');
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email, password) =>
    api.post('/auth/register', { email, password }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  logout: () =>
    api.post('/auth/logout'),
};

// Images API
export const imagesAPI = {
  upload: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },

  list: (skip = 0, limit = 20) =>
    api.get('/images/', { params: { skip, limit } }),

  get: (imageId) =>
    api.get(`/images/${imageId}`),

  delete: (imageId) =>
    api.delete(`/images/${imageId}`),

  searchByTags: (query, limit = 20) =>
    api.get('/images/search/tags', { params: { query, limit } }),

  saveEdited: (imageId, blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'edited.jpg');

    return api.post(`/images/${imageId}/save-edited`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Chat API
export const chatAPI = {
  sendMessage: (message, conversationHistory = [], includeImages = true) =>
    api.post('/chat/message', {
      message,
      conversation_history: conversationHistory,
      include_images: includeImages,
    }),

  assistWithTask: (taskDescription, maxImages = 20) =>
    api.post('/chat/assist', {
      task_description: taskDescription,
      max_images: maxImages,
    }),

  analyzeImage: (imageId, query) =>
    api.post('/chat/analyze-image', {
      image_id: imageId,
      query,
    }),
};

export default api;
