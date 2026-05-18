// app/account/login/page.tsx - Updated with better EULA flow
'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { initiateGoogleLogin, initiateMicrosoftLogin } from '@/lib/api/oauth';

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, error: authError, clearError, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const fromUrl = searchParams.get('from');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (fromUrl && fromUrl.startsWith('/')) {
        router.push(fromUrl);
      } else if (user.isConnectGoStaff) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }

    // Clear any previous auth errors when component mounts
    clearError();
  }, [isAuthenticated, user, router, clearError, fromUrl]);

  // Update local error when auth error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await login({ email, password });
      // Don't redirect here - the useEffect above will handle it
      // This allows the dashboard to check EULA status first
    } catch (err) {
      // Error is handled by the auth context and updated to our local state via the useEffect
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect to Google OAuth
      initiateGoogleLogin();
      // No need to setIsLoading(false) since we're redirecting
    } catch (err) {
      setError('Failed to login with Google');
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect to Microsoft OAuth
      initiateMicrosoftLogin();
      // No need to setIsLoading(false) since we're redirecting
    } catch (err) {
      setError('Failed to login with Microsoft');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image 
                src="/levelogo.PNG" 
                alt="LEVEL" 
                width={120} 
                height={30} 
                className="h-8 w-auto mx-auto"
              />
            </Link>
            <h1 className="text-2xl font-semibold mt-6 text-grey-600">Welcome back</h1>
            <p className="text-grey-500 mt-2">Login to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-grey-600 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-grey-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-grey-400 rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere-500 focus:border-stratosphere-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-grey-600 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-grey-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-grey-400 rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere-500 focus:border-stratosphere-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-grey-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-grey-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-stratosphere-500 border-grey-400 rounded focus:ring-stratosphere-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-grey-500">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/account/forgot-password" className="text-stratosphere-500 hover:text-stratosphere-400">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-stratosphere-500 hover:bg-stratosphere-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stratosphere-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-grey-400"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-grey-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex justify-center items-center py-2 px-4 border border-grey-400 rounded-md shadow-sm bg-white hover:bg-grey-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={handleMicrosoftLogin}
                disabled={isLoading}
                className="flex justify-center items-center py-2 px-4 border border-grey-400 rounded-md shadow-sm bg-white hover:bg-grey-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 23 23">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                Microsoft
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-grey-500">
              Don't have an account?{' '}
              <Link href="/account/signup" className="text-stratosphere-500 hover:text-stratosphere-400 font-medium">
                Sign up
              </Link>
            </p>
            <p className="text-xs text-grey-400 mt-3">
              By using our platform, you agree to our{' '}
              <Link href="/terms" className="text-stratosphere-500 hover:text-stratosphere-400 underline">
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-stratosphere-500 hover:text-stratosphere-400 underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}