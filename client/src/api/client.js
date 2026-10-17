import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civicshield_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle responses and capture normalized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, token might be expired
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login/register checks
      const isAuthUrl = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthUrl && localStorage.getItem('civicshield_token')) {
        localStorage.removeItem('civicshield_token');
        localStorage.removeItem('civicshield_user');
        window.dispatchEvent(new Event('auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
