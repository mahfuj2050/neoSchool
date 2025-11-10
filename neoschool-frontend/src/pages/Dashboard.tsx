import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Simulate fetching dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch this from your API
        // const response = await api.get('/api/dashboard');
        // setDashboardData(response.data);
        
        // Mock data for demonstration
        setTimeout(() => {
          setDashboardData({
            welcomeMessage: `Welcome back, ${user?.username || 'User'}!`,
            stats: {
              totalUsers: 42,
              activeProjects: 7,
              tasksCompleted: 128,
              pendingTasks: 15,
            },
            recentActivity: [
              { id: 1, action: 'User login', timestamp: '2023-06-15T10:30:00' },
              { id: 2, action: 'Profile updated', timestamp: '2023-06-14T15:45:00' },
              { id: 3, action: 'New project created', timestamp: '2023-06-13T09:15:00' },
            ],
          });
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium">Loading dashboard...</div>
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {dashboardData?.welcomeMessage || 'Dashboard'}
        </h1>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData?.stats && Object.entries(dashboardData.stats).map(([key, value]) => (
          <div key={key} className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">
              {key.split(/(?=[A-Z])/).join(' ')}
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {value as string | number}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        <div className="space-y-4">
          {dashboardData?.recentActivity?.map((activity: any) => (
            <div key={activity.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
              <div className="font-medium">{activity.action}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Info */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Your Information</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Username:</span>
            <span className="font-medium">{user?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Roles:</span>
            <span className="font-medium">
              {user?.roles?.join(', ') || 'No roles assigned'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
