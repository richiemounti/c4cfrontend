// components/auth/AuthLayout.tsx
import Image from 'next/image';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center bg-sky-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image 
                src="/levelnewlogo.PNG" 
                alt="C4C Platform" 
                width={120} 
                height={30} 
                className="h-8 w-auto mx-auto"
              />
            </Link>
            
            <h1 className="text-2xl font-semibold mt-6 text-stratosphere-900">{title}</h1>
            {subtitle && (
              <p className="text-sky-500 mt-2">{subtitle}</p>
            )}
          </div>

          {children}

          {showBackToLogin && (
            <div className="mt-8 text-center">
              <Link href="/account/login" className="text-sm text-ochre-500 hover:text-ochre-900 transition-colors">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};