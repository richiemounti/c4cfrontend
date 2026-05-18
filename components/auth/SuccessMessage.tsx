// components/auth/SuccessMessage.tsx
import { Check } from 'lucide-react';

interface SuccessMessageProps {
  title: string;
  message: string;
  actionButton?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  title, 
  message, 
  actionButton,
  secondaryAction 
}) => {
  return (
    <div className="text-center">
      <div className="mt-6 flex justify-center mb-6">
        <div className="rounded-full bg-forest-100 p-3">
          <Check className="h-8 w-8 text-forest-500" />
        </div>
      </div>
      <h2 className="text-2xl font-semibold text-stratosphere-900 mb-4">{title}</h2>
      <p className="text-sky-500 mb-6">{message}</p>
      
      {actionButton && (
        <div className="space-y-4">
          {actionButton}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
