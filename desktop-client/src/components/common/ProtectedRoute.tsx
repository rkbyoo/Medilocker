/**
 * Protected Route Component
 * Handles route protection based on authentication and user roles
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { ROUTES } from '@/config/constants';
import type { UserRole } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  redirectTo = ROUTES.LOGIN,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const dashboardRoute = user.role === 'doctor' 
      ? ROUTES.DOCTOR.DASHBOARD 
      : ROUTES.RECEPTIONIST.DASHBOARD;
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
};