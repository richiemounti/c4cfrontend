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
          ? 'border-neutral shadow-md' 
          : 'border-neutral-tint hover:border-neutral'
      }`}
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-neutral-tint">
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
                className="rounded border-neutral text-neutral focus:ring-neutral"
              />
            )}
            
            <ReportTypeIcon type={report.reportType} size={24} />
            
            <div className="flex-1">
              <h3 className="text-sm font-medium text-ink line-clamp-2">
                {report.title}
              </h3>
              <p className="text-xs text-neutral mt-1">
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
                className="p-1 rounded text-neutral hover:bg-neutral-tint"
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
            <span className="text-xs font-medium text-ink">Progress</span>
            <span className="text-xs text-neutral">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-neutral-tint rounded-full h-2">
            <div 
              className="bg-neutral h-2 rounded-full transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center text-neutral">
            <Calendar size={12} className="mr-1" />
            <span>{formatReportDate(report.createdAt)}</span>
          </div>
          
          <div className="flex items-center text-neutral">
            <User size={12} className="mr-1" />
            <span>{report.creator.name}</span>
          </div>
        </div>

        {/* Summary Stats */}
        {report.metadata?.summary && (
          <div className="bg-neutral-tint rounded-md p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-semibold text-ink">
                  {report.metadata.summary.totalItems || 0}
                </div>
                <div className="text-xs text-neutral">Total Items</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-ink">
                  {report.metadata.summary.completedItems || 0}
                </div>
                <div className="text-xs text-neutral">Completed</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-ink">
                  {report.version}
                </div>
                <div className="text-xs text-neutral">Version</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 border-t border-neutral-tint bg-neutral-tint/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyBadgeClass(urgency)}`}>
              {urgency}
            </span>
            
            {report.metadata?.workflowHistory && report.metadata.workflowHistory.length > 0 && (
              <span className="text-xs text-neutral">
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