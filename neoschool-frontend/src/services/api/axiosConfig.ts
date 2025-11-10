import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { refreshToken } from '../authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance with base config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    // First try to get token directly from localStorage
    const token = localStorage.getItem('token');
    
    // If not found in localStorage, try to get from user object
    if (!token) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
        if (user?.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
          return config;
        }
      } catch (e) {
        console.warn('Error parsing user from storage:', e);
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // If error is not 401 or it's a refresh token request, reject
    if (error.response?.status !== 401 || originalRequest._retry || !originalRequest.url) {
      return Promise.reject(error);
    }

    // If already refreshing, add to queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    return new Promise((resolve, reject) => {
      refreshToken()
        .then(({ accessToken, refreshToken: newRefreshToken, expiresIn }) => {
          const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
          const updatedUser = { ...user, accessToken, refreshToken: newRefreshToken, expiresIn };
          
          // Update stored user data
          if (localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          // Update authorization header
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          processQueue(null, accessToken);
          resolve(axios(originalRequest));
        })
        .catch((err) => {
          processQueue(err, null);
          reject(err);
        })
        .finally(() => {
          isRefreshing = false;
        });
    });
  }
);

export { api };
