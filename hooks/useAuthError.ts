// hooks/useAuthError.ts
import { useState } from 'react';

interface ValidationError {
  field: string;
  message: string;
}

export const useAuthError = () => {
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleError = (err: any) => {
    if (err?.response?.data?.validationErrors) {
      // Handle validation errors
      const errors: Record<string, string> = {};
      err.response.data.validationErrors.forEach((validationError: ValidationError) => {
        errors[validationError.field] = validationError.message;
      });
      setFieldErrors(errors);
      setError('Please correct the errors below');
    } else if (err?.message) {
      // Handle general errors
      setError(err.message);
      setFieldErrors({});
    } else {
      // Handle unknown errors
      setError('An unexpected error occurred. Please try again.');
      setFieldErrors({});
    }
  };

  const clearErrors = () => {
    setError('');
    setFieldErrors({});
  };

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors[field];
  };

  return {
    error,
    fieldErrors,
    handleError,
    clearErrors,
    getFieldError,
    hasErrors: !!(error || Object.keys(fieldErrors).length > 0)
  };
};