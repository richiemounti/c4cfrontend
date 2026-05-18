// app/account/reset-password/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { resetPassword, verifyResetToken } from '@/lib/api/auth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ErrorMessage } from '@/components/auth/ErrorMessage';
import { SuccessMessage } from '@/components/auth/SuccessMessage';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';
import { useAuthError } from '@/hooks/useAuthError';
import { validatePassword, validatePasswordMatch } from '@/utils/validation';

// Loading component to show while the main content loads
const LoadingState = () => (
  <AuthLayout title="Verifying..." showBackToLogin={false}>
    <div className="flex justify-center py-8">
      <LoadingSpinner size="lg" />
    </div>
    <p className="text-center text-sky-500">Please wait while we verify your reset link...</p>
  </AuthLayout>
);

// Main content component that uses client-side hooks
const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const { error, handleError, clearErrors, getFieldError } = useAuthError();

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setIsVerifying(false);
        handleError({ message: 'Invalid or missing password reset token' });
        return;
      }

      try {
        const result = await verifyResetToken(token);
        setTokenValid(result.valid);
      } catch (err: any) {
        console.error('Token verification error:', err);
        setTokenValid(false);
        handleError({ message: 'Invalid or expired password reset token' });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const validateForm = (): boolean => {
    clearErrors();
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      handleError({ message: passwordError });
      return false;
    }
    
    const matchError = validatePasswordMatch(password, confirmPassword);
    if (matchError) {
      handleError({ message: matchError });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;
    
    setIsLoading(true);
    
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Reset password error:', err);
      
      // Handle specific error cases
      if (err.message.includes('expired')) {
        handleError({ 
          message: 'This reset link has expired. Please request a new password reset link.' 
        });
      } else if (err.message.includes('invalid')) {
        handleError({ 
          message: 'Invalid reset link. Please request a new password reset link.' 
        });
      } else {
        handleError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoToLogin = () => {
    router.push('/account/login');
  };

  // Show loading state while verifying token
  if (isVerifying) {
    return <LoadingState />;
  }

  // Show error message if token is invalid
  if (tokenValid === false) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        subtitle="The password reset link is invalid or has expired"
        showBackToLogin={false}
      >
        <ErrorMessage 
          message={error || 'This password reset link is no longer valid.'} 
        />
        
        <div className="space-y-4">
          <AuthButton onClick={() => router.push('/account/forgot-password')}>
            Request New Reset Link
          </AuthButton>
          
          <AuthButton 
            variant="secondary" 
            onClick={() => router.push('/account/login')}
          >
            Back to Login
          </AuthButton>
        </div>
      </AuthLayout>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <AuthLayout
        title="Password Reset Complete"
        showBackToLogin={false}
      >
        <SuccessMessage
          title="Success!"
          message="Your password has been successfully reset. You can now access your account with your new password."
          actionButton={
            <div className="space-y-3">
              <AuthButton onClick={handleGoToDashboard}>
                Go to Dashboard
              </AuthButton>
              <AuthButton variant="secondary" onClick={handleGoToLogin}>
                Go to Login
              </AuthButton>
            </div>
          }
        />
      </AuthLayout>
    );
  }

  // Show password reset form
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Please enter your new password"
    >
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          id="password"
          name="password"
          label="New Password"
          icon={Lock}
          isPassword
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={getFieldError('password')}
          helperText="Password must be at least 8 characters long with one uppercase, one lowercase, one number, and one special character"
        />

        <AuthInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          icon={Lock}
          isPassword
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          error={getFieldError('confirmPassword')}
        />

        <AuthButton type="submit" isLoading={isLoading}>
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </AuthButton>
      </form>
    </AuthLayout>
  );
};

// Main component with Suspense boundary
const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;