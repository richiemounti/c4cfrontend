// components/auth/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, type = 'error' }) => {
  const getColorClasses = () => {
    switch (type) {
      case 'warning':
        return 'bg-gold-50 text-gold-900 border border-gold-100';
      case 'info':
        return 'bg-neutral-50 text-neutral-900 border border-neutral-100';
      default:
        return 'bg-red-50 text-red-600 border border-red-100';
    }
  };

  return (
    <div className={`p-3 rounded-md mb-6 ${getColorClasses()}`}>
      {message}
    </div>
  );
};