// components/auth/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, type = 'error' }) => {
  const getColorClasses = () => {
    switch (type) {
      case 'warning':
        return 'bg-ochre-50 text-ochre-900 border border-ochre-100';
      case 'info':
        return 'bg-sky-50 text-sky-900 border border-sky-100';
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