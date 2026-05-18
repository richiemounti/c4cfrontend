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
      
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="bg-yellow-100 p-3 rounded-full mb-4">
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
            
            <div className="space-y-3 w-full">
              <button
                onClick={() => router.back()}
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
              
              {isAuthenticated ? (
                <Link 
                  href="/dashboard" 
                  className="block w-full py-2 px-4 bg-primary-500 text-white rounded-md hover:bg-primary-400 transition-colors text-center"
                >
                  Return to Dashboard
                </Link>
              ) : (
                <Link 
                  href="/account/login" 
                  className="block w-full py-2 px-4 bg-primary-500 text-white rounded-md hover:bg-primary-400 transition-colors text-center"
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