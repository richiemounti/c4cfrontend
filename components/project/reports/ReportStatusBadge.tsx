// components/reports/ReportStatusBadge.tsx
'use client';

import { ReportStatus } from '@/types/reports';
import { getReportStatusLabel, getReportStatusBadgeClass } from '@/lib/utils/reports';

interface ReportStatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = false
}) => {
  const label = getReportStatusLabel(status);
  const badgeClass = getReportStatusBadgeClass(status);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const icons = {
    draft: '📝',
    generated: '✅',
    approved: '👍',
    published: '🚀',
    archived: '📁'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${badgeClass} ${sizeClasses[size]}`}>
      {showIcon && (
        <span className="mr-1">{icons[status]}</span>
      )}
      {label}
    </span>
  );
};

export default ReportStatusBadge;