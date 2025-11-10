import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config';

// Create axios instance with base URL and headers
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for sending cookies with requests
  timeout: 30000, // 30 second timeout
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip adding auth header for auth endpoints to prevent loops
    const authEndpoints = ['/auth/login', '/auth/refresh-token', '/auth/check-session'];
    const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isAuthEndpoint) {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        const token = userData?.accessToken;
        
        if (token) {
          // Remove 'Bearer ' prefix if it exists to avoid duplication
          const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
          config.headers.Authorization = `Bearer ${cleanToken}`;
          
          // Log token details for debugging (safely)
          console.debug('Attaching token to request:', {
            url: config.url,
            method: config.method,
            tokenStartsWith: cleanToken.substring(0, 5) + '...',
            tokenParts: cleanToken.split('.').length,
          });
        } else if (config.url !== '/auth/check-session') {
          console.warn('No access token available for request to:', config.url);
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error processing auth token:', error);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const { refreshToken } = await import('../services/authService');
        const newTokenResponse = await refreshToken();
        
        if (newTokenResponse?.accessToken) {
          // Store the new token and retry the original request
          const { setUserData } = await import('../services/authService');
          setUserData(newTokenResponse, true);
          
          // Update the authorization header
          const cleanToken = newTokenResponse.accessToken.startsWith('Bearer ') 
            ? newTokenResponse.accessToken.substring(7) 
            : newTokenResponse.accessToken;
            
          originalRequest.headers.Authorization = `Bearer ${cleanToken}`;
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // If refresh fails, clear user data and redirect to login
        const { clearUserData } = await import('../services/authService');
        clearUserData();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
