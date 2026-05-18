// app/account/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '@/lib/api/auth';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ErrorMessage } from '@/components/auth/ErrorMessage';
import { SuccessMessage } from '@/components/auth/SuccessMessage';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { useAuthError } from '@/hooks/useAuthError';
import { validateEmail } from '@/utils/validation';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { error, handleError, clearErrors, getFieldError } = useAuthError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      handleError({ message: emailError });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
    setEmail('');
    clearErrors();
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your inbox"
        showBackToLogin={false}
      >
        <SuccessMessage
          title="Reset link sent"
          message={`We've sent a password reset link to ${email}. Please check your email and follow the instructions.`}
          actionButton={
            <AuthButton onClick={() => router.push('/account/login')}>
              Back to Login
            </AuthButton>
          }
          secondaryAction={
            <div className="text-center">
              <p className="text-sm text-sky-500">
                Didn't receive the email?{' '}
                <button 
                  onClick={handleTryAgain}
                  className="text-ochre-500 hover:text-ochre-900 font-medium transition-colors"
                >
                  Try again
                </button>
              </p>
            </div>
          }
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password"
    >
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          error={getFieldError('email')}
        />

        <AuthButton type="submit" isLoading={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </AuthButton>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center text-sm text-ochre-500 hover:text-ochre-900 transition-colors mx-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Go Back
        </button>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;