// components/auth/AuthLayout.tsx
import Link from 'next/link';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackToLogin?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  showBackToLogin = true 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-c4c-grey-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logos/Primary logo_black.png"
                alt="Citizens for Change"
                width={170}
                height={74}
                style={{ height: 48, width: 'auto' }}
                priority
              />
            </Link>

            <h1 className="text-2xl font-semibold mt-6 text-black">{title}</h1>
            {subtitle && (
              <p className="text-c4c-petrol mt-2">{subtitle}</p>
            )}
          </div>

          {children}

          {showBackToLogin && (
            <div className="mt-8 text-center">
              <Link href="/account/login" className="text-sm text-c4c-petrol hover:text-black transition-colors">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};