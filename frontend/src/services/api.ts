import axios from 'axios';

/** Backend base URL: same host as the page + port 5000 by default (works on LAN). Override with VITE_API_BASE_URL. */
function resolveApiBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (fromEnv) {
    const base = fromEnv.replace(/\/$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const apiPort = (import.meta.env.VITE_API_PORT as string | undefined)?.trim() || '5000';
    return `${protocol}//${hostname}:${apiPort}/api`;
  }
  return 'http://localhost:5000/api';
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => {
    // Handle 204 No Content - treat as success with empty data
    if (response.status === 204) {
      return { ...response, data: { savedUniversities: [] } };
    }
    return response;
  },
  (error) => {
    // Handle network errors (backend not running)
    if (!error.response) {
      console.error('Network Error: Backend server may not be running');
      error.message = `Cannot connect to server. Expected API at ${resolveApiBaseUrl().replace(/\/api$/, '')}`;
      return Promise.reject(error);
    }
    
    // Handle 204 as success (no content but valid response)
    if (error.response?.status === 204) {
      return Promise.resolve({ data: { savedUniversities: [] }, status: 204 });
    }
    
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      // Don't redirect if we're already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

