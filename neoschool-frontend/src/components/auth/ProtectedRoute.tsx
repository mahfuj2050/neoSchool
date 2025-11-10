import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRoles = [],
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, checkAuth, hasRole } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        const isStillValid = await checkAuth();
        if (!isStillValid) {
          setIsAuthorized(false);
          return;
        }
      }

      // If no specific roles required, just check if authenticated
      if (requiredRoles.length === 0) {
        setIsAuthorized(true);
        return;
      }

      // Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.some(role => hasRole(role));
      setIsAuthorized(hasRequiredRole);
    };

    verifyAuth();
  }, [isAuthenticated, checkAuth, hasRole, requiredRoles]);

  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the current location they were trying to go to
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    // User is logged in but doesn't have required role
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Higher Order Component for protecting routes with specific roles
export const withRole = (
  Component: React.ComponentType,
  requiredRoles: string[] = []
) => {
  return (props: any) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};
