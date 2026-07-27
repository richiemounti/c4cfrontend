// components/auth/ProtectedRoute.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, isOrgAdmin } from '@/utils/permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string; // Optional exact-role requirement (legacy — prefer requiredPermission/requireOrgAdmin below)
  requiredPermission?: string; // One of the 6 flag-checkable permission strings (see utils/permissions.ts)
  requireOrgAdmin?: boolean; // Requires the user to be an org-admin (or ConnectGo staff)
  organizationId?: string; // Scopes requiredPermission/requireOrgAdmin to a specific organization
}

const ProtectedRoute = ({
  children,
  requiredRole,
  requiredPermission,
  requireOrgAdmin,
  organizationId,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  const hasAccess = () => {
    if (!user) return false;
    if (user.isConnectGoStaff) return true;
    if (requireOrgAdmin && !isOrgAdmin(user, organizationId)) return false;
    if (requiredPermission && !hasPermission(user, requiredPermission, organizationId)) return false;
    if (requiredRole && user.primaryRole !== requiredRole) return false;
    return true;
  };

  useEffect(() => {
    // Only check after loading is complete
    if (!loading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/account/login');
      }
      // If access requirements aren't met, redirect to unauthorized
      else if (!hasAccess()) {
        router.push('/unauthorized');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loading, router, user, requiredRole, requiredPermission, requireOrgAdmin, organizationId]);

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

  // Show children only if authenticated and access requirements are met
  if (isAuthenticated && hasAccess()) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
};

export default ProtectedRoute;