import axios from 'axios';

// Base URL untuk API backend Laravel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Instance axios dengan konfigurasi default
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle response error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid, redirect ke login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// Kategori API
export const kategoriAPI = {
  getAll: () => api.get('/kategoris'),
  getById: (id) => api.get(`/kategoris/${id}`),
  create: (data) => api.post('/kategoris', data),
  update: (id, data) => api.put(`/kategoris/${id}`, data),
  delete: (id) => api.delete(`/kategoris/${id}`),
};

// Produk API
export const produkAPI = {
  getAll: () => api.get('/produks'),
  getById: (id) => api.get(`/produks/${id}`),
  create: (data) => api.post('/produks', data),
  update: (id, data) => api.put(`/produks/${id}`, data),
  delete: (id) => api.delete(`/produks/${id}`),
};

// Transaksi API
export const transaksiAPI = {
  getAll: () => api.get('/transaksis'),
  getById: (id) => api.get(`/transaksis/${id}`),
  create: (data) => api.post('/transaksis', data),
};

// Pelanggan API
export const pelangganAPI = {
  getAll: () => api.get('/pelanggans'),
  getById: (id) => api.get(`/pelanggans/${id}`),
  create: (data) => api.post('/pelanggans', data),
  update: (id, data) => api.put(`/pelanggans/${id}`, data),
  delete: (id) => api.delete(`/pelanggans/${id}`),
};

// Diskon API
export const diskonAPI = {
  getAll: () => api.get('/diskons'),
  getById: (id) => api.get(`/diskons/${id}`),
  create: (data) => api.post('/diskons', data),
  update: (id, data) => api.put(`/diskons/${id}`, data),
  delete: (id) => api.delete(`/diskons/${id}`),
};

export default api;
