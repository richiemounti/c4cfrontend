// components/reports/ReportCard.tsx
'use client';

import { useState } from 'react';
import { 
  Eye, Download, MoreHorizontal, Calendar, User, 
  CheckCircle, Clock, AlertTriangle 
} from 'lucide-react';
import { BaseReportData } from '@/types/reports';
import ReportStatusBadge from './ReportStatusBadge';
import ReportTypeIcon from './ReportTypeIcon';
import ReportActions from './ReportActions';
import { 
  getReportTypeLabel, 
  formatReportDate, 
  getRelativeTime,
  calculateReportUrgency,
  getUrgencyBadgeClass,
  calculateCompletionPercentage 
} from '@/lib/utils/reports';

interface ReportCardProps {
  report: BaseReportData;
  onView: () => void;
  onEdit: () => void;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
  onDelete: () => void;
  selected?: boolean;
  onSelect?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onView,
  onEdit,
  onExport,
  onDelete,
  selected = false,
  onSelect
}) => {
  const [showActions, setShowActions] = useState(false);
  const urgency = calculateReportUrgency(report);
  const completionPercentage = calculateCompletionPercentage(report);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, input, [role="button"]')) {
      return;
    }
    onView();
  };

  return (
    <div 
      className={`bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
        selected 
          ? 'border-sky shadow-md' 
          : 'border-sky-tint hover:border-sky'
      }`}
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-sky-tint">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className="rounded border-sky text-sky focus:ring-sky"
              />
            )}
            
            <ReportTypeIcon type={report.reportType} size={24} />
            
            <div className="flex-1">
              <h3 className="text-sm font-medium text-stratosphere line-clamp-2">
                {report.title}
              </h3>
              <p className="text-xs text-sky mt-1">
                {getReportTypeLabel(report.reportType)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ReportStatusBadge status={report.status} size="sm" />
            
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="p-1 rounded text-sky hover:bg-sky-tint"
              >
                <MoreHorizontal size={16} />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-8 z-10">
                  <ReportActions
                    report={report}
                    onView={onView}
                    onEdit={onEdit}
                    onExport={onExport}
                    onDelete={onDelete}
                    compact={false}
                    onClose={() => setShowActions(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-stratosphere">Progress</span>
            <span className="text-xs text-sky">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-sky-tint rounded-full h-2">
            <div 
              className="bg-sky h-2 rounded-full transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center text-sky">
            <Calendar size={12} className="mr-1" />
            <span>{formatReportDate(report.createdAt)}</span>
          </div>
          
          <div className="flex items-center text-sky">
            <User size={12} className="mr-1" />
            <span>{report.creator.name}</span>
          </div>
        </div>

        {/* Summary Stats */}
        {report.metadata?.summary && (
          <div className="bg-sky-tint rounded-md p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-semibold text-stratosphere">
                  {report.metadata.summary.totalItems || 0}
                </div>
                <div className="text-xs text-sky">Total Items</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-stratosphere">
                  {report.metadata.summary.completedItems || 0}
                </div>
                <div className="text-xs text-sky">Completed</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-stratosphere">
                  {report.version}
                </div>
                <div className="text-xs text-sky">Version</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 border-t border-sky-tint bg-sky-tint/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyBadgeClass(urgency)}`}>
              {urgency}
            </span>
            
            {report.metadata?.workflowHistory && report.metadata.workflowHistory.length > 0 && (
              <span className="text-xs text-sky">
                <Clock size={12} className="inline mr-1" />
                {getRelativeTime(report.updatedAt)}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {report.metadata?.exportHistory && report.metadata.exportHistory.length > 0 && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Exported
              </span>
            )}
            
            {urgency === 'critical' && (
              <AlertTriangle size={14} className="text-red-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;