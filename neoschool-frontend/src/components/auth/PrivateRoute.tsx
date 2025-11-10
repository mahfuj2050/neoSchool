import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../ui/spinner';

interface PrivateRouteProps {
  children: ReactNode;
  /**
   * Array of required roles to access the route
   * If empty, only requires authentication
   */
  requiredRoles?: string[];
  /**
   * Redirect path when user is not authenticated/authorized
   * @default '/login' for unauthenticated, '/unauthorized' for unauthorized
   */
  redirectTo?: string;
  /**
   * If true, will show a loading spinner while checking authentication
   * @default true
   */
  showLoading?: boolean;
}

/**
 * A component that renders children only if the user is authenticated and has the required roles.
 * Otherwise, it will redirect to the login page or an unauthorized page.
 */
export const PrivateRoute = ({
  children,
  requiredRoles = [],
  redirectTo: customRedirectTo,
  showLoading = true,
}: PrivateRouteProps) => {
  const { isAuthenticated, isLoading, user, checkAuth, hasRole } = useAuth();
  const location = useLocation();
  
  // Default redirect paths
  const loginPath = customRedirectTo || '/login';
  const unauthorizedPath = customRedirectTo || '/unauthorized';

  // Check if user has required roles
  const hasRequiredRole = requiredRoles.length === 0 || requiredRoles.some(role => hasRole(role));

  // If we're still loading auth state, show a spinner or nothing
  if (isLoading && showLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If not authenticated, redirect to login with return location
  if (!isAuthenticated) {
    return (
      <Navigate
        to={loginPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // If user doesn't have required role, redirect to unauthorized
  if (!hasRequiredRole) {
    return (
      <Navigate
        to={unauthorizedPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // If we get here, user is authenticated and has required roles
  return <>{children}</>;
};

/**
 * Higher Order Component for protecting routes with authentication and role checks
 * @param Component The component to protect
 * @param options Options for the private route
 * @returns A new component with route protection
 */
export const withPrivateRoute = (
  Component: React.ComponentType,
  options: Omit<PrivateRouteProps, 'children'> = {}
) => {
  return (props: any) => (
    <PrivateRoute {...options}>
      <Component {...props} />
    </PrivateRoute>
  );
};

/**
 * Higher Order Component for protecting routes with specific roles
 * @param Component The component to protect
 * @param roles Array of roles that can access the route
 * @returns A new component with role-based protection
 */
export const withRole = (
  Component: React.ComponentType,
  roles: string[] = []
) => {
  return withPrivateRoute(Component, { requiredRoles: roles });
};
