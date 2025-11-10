import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { login as loginService, logout as logoutService, checkSession, getUserData, setUserData, clearUserData, api } from '../services/authService';

export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  username: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, rememberMe: boolean) => Promise<{ id: string; username: string; roles: string[] }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user data and tokens
      clearUserData();
      setUser(null);
      
      // Remove the Authorization header
      delete api.defaults.headers.common['Authorization'];
      
      // Redirect to login page
      window.location.href = '/login';
    }
  }, [clearUserData, setUser]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const isValid = await checkSession();
      if (!isValid) {
        await handleLogout();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      await handleLogout();
      return false;
    }
  }, [user, handleLogout]);

  const refreshToken = useCallback(async (): Promise<AuthResponse> => {
    const user = getUserData();
    if (!user?.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post('/auth/refresh-token', {
      refreshToken: user.refreshToken
    });
    
    const { accessToken, refreshToken: newRefreshToken, username, roles } = response.data;
    const updatedUser = { 
      ...user, 
      accessToken, 
      refreshToken: newRefreshToken,
      username,
      roles,
      expiresIn: response.data.expiresIn || 3600
    };
    
    setUserData(updatedUser, true);
    return updatedUser;
  }, []);

  const login = useCallback(async (username: string, password: string, rememberMe: boolean) => {
    try {
      setIsLoading(true);
      const authResponse = await loginService({ username, password });
      
      const user = {
        id: authResponse.username,
        username: authResponse.username,
        roles: authResponse.roles || [],
      };
      
      // Store the full auth response including tokens
      setUserData(authResponse, rememberMe);
      
      // Set the user in state
      setUser(user);
      
      // Set the default Authorization header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${authResponse.accessToken}`;
      
      return user;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setUserData, setUser]);

  // Initialize auth state from storage
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        // Get user data from storage
        const userData = getUserData();
        
        if (!userData?.accessToken) {
          console.log('No access token found in storage');
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        console.log('Found user data in storage, validating...');
        
        // Set auth header for all requests
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`;
        
        // Set user in state immediately to prevent flash of login page
        if (isMounted) {
          setUser({
            id: userData.username,
            username: userData.username,
            roles: userData.roles || [],
          });
        }
        
        // Check if the token is still valid
        const isSessionValid = await checkSession();
        
        if (isMounted) {
          if (!isSessionValid) {
            console.log('Session is not valid, logging out...');
            await handleLogout();
          } else {
            console.log('Session is valid');
          }
          setIsLoading(false);
        }
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          await handleLogout();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, [handleLogout]);

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout: handleLogout,
    checkAuth,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
