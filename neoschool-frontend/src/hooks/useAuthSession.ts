import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SESSION_TIMEOUT, TOKEN_REFRESH_BUFFER } from '../config/index';

/**
 * Custom hook to handle authentication session management
 * - Auto-refreshes tokens before they expire
 * - Handles session timeout
 * - Redirects on authentication state changes
 */
export const useAuthSession = () => {
  const { isAuthenticated, checkAuth, logout } = useAuth();
  const navigate = useNavigate();
  let sessionTimer: NodeJS.Timeout;
  let refreshTimer: NodeJS.Timeout;

  // Function to handle session timeout
  const handleSessionTimeout = useCallback(() => {
    logout();
    navigate('/login', {
      state: { sessionExpired: true },
      replace: true,
    });
  }, [logout, navigate]);

  // Function to schedule token refresh
  const scheduleTokenRefresh = useCallback(() => {
    // Clear any existing refresh timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // Schedule token refresh before it expires
    refreshTimer = setTimeout(() => {
      checkAuth().catch(() => {
        // If token refresh fails, log the user out
        handleSessionTimeout();
      });
    }, TOKEN_REFRESH_BUFFER);
  }, [checkAuth, handleSessionTimeout]);

  // Effect to handle session management
  useEffect(() => {
    if (isAuthenticated) {
      // Set up session timeout
      sessionTimer = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
      
      // Schedule token refresh
      scheduleTokenRefresh();

      // Set up activity listeners to reset timers on user activity
      const resetTimers = () => {
        clearTimeout(sessionTimer);
        sessionTimer = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
      };

      window.addEventListener('mousemove', resetTimers);
      window.addEventListener('keypress', resetTimers);
      window.addEventListener('scroll', resetTimers);
      window.addEventListener('click', resetTimers);

      return () => {
        clearTimeout(sessionTimer);
        clearTimeout(refreshTimer);
        window.removeEventListener('mousemove', resetTimers);
        window.removeEventListener('keypress', resetTimers);
        window.removeEventListener('scroll', resetTimers);
        window.removeEventListener('click', resetTimers);
      };
    }
  }, [isAuthenticated, handleSessionTimeout, scheduleTokenRefresh]);

  // Function to manually refresh the session
  const refreshSession = useCallback(async () => {
    try {
      const isValid = await checkAuth();
      if (isValid) {
        scheduleTokenRefresh();
      }
      return isValid;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  }, [checkAuth, scheduleTokenRefresh]);

  return { refreshSession };
};
