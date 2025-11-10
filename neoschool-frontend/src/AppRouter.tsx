import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { Spinner } from './components/ui/spinner';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/auth/Login'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));
const UnauthorizedPage = lazy(() => import('./pages/Unauthorized'));

// Add more lazy-loaded pages as needed
// const UsersPage = lazy(() => import('./pages/Users'));
// const ReportsPage = lazy(() => import('./pages/Reports'));

/**
 * AppRouter handles all the routing in the application
 * - Uses lazy loading for better performance
 * - Wraps routes in MainLayout for consistent layout
 * - Uses PrivateRoute for protected routes
 */
export const AppRouter = () => {
  return (
    <Suspense 
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <MainLayout>
            <LoginPage />
          </MainLayout>
        } />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <MainLayout>
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          </MainLayout>
        } />
        
        <Route path="/dashboard" element={
          <MainLayout>
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          </MainLayout>
        } />
        
        <Route path="/profile" element={
          <MainLayout>
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          </MainLayout>
        } />
        
        <Route path="/settings" element={
          <MainLayout>
            <PrivateRoute requiredRoles={['ADMIN']}>
              <SettingsPage />
            </PrivateRoute>
          </MainLayout>
        } />
        
        {/* Admin-only routes example */}
        {/* 
        <Route path="/users" element={
          <MainLayout>
            <PrivateRoute requiredRoles={['ADMIN']}>
              <UsersPage />
            </PrivateRoute>
          </MainLayout>
        } />
        */}
        
        {/* Error Pages */}
        <Route path="/unauthorized" element={
          <MainLayout>
            <UnauthorizedPage />
          </MainLayout>
        } />
        
        <Route path="/404" element={
          <MainLayout>
            <NotFoundPage />
          </MainLayout>
        } />
        
        {/* Catch all route - redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};
