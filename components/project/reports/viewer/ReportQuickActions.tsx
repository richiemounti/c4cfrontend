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
      <h3 className="text-lg font-medium text-stratosphere mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button
          onClick={onToggleVersionHistory}
          className="w-full flex items-center px-3 py-2 text-sky border border-sky rounded-md hover:bg-sky-tint"
        >
          <Clock size={16} className="mr-2" />
          {showVersionHistory ? 'Hide' : 'Show'} Version History
        </button>
        
        <button
          onClick={onToggleComments}
          className="w-full flex items-center px-3 py-2 text-sky border border-sky rounded-md hover:bg-sky-tint"
        >
          <Share2 size={16} className="mr-2" />
          {showComments ? 'Hide' : 'Show'} Comments
        </button>

        <button
          onClick={onExport}
          className="w-full flex items-center px-3 py-2 text-sky border border-sky rounded-md hover:bg-sky-tint"
        >
          <Download size={16} className="mr-2" />
          Export Report
        </button>

        {canEdit && (
          <button
            onClick={onArchive}
            className="w-full flex items-center px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
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