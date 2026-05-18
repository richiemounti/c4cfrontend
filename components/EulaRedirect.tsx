// components/EulaRedirect.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { checkEulaStatus } from '@/lib/api/eula';
import { FileText, AlertCircle } from 'lucide-react';

// Routes that don't require EULA acceptance
const EULA_EXEMPT_ROUTES = [
  '/account/login',
  '/account/signup',
  '/account/forgot-password',
  '/account/reset-password',
  '/terms',
  '/privacy',
  '/auth/callback'
];

const EulaRedirect = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [eulaStatus, setEulaStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showEulaModal, setShowEulaModal] = useState(false);

  // Check if current route is exempt from EULA check
  const isExemptRoute = EULA_EXEMPT_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  useEffect(() => {
    const checkEula = async () => {
      // Skip check if user is not authenticated, route is exempt, or auth is still loading
      if (!isAuthenticated || isExemptRoute || authLoading) {
        return;
      }

      try {
        setIsChecking(true);
        const status = await checkEulaStatus();
        setEulaStatus(status);
        
        // Show modal if EULA signature is required
        if (status.requiresSignature) {
          setShowEulaModal(true);
        }
      } catch (error) {
        console.error('Error checking EULA status:', error);
        // Don't block the user if the check fails
      } finally {
        setIsChecking(false);
      }
    };

    checkEula();
  }, [isAuthenticated, pathname, authLoading, isExemptRoute]);

  const handleGoToTerms = () => {
    setShowEulaModal(false);
    router.push('/terms');
  };

  const handleContinueWithoutSigning = () => {
    setShowEulaModal(false);
    // Allow user to continue but they may face restrictions
  };

  // Don't render anything while checking auth or EULA status
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere-500 mx-auto mb-4"></div>
          <p className="text-grey-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      
      {/* EULA Required Modal */}
      {showEulaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-grey-600 mb-2">
                Terms & Conditions Required
              </h3>
              <p className="text-grey-500 text-sm">
                You need to review and sign the End User License Agreement to access all platform features.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-800 font-medium mb-1">Action Required</p>
                  <p className="text-amber-700">
                    Some platform features may be restricted until you complete the digital signature process.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleGoToTerms}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-stratosphere-500 hover:bg-stratosphere-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stratosphere-500"
              >
                Review & Sign Terms
              </button>
              
              <button
                onClick={handleContinueWithoutSigning}
                className="w-full flex justify-center py-2 px-4 border border-grey-300 rounded-md text-grey-700 bg-white hover:bg-grey-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grey-500"
              >
                Continue Without Signing
              </button>
            </div>

            <p className="text-xs text-grey-500 text-center mt-4">
              You can access Terms & Conditions anytime from your account settings.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default EulaRedirect;