// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// API Endpoints
export interface ApiEndpoints {
  AUTH: {
    LOGIN: string;
    LOGOUT: string;
    REFRESH: string;
    CHECK_SESSION: string;
    REGISTER: string;
    FORGOT_PASSWORD: string;
    RESET_PASSWORD: string;
  };
  USERS: {
    BASE: string;
    PROFILE: string;
    CHANGE_PASSWORD: string;
  };
  [key: string]: any;
}

export const API_ENDPOINTS: ApiEndpoints = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh-token`,
    CHECK_SESSION: `${API_BASE_URL}/api/auth/check-session`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  },
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    PROFILE: `${API_BASE_URL}/api/users/me`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/users/change-password`,
  },
  SUBJECTS: {
    BASE: `${API_BASE_URL}/api/subjects`,
  },
  STUDENTS: {
    BASE: `${API_BASE_URL}/api/students`,
  },
  EXAMS: {
    BASE: `${API_BASE_URL}/api/exams`,
  },
  // Add more API endpoints as needed
};

// Token configuration
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes before actual expiry
};

// Routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Default route after login
export const DEFAULT_AUTHENTICATED_ROUTE = '/dashboard';

// Default route for unauthenticated users
export const DEFAULT_UNAUTHENTICATED_ROUTE = '/login';

// Session timeout in milliseconds (30 minutes)
export const SESSION_TIMEOUT = 30 * 60 * 1000;

// Auto refresh token before expiration (5 minutes before)
export const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000;
