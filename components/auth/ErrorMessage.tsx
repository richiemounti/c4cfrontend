// components/auth/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, type = 'error' }) => {
  const getColorClasses = () => {
    switch (type) {
      case 'warning':
        return 'bg-c4c-tint-gold text-black border border-c4c-yellow';
      case 'info':
        return 'bg-c4c-grey-bg text-black border border-c4c-rule';
      default:
        return 'bg-c4c-tint-coral text-c4c-burgundy border border-c4c-pink';
    }
  };

  return (
    <div className={`p-3 rounded-md mb-6 ${getColorClasses()}`}>
      {message}
    </div>
  );
};