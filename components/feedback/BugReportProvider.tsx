// components/feedback/BugReportProvider.tsx
import { ReactNode } from 'react';
import BugReportButton from './BugReportButton';

interface BugReportProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

/**
 * Provides the bug report button on the page
 * Wrap your app/layout with this component to enable bug reporting
 */
const BugReportProvider: React.FC<BugReportProviderProps> = ({ 
  children, 
  enabled = true // Allow disabling on specific pages if needed
}) => {
  return (
    <>
      {children}
      {enabled && <BugReportButton />}
    </>
  );
};

export default BugReportProvider;