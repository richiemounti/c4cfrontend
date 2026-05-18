// app/accept-invitation/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Lock, Mail, Building, Users } from 'lucide-react';
import { verifyInvitation, acceptInvitation } from '@/lib/api/user';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ErrorMessage } from '@/components/auth/ErrorMessage';
import { SuccessMessage } from '@/components/auth/SuccessMessage';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthError } from '@/hooks/useAuthError';
import { validatePassword, validatePasswordMatch } from '@/utils/validation';

interface InvitationData {
  email: string;
  role: string;
  organization: { name: string };
  projects: { name: string }[];
  invitedBy: { name: string; email: string };
  expiresAt: string;
}

const LoadingState = () => (
  <AuthLayout title="Verifying Invitation..." showBackToLogin={false}>
    <div className="flex justify-center py-8">
      <LoadingSpinner size="lg" />
    </div>
    <p className="text-center text-sky-500">Please wait while we verify your invitation...</p>
  </AuthLayout>
);

const AcceptInvitationContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [userName, setUserName] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const { error, handleError, clearErrors, getFieldError } = useAuthError();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setIsVerifying(false);
        handleError({ message: 'Invalid or missing invitation token' });
        return;
      }

      try {
        const result = await verifyInvitation(token);
        if (result.valid && result.data) {
          setTokenValid(true);
          setInvitationData(result.data);
          // Pre-fill name from email if available
          const emailUsername = result.data.email.split('@')[0];
          setName(emailUsername.replace(/[^a-zA-Z\s]/g, ' ').replace(/\s+/g, ' ').trim());
        } else {
          setTokenValid(false);
          handleError({ message: 'Invalid invitation token' });
        }
      } catch (err: any) {
        console.error('Token verification error:', err);
        setTokenValid(false);
        handleError({ message: 'Invalid or expired invitation token' });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const validateForm = (): boolean => {
    clearErrors();

    if (!userName.trim()) {
      handleError({ message: 'Username is required' });
      return false;
    }

    if (userName.length < 2) {
      handleError({ message: 'Username must be at least 2 characters long' });
      return false;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(userName)) {
      handleError({ message: 'Username can only contain letters, numbers, hyphens, and underscores' });
      return false;
    }

    if (!name.trim()) {
      handleError({ message: 'Full name is required' });
      return false;
    }

    if (name.length < 2) {
      handleError({ message: 'Name must be at least 2 characters long' });
      return false;
    }

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
      await acceptInvitation({
        token,
        userName: userName.trim(),
        name: name.trim(),
        password
      });

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Accept invitation error:', err);
      handleError(err);
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

  // Show loading state while verifying
  if (isVerifying) {
    return <LoadingState />;
  }

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <AuthLayout
        title="Invalid Invitation"
        subtitle="This invitation link is no longer valid"
        showBackToLogin={false}
      >
        <ErrorMessage message={error || 'This invitation link has expired or is invalid.'} />
        
        <div className="space-y-3">
          <AuthButton onClick={() => router.push('/account/login')}>
            Go to Login
          </AuthButton>
        </div>
      </AuthLayout>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <AuthLayout
        title="Welcome to C4C Platform!"
        showBackToLogin={false}
      >
        <SuccessMessage
          title="Account Created Successfully"
          message={`Welcome aboard! Your account has been set up and you can now access your organization's projects and collaborate with your team.`}
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

  // Show invitation details and setup form
  return (
    <AuthLayout
      title="Complete Your Account Setup"
      subtitle="You've been invited to join an organization on C4C Platform"
      showBackToLogin={false}
    >
      {/* Invitation Details Card */}
      {invitationData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-stratosphere-900 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Invitation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-sky-500">Email:</span>
                <span className="text-sm font-medium text-stratosphere-900">
                  {invitationData.email}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-sky-500">Role:</span>
                <Badge className="bg-ochre-100 text-ochre-800">
                  {invitationData.role}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-sky-500">Organization:</span>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1 text-forest-500" />
                  <span className="text-sm font-medium text-stratosphere-900">
                    {invitationData.organization.name}
                  </span>
                </div>
              </div>
              
              {invitationData.projects.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-sm text-sky-500">Projects:</span>
                  <div className="flex flex-col items-end">
                    {invitationData.projects.map((project, index) => (
                      <div key={index} className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-sky-500" />
                        <span className="text-sm text-stratosphere-900">
                          {project.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-sky-500">Invited by:</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-stratosphere-900">
                    {invitationData.invitedBy.name}
                  </div>
                  <div className="text-xs text-sky-500">
                    {invitationData.invitedBy.email}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Form */}
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          id="userName"
          name="userName"
          label="Username"
          icon={User}
          autoComplete="username"
          required
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="john_doe"
          error={getFieldError('userName')}
          helperText="Choose a unique username for your account"
        />

        <AuthInput
          id="name"
          name="name"
          label="Full Name"
          icon={User}
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          error={getFieldError('name')}
        />

        <AuthInput
          id="password"
          name="password"
          label="Password"
          icon={Lock}
          isPassword
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={getFieldError('password')}
          helperText="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
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
          {isLoading ? 'Creating Account...' : 'Complete Setup'}
        </AuthButton>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-sky-500">
          By completing your account setup, you agree to our{' '}
          <a href="#" className="text-ochre-500 hover:text-ochre-600 underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-ochre-500 hover:text-ochre-600 underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </AuthLayout>
  );
};

const AcceptInvitationPage = () => {
  return (
    <Suspense fallback={<LoadingState />}>
      <AcceptInvitationContent />
    </Suspense>
  );
};

export default AcceptInvitationPage;