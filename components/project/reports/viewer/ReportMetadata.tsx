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
      <h3 className="text-lg font-medium text-black">Report Details</h3>

      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Calendar size={16} className="text-c4c-petrol" />
          <div>
            <p className="text-sm font-medium text-black">Created</p>
            <p className="text-xs text-c4c-petrol">{formatReportDate(report.createdAt)}</p>
            <p className="text-xs text-c4c-petrol">{getRelativeTime(report.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <User size={16} className="text-c4c-petrol" />
          <div>
            <p className="text-sm font-medium text-black">Created By</p>
            <p className="text-xs text-c4c-petrol">{report.creator.name}</p>
            {report.creator.email && (
              <p className="text-xs text-c4c-petrol">{report.creator.email}</p>
            )}
          </div>
        </div>

        {report.lastUpdatedBy && (
          <div className="flex items-center space-x-3">
            <Clock size={16} className="text-c4c-petrol" />
            <div>
              <p className="text-sm font-medium text-black">Last Updated</p>
              <p className="text-xs text-c4c-petrol">{formatReportDate(report.updatedAt)}</p>
              <p className="text-xs text-c4c-petrol">by {report.lastUpdatedBy.name}</p>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <GitBranch size={16} className="text-c4c-petrol" />
          <div>
            <p className="text-sm font-medium text-black">Version</p>
            <p className="text-xs text-c4c-petrol">v{report.version}</p>
          </div>
        </div>
      </div>


    </div>
  );
};

export default ReportMetadata;