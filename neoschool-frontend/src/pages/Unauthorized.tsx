import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the state passed from the PrivateRoute
  const from = (location.state as any)?.from?.pathname || '/';
  const message = (location.state as any)?.message || 'You do not have permission to access this page.';

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-4">
        <AlertCircle className="h-12 w-12 text-red-600" />
      </div>
      
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Access Denied</h1>
      
      <p className="mb-8 max-w-md text-lg text-muted-foreground">
        {message}
      </p>
      
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
        <Button onClick={handleGoBack} variant="outline">
          Go Back
        </Button>
        <Button onClick={handleGoHome}>
          Return Home
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 rounded-md border border-dashed p-4 text-left">
          <h3 className="mb-2 text-sm font-medium">Debug Information</h3>
          <pre className="overflow-auto rounded bg-muted p-2 text-xs">
            {JSON.stringify(
              {
                from,
                location: {
                  pathname: location.pathname,
                  search: location.search,
                  hash: location.hash,
                },
                state: location.state,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Unauthorized;
