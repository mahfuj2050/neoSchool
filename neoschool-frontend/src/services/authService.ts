import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config';

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  username: string;
  roles: string[];
}

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
  CHECK_SESSION: '/auth/check-session',
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // First, clear any existing tokens from both storages
    clearUserData();
    
    console.log('Attempting login with credentials:', {
      url: `${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`,
      username: credentials.username
    });
    
    // Make the login request
    const response = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, 
      {
        username: credentials.username,
        password: credentials.password
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      }
    );

    // Map the backend's response to our frontend format
    const { 
      token,           // Backend uses 'token' instead of 'accessToken'
      refreshToken, 
      username: responseUsername, 
      roles: responseRoles,
      expiresIn 
    } = response.data;
    
    const accessToken = token;
    const username = responseUsername || credentials.username;
    const roles = Array.isArray(responseRoles) ? responseRoles : [];

    if (!accessToken) {
      throw new Error('No access token received in response');
    }

    // Verify token format
    if (typeof accessToken !== 'string' || !accessToken.includes('.')) {
      console.error('Invalid token format:', accessToken);
      throw new Error('Invalid token format received');
    }

    // Ensure the token doesn't already have 'Bearer ' prefix
    const cleanToken = accessToken.startsWith('Bearer ') 
      ? accessToken.substring(7) 
      : accessToken;

    // Store user data - always use localStorage for persistence
    const userData: AuthResponse = { 
      accessToken: cleanToken, 
      refreshToken: refreshToken || '', 
      username, 
      roles: Array.isArray(roles) ? roles : [],
      expiresIn: expiresIn || 3600 
    };
    
    // Store the user data with rememberMe=true to use localStorage
    setUserData(userData, true);
    
    // Set the default Authorization header for future requests
    const authHeader = `Bearer ${cleanToken}`;
    api.defaults.headers.common['Authorization'] = authHeader;
    
    return userData;
  } catch (error: any) {
    console.error('Login error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      if (status === 401) {
        throw new Error(data?.message || 'Invalid username or password');
      } else if (status === 403) {
        throw new Error('Access denied. Please check your permissions.');
      } else if (data?.message) {
        throw new Error(data.message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please try again.');
    }
    
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};

export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const user = getUserData();
    if (!user?.refreshToken) {
      console.error('No refresh token available');
      throw new Error('No refresh token available');
    }
    
    console.log('Attempting to refresh token with refresh token:', 
      user.refreshToken.substring(0, 10) + '...');
    
    // Make the refresh request directly with axios to avoid circular dependencies
    const response = await axios.post(
      `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
      { refreshToken: user.refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      }
    );

    console.log('Token refresh response:', {
      status: response.status,
      hasAccessToken: !!response.data.accessToken,
      hasRefreshToken: !!response.data.refreshToken
    });

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
    
    if (!accessToken) {
      console.error('No access token in refresh response');
      throw new Error('No access token in refresh response');
    }

    // Update the stored user data with the new tokens
    const updatedUser = {
      ...user,
      accessToken: accessToken.startsWith('Bearer ') ? accessToken.substring(7) : accessToken,
      refreshToken: newRefreshToken || user.refreshToken,
      expiresIn: expiresIn || 3600
    };

    console.log('Storing refreshed tokens in localStorage');
    // Store the updated tokens - always use localStorage for persistence
    setUserData(updatedUser, true);
    
    // Update the default Authorization header
    const authHeader = `Bearer ${updatedUser.accessToken}`;
    api.defaults.headers.common['Authorization'] = authHeader;
    
    console.log('Successfully refreshed token');
    return updatedUser;
  } catch (error) {
    clearUserData();
    throw new Error('Session expired. Please login again.');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post(AUTH_ENDPOINTS.LOGOUT);
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear any client-side tokens
    clearUserData();
    // Clear axios default headers
    delete api.defaults.headers.common['Authorization'];
  }
};

export const checkSession = async (): Promise<boolean> => {
  const user = getUserData();
  
  // If no user data exists, there's no session
  if (!user?.accessToken) {
    console.log('No access token found in storage');
    return false;
  }
  
  // Check if token is expired
  const tokenExp = getTokenExpiration(user.accessToken);
  if (tokenExp && tokenExp < Date.now() / 1000) {
    console.log('Token is expired, attempting refresh...');
    try {
      await refreshToken();
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
  
  // Token is still valid
  return true;
};

// Helper function to check token expiration
const getTokenExpiration = (token: string): number | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload.exp || null;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

// Store user data in storage
export const setUserData = (data: AuthResponse, rememberMe: boolean = true): void => {
  const storage = rememberMe ? localStorage : sessionStorage;
  // Clear both storages before setting to prevent duplicates
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
  storage.setItem('user', JSON.stringify(data));
  console.log('User data stored in:', rememberMe ? 'localStorage' : 'sessionStorage');
};

// Get user data from storage
export const getUserData = (): AuthResponse | null => {
  try {
    // Try to get user data from storage - check localStorage first
    let userDataStr = localStorage.getItem('user');
    const storageType = userDataStr ? 'localStorage' : 'sessionStorage';
    
    // If not in localStorage, try sessionStorage
    if (!userDataStr) {
      userDataStr = sessionStorage.getItem('user');
    }
    
    if (!userDataStr) {
      console.log('No user data found in storage');
      return null;
    }
    
    console.log('Retrieving user data from:', storageType);
    
    // Parse the user data
    let userData;
    try {
      userData = JSON.parse(userDataStr);
      console.log('Parsed user data:', {
        hasToken: !!userData?.accessToken,
        tokenType: typeof userData?.accessToken,
        tokenStartsWith: userData?.accessToken?.substring(0, 10) + '...',
        tokenParts: userData?.accessToken?.split('.').length,
        hasTokenField: 'token' in userData,
        hasAccessTokenField: 'accessToken' in userData,
        keys: Object.keys(userData || {})
      });
    } catch (e) {
      console.error('Failed to parse user data from storage. Raw data:', userDataStr, 'Error:', e);
      return null;
    }
    
    // Validate the stored data structure
    if (!userData || typeof userData !== 'object') {
      console.error('Invalid user data format in storage');
      return null;
    }
    
    // Map the token field (from backend) to accessToken (frontend)
    if (userData.token && !userData.accessToken) {
      console.log('Mapping token field to accessToken');
      userData.accessToken = userData.token;
    }
    
    // Ensure required fields exist
    if (!userData.accessToken || !userData.username) {
      console.error('Missing required user data fields:', {
        hasToken: !!userData.accessToken,
        hasUsername: !!userData.username
      });
      return null;
    }
    
    // Ensure token is a valid JWT
    const token = userData.accessToken;
    if (typeof token !== 'string' || token.split('.').length !== 3) {
      console.error('Invalid JWT token format in storage:', {
        tokenLength: token?.length,
        tokenType: typeof token,
        tokenStartsWith: token?.substring(0, 10) + '...',
        tokenParts: token?.split('.').length
      });
      return null;
    }
    
    return {
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken || '',
      username: userData.username,
      roles: Array.isArray(userData.roles) ? userData.roles : [],
      expiresIn: userData.expiresIn || 3600
    };
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Clear user data from storage
export const clearUserData = (): void => {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
};
