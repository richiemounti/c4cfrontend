import { LoadingSpinner } from "./LoadingSpinner";

// components/auth/AuthButton.tsx
interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  isLoading, 
  variant = 'primary', 
  fullWidth = true, 
  children, 
  className, 
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-transparent border border-ochre-500 text-ochre-500 hover:bg-ochre-50';
      default:
        return 'bg-ochre-500 text-white hover:bg-ochre-900 border border-transparent';
    }
  };

  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`${fullWidth ? 'w-full' : ''} flex justify-center items-center py-3 px-4 rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ochre-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${getVariantClasses()} ${className}`}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        children
      )}
    </button>
  );
};