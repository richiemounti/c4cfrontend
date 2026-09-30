// components/auth/AuthInput.tsx
import { forwardRef, useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  isPassword?: boolean;
  helperText?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon: Icon, error, isPassword, helperText, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type;

    return (
      <div className="space-y-1">
        <label htmlFor={props.id} className="block text-sm font-medium text-black">
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-c4c-petrol" />
            </div>
          )}
          <input
            ref={ref}
            {...props}
            type={inputType}
            className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} ${
              isPassword ? 'pr-10' : 'pr-3'
            } py-2 border ${
              error ? 'border-c4c-burgundy' : 'border-c4c-rule'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-c4c-petrol focus:border-c4c-petrol transition-colors ${className}`}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-c4c-petrol" />
              ) : (
                <Eye className="h-5 w-5 text-c4c-petrol" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-c4c-burgundy">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-c4c-petrol">{helperText}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';