// app/unauthorized/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const UnauthorizedPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center bg-c4c-grey-bg">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="bg-c4c-tint-gold p-3 rounded-full mb-4">
              <AlertTriangle className="h-10 w-10 text-c4c-yellow" />
            </div>

            <h1 className="text-2xl font-bold text-black mb-2">Access Denied</h1>

            <p className="text-c4c-petrol mb-6">
              You don't have permission to access this page. Please contact your organization's admin (not ConnectGo support) if you believe this is an error — for example, to request a subscription or access change.
            </p>
            
            <div className="space-y-3 w-full">
              <button
                onClick={() => router.back()}
                className="w-full py-2 px-4 bg-c4c-grey-bg text-c4c-petrol rounded-md hover:bg-c4c-rule transition-colors"
              >
                Go Back
              </button>

              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="block w-full py-2 px-4 bg-c4c-coral text-black rounded-md hover:bg-c4c-petrol hover:text-white transition-colors text-center"
                >
                  Return to Dashboard
                </Link>
              ) : (
                <Link
                  href="/account/login"
                  className="block w-full py-2 px-4 bg-c4c-coral text-black rounded-md hover:bg-c4c-petrol hover:text-white transition-colors text-center"
                >
                  Login with Different Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UnauthorizedPage;