'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { processOAuthCallback } from '@/lib/api/oauth';

// Create a separate component to use the search params
function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      setIsProcessing(true);
      
      try {
        // Get token and user data from URL parameters
        const token = searchParams.get('token');
        const userDataString = searchParams.get('userData');
        
        if (!token || !userDataString) {
          setError('Authentication data missing');
          setTimeout(() => router.push('/account/login'), 3000);
          return;
        }

        // Process the OAuth data
        const authData = processOAuthCallback(token, userDataString);
        
        // Update user in auth context
        setUser(authData.data.user);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => router.push('/account/login'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [router, searchParams, setUser]);

  return (
    <>
      {error ? (
        <>
          <div className="text-red-500 mb-4">{error}</div>
          <p>Redirecting to login page...</p>
        </>
      ) : (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing authentication, please wait...</p>
        </>
      )}
    </>
  );
}

// Main component with Suspense boundary
const OAuthCallbackPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
        <Suspense fallback={
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        }>
          <CallbackHandler />
        </Suspense>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;