// components/reports/viewer/ReportMetadata.tsx
'use client';

import { 
  Calendar, User, Clock, Download, Eye, MessageSquare, 
  GitBranch, Database, Tag, FileText, Users 
} from 'lucide-react';
import { BaseReportData } from '@/types/reports';
import { formatReportDate, getRelativeTime, formatFileSize } from '@/lib/utils/reports';

interface ReportMetadataProps {
  report: BaseReportData;
  onShowVersionHistory: () => void;
  onShowComments: () => void;
}

const ReportMetadata: React.FC<ReportMetadataProps> = ({
  report,
  onShowVersionHistory,
  onShowComments
}) => {
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-medium text-stratosphere">Report Details</h3>
      
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Calendar size={16} className="text-sky" />
          <div>
            <p className="text-sm font-medium text-stratosphere">Created</p>
            <p className="text-xs text-sky">{formatReportDate(report.createdAt)}</p>
            <p className="text-xs text-sky">{getRelativeTime(report.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <User size={16} className="text-sky" />
          <div>
            <p className="text-sm font-medium text-stratosphere">Created By</p>
            <p className="text-xs text-sky">{report.creator.name}</p>
            {report.creator.email && (
              <p className="text-xs text-sky">{report.creator.email}</p>
            )}
          </div>
        </div>

        {report.lastUpdatedBy && (
          <div className="flex items-center space-x-3">
            <Clock size={16} className="text-sky" />
            <div>
              <p className="text-sm font-medium text-stratosphere">Last Updated</p>
              <p className="text-xs text-sky">{formatReportDate(report.updatedAt)}</p>
              <p className="text-xs text-sky">by {report.lastUpdatedBy.name}</p>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <GitBranch size={16} className="text-sky" />
          <div>
            <p className="text-sm font-medium text-stratosphere">Version</p>
            <p className="text-xs text-sky">v{report.version}</p>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default ReportMetadata;