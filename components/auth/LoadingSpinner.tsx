// components/auth/LoadingSpinner.tsx
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4 border-2';
      case 'lg':
        return 'h-12 w-12 border-4';
      default:
        return 'h-8 w-8 border-4';
    }
  };

  return (
    <div className={`animate-spin ${getSizeClasses()} border-ochre-500 border-t-transparent rounded-full`} />
  );
};
