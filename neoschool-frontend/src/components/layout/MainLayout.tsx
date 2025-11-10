import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthSession } from '../../hooks/useAuthSession';
import { DEFAULT_AUTHENTICATED_ROUTE, DEFAULT_UNAUTHENTICATED_ROUTE } from '../../config';
import { Spinner } from '../ui/spinner';

/**
 * Main layout component that handles authentication state and routing
 * - Shows loading state while checking authentication
 * - Redirects unauthenticated users to login
 * - Renders protected routes when authenticated
 */
export const MainLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use the auth session hook to handle token refresh and session timeout
  useAuthSession();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // If user is not authenticated and not on a public route, redirect to login
        const isPublicRoute = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
        if (!isPublicRoute) {
          navigate(DEFAULT_UNAUTHENTICATED_ROUTE, {
            state: { from: location },
            replace: true,
          });
        }
      } else if (location.pathname === '/login' || location.pathname === '/') {
        // If user is authenticated and tries to access login or root, redirect to dashboard
        navigate(DEFAULT_AUTHENTICATED_ROUTE, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If user is not authenticated and not on a public route, don't render anything
  // The useEffect will handle the redirect
  if (!isAuthenticated && !['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname)) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* You can add a header/navbar here */}
      <main className="flex-1">
        <Outlet />
      </main>
      {/* You can add a footer here */}
    </div>
  );
};
