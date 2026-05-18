// components/auth/ProtectedRoute.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string; // Optional role requirement for more specific access control
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only check after loading is complete
    if (!loading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/account/login');
      }
      // If a specific role is required, check for it
      else if (requiredRole && user?.primaryRole !== requiredRole) {
        // User doesn't have the required role
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, loading, router, user, requiredRole]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show children only if authenticated and has required role (if any)
  if (isAuthenticated && (!requiredRole || user?.primaryRole === requiredRole)) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
};

export default ProtectedRoute;