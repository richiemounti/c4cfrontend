// app/account/signup/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { initiateGoogleLogin, initiateMicrosoftLogin } from '@/lib/api/oauth';

// ─── Validation rules (mirrors validation.auth.middleware.ts on the backend) ──

const validators: Record<string, (value: string) => string> = {
  userName: (value) => {
    const v = value.trim();
    if (!v) return 'Username is required';
    if (v.length < 2) return 'Username must be at least 2 characters';
    if (v.length > 50) return 'Username must be 50 characters or less';
    if (!/^[a-zA-Z0-9_-]+$/.test(v))
      return 'Username can only contain letters, numbers, hyphens, and underscores';
    return '';
  },
  name: (value) => {
    const v = value.trim();
    if (!v) return 'Full name is required';
    if (v.length < 2) return 'Name must be at least 2 characters';
    if (v.length > 50) return 'Name must be 50 characters or less';
    if (!/^[a-zA-Z\s]+$/.test(v)) return 'Name can only contain letters and spaces';
    return '';
  },
  email: (value) => {
    if (!value.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return 'Please provide a valid email address';
    return '';
  },
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
    if (!/(?=.*[@$!%*?&])/.test(value))
      return 'Password must contain at least one special character (@$!%*?&)';
    return '';
  },
};

type FieldKey = 'userName' | 'name' | 'email' | 'password';

const FIELDS: FieldKey[] = ['userName', 'name', 'email', 'password'];

// ─── Component ──────────────────────────────────────────────────────────────

const SignupPage = () => {
  const router = useRouter();
  const { signup, error: authError, clearError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<Record<FieldKey, string>>({
    userName: '',
    name: '',
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<FieldKey, string>>({
    userName: '',
    name: '',
    email: '',
    password: '',
  });

  // Track which fields the user has interacted with (so we don't show red before they type)
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    userName: false,
    name: false,
    email: false,
    password: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
    clearError();
  }, [isAuthenticated, router, clearError]);

  // Sync auth-context errors
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const validateField = (name: FieldKey, value: string) =>
    validators[name]?.(value) ?? '';

  const getInputClass = (field: FieldKey) => {
    const base =
      'block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors';
    if (!touched[field])
      return `${base} border-grey-400 focus:ring-primary-500 focus:border-primary-500`;
    if (fieldErrors[field])
      return `${base} border-red-500 focus:ring-red-300 focus:border-red-500`;
    return `${base} border-green-500 focus:ring-green-300 focus:border-green-500`;
  };

  const getPasswordInputClass = () => {
    const base =
      'block w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors';
    if (!touched.password)
      return `${base} border-grey-400 focus:ring-primary-500 focus:border-primary-500`;
    if (fieldErrors.password)
      return `${base} border-red-500 focus:ring-red-300 focus:border-red-500`;
    return `${base} border-green-500 focus:ring-green-300 focus:border-green-500`;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Re-validate in real-time once the user has already touched the field
    if (touched[name as FieldKey]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: validateField(name as FieldKey, value),
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name as FieldKey, value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark every field as touched and run all validators
    const newTouched = FIELDS.reduce(
      (acc, f) => ({ ...acc, [f]: true }),
      {} as Record<FieldKey, boolean>,
    );
    setTouched(newTouched);

    const newErrors = FIELDS.reduce(
      (acc, f) => ({ ...acc, [f]: validateField(f, formData[f]) }),
      {} as Record<FieldKey, string>,
    );
    setFieldErrors(newErrors);

    if (Object.values(newErrors).some((e) => e !== '')) return;

    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signup(formData);
      router.push('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      initiateGoogleLogin();
    } catch (err) {
      setError('Failed to signup with Google');
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignup = async () => {
    setIsLoading(true);
    try {
      initiateMicrosoftLogin();
    } catch (err) {
      setError('Failed to signup with Microsoft');
      console.error(err);
      setIsLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

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
            <h1 className="text-2xl font-semibold mt-6 text-grey-600">Create an account</h1>
            <p className="text-grey-500 mt-2">Sign up to get started</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* ── Username ── */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-grey-600 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-grey-400" />
                </div>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  autoComplete="username"
                  value={formData.userName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('userName')}
                  placeholder="username"
                  aria-describedby={fieldErrors.userName ? 'userName-error' : undefined}
                  aria-invalid={touched.userName && !!fieldErrors.userName}
                />
              </div>
              {touched.userName && fieldErrors.userName && (
                <p id="userName-error" className="mt-1 text-xs text-red-500">
                  {fieldErrors.userName}
                </p>
              )}
              {!fieldErrors.userName && (
                <p className="mt-1 text-xs text-grey-400">
                  Letters, numbers, hyphens, and underscores only (2–50 characters)
                </p>
              )}
            </div>

            {/* ── Full Name ── */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-grey-600 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-grey-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('name')}
                  placeholder="John Doe"
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  aria-invalid={touched.name && !!fieldErrors.name}
                />
              </div>
              {touched.name && fieldErrors.name && (
                <p id="name-error" className="mt-1 text-xs text-red-500">
                  {fieldErrors.name}
                </p>
              )}
              {!fieldErrors.name && (
                <p className="mt-1 text-xs text-grey-400">
                  Letters and spaces only (2–50 characters)
                </p>
              )}
            </div>

            {/* ── Email ── */}
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
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClass('email')}
                  placeholder="your@email.com"
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  aria-invalid={touched.email && !!fieldErrors.email}
                />
              </div>
              {touched.email && fieldErrors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-500">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* ── Password ── */}
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
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getPasswordInputClass()}
                  placeholder="••••••••"
                  aria-describedby={fieldErrors.password ? 'password-error' : 'password-hint'}
                  aria-invalid={touched.password && !!fieldErrors.password}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-grey-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-grey-400" />
                  )}
                </button>
              </div>
              {touched.password && fieldErrors.password ? (
                <p id="password-error" className="mt-1 text-xs text-red-500">
                  {fieldErrors.password}
                </p>
              ) : (
                <p id="password-hint" className="mt-1 text-xs text-grey-500">
                  At least 8 characters with one uppercase, one lowercase, one number, and one special character (@$!%*?&).
                </p>
              )}
            </div>

            {/* ── Terms ── */}
            <div className="bg-grey-50 border border-grey-200 rounded-lg p-4">
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 text-stratosphere-500 border-grey-400 rounded focus:ring-stratosphere-500 mt-0.5"
                />
                <label htmlFor="terms" className="ml-3 block text-sm text-grey-600">
                  I acknowledge that I have read and agree to the{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-stratosphere-500 hover:text-stratosphere-400 underline font-medium"
                  >
                    Terms &amp; Conditions
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-stratosphere-500 hover:text-stratosphere-400 underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                  . I understand that I will need to digitally sign the End User License Agreement after account creation.
                </label>
              </div>
            </div>

            {/* ── Submit ── */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>
          </form>

          {/* ── OAuth ── */}
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
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className="flex justify-center items-center py-2 px-4 border border-grey-400 rounded-md shadow-sm bg-white hover:bg-grey-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={handleMicrosoftSignup}
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
              Already have an account?{' '}
              <Link href="/account/login" className="text-stratosphere-500 hover:text-stratosphere-400 font-medium">
                Log in
              </Link>
            </p>
            <p className="text-xs text-grey-400 mt-3">
              Need help? Visit our{' '}
              <Link href="/terms" className="text-stratosphere-500 hover:text-stratosphere-400 underline">
                Terms &amp; Conditions
              </Link>{' '}
              for more information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
