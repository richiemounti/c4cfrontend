// components/reports/viewer/ReportQuickActions.tsx
'use client';

import { Clock, Share2, Download, Archive } from 'lucide-react';
import { BaseReportData } from '@/types/reports';
import { canUserEditReport } from '@/lib/utils/reports';

interface ReportQuickActionsProps {
  report: BaseReportData;
  user: any;
  showVersionHistory: boolean;
  showComments: boolean;
  onToggleVersionHistory: () => void;
  onToggleComments: () => void;
  onExport: () => void;
  onArchive: () => void;
}

const ReportQuickActions: React.FC<ReportQuickActionsProps> = ({
  report,
  user,
  showVersionHistory,
  showComments,
  onToggleVersionHistory,
  onToggleComments,
  onExport,
  onArchive
}) => {
  const canEdit = canUserEditReport(report, user);

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-black mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button
          onClick={onToggleVersionHistory}
          className="w-full flex items-center px-3 py-2 text-c4c-petrol border border-c4c-petrol rounded-md hover:bg-c4c-grey-bg"
        >
          <Clock size={16} className="mr-2" />
          {showVersionHistory ? 'Hide' : 'Show'} Version History
        </button>

        <button
          onClick={onToggleComments}
          className="w-full flex items-center px-3 py-2 text-c4c-petrol border border-c4c-petrol rounded-md hover:bg-c4c-grey-bg"
        >
          <Share2 size={16} className="mr-2" />
          {showComments ? 'Hide' : 'Show'} Comments
        </button>

        <button
          onClick={onExport}
          className="w-full flex items-center px-3 py-2 text-c4c-petrol border border-c4c-petrol rounded-md hover:bg-c4c-grey-bg"
        >
          <Download size={16} className="mr-2" />
          Export Report
        </button>

        {canEdit && (
          <button
            onClick={onArchive}
            className="w-full flex items-center px-3 py-2 text-c4c-burgundy border border-c4c-pink rounded-md hover:bg-c4c-tint-coral"
          >
            <Archive size={16} className="mr-2" />
            Archive Report
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportQuickActions;