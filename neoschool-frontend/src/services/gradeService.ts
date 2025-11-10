import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Skip for auth endpoints to prevent loops
    if (config.url?.includes('/auth/')) {
      return config;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user?.accessToken;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else if (config.url !== '/auth/check-session') {
      console.warn('No access token available, redirecting to login');
      window.location.href = '/login';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Grade {
  id?: number;
  gradeId: string;
  gradeLetter: string;
  gradePoint: number;
  rangeMin: number;
  rangeMax: number;
  remarks?: string;
}

export const fetchGrades = async (): Promise<Grade[]> => {
  try {
    console.log('Fetching grades from:', API_ENDPOINTS.GRADES.BASE);
    const response = await api.get(API_ENDPOINTS.GRADES.BASE);
    console.log('Grades API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error in fetchGrades:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear invalid auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    throw error;
  }
};

export const createGrade = async (grade: Omit<Grade, 'id'>): Promise<Grade> => {
  const response = await api.post(API_ENDPOINTS.GRADES.BASE, grade);
  return response.data;
};

export const updateGrade = async (id: number, grade: Partial<Grade>): Promise<Grade> => {
  const response = await api.put(`${API_ENDPOINTS.GRADES.BASE}/${id}`, grade);
  return response.data;
};

export const deleteGrade = async (id: number): Promise<void> => {
  await api.delete(`${API_ENDPOINTS.GRADES.BASE}/${id}`);
};
