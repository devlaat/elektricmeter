import axios from "axios";

/**
 * API Configuration
 *
 * Configure the base URL and timeout for API requests.
 * The backend expects requests to come from: http://localhost:4000/api
 *
 * Environment variables:
 * - REACT_APP_API_URL: Override base API URL (default: http://localhost:4000/api)
 * - REACT_APP_API_TIMEOUT: Timeout in ms (default: 5000)
 */

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || "5000", 10);

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authorization header if token exists
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/authentication/sign-in';
    }
    console.error('API error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;