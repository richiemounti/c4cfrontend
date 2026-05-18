// components/reports/viewer/ReportHeader.tsx
'use client';

import { Calendar, User, Building, MapPin, ExternalLink, Tag } from 'lucide-react';
import { Project } from '@/types';
import ReportStatusBadge from '../ReportStatusBadge';
import ReportTypeIcon from '../ReportTypeIcon';
import { 
  getReportTypeLabel, 
  formatReportDate, 
  getRelativeTime,
  calculateReportUrgency,
  getUrgencyBadgeClass,
  calculateCompletionPercentage
} from '@/lib/utils/reports';
import { BaseReportData } from '@/types/reports';

interface ReportHeaderProps {
  report: BaseReportData;
  project: Project | null;
  onGoToProject: () => void;
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  report,
  project,
  onGoToProject,
  onExport
}) => {
  const urgency = calculateReportUrgency(report);
  const completionPercentage = calculateCompletionPercentage(report);

  return (
    <div className="space-y-6">
      {/* Title and Basic Info */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-sky-tint rounded-lg">
            <ReportTypeIcon type={report.reportType} size={32} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-semibold text-stratosphere">
                {report.title}
              </h1>
              <ReportStatusBadge status={report.status} size="md" />
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-sky">
              <span className="flex items-center">
                <Tag size={14} className="mr-1" />
                {getReportTypeLabel(report.reportType)}
              </span>
              <span className="flex items-center">
                <Calendar size={14} className="mr-1" />
                Created {getRelativeTime(report.createdAt)}
              </span>
              <span className="flex items-center">
                <User size={14} className="mr-1" />
                {report.creator.name}
              </span>
            </div>

            {report.description && (
              <p className="text-stratosphere mt-3 max-w-2xl">
                {report.description}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Progress Bar
      <div className="bg-sky-tint rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-stratosphere">Completion Progress</span>
          <span className="text-sm text-sky">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-sky to-grass h-3 rounded-full transition-all duration-500" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        
        {report.metadata?.summary && (
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
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
                {((report.metadata.summary.totalItems || 0) - (report.metadata.summary.completedItems || 0))}
              </div>
              <div className="text-xs text-sky">Remaining</div>
            </div>
          </div>
        )}
      </div> */}

      {/* Context Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Organization */}
        <div className="bg-sky-tint rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Building size={18} className="text-sky" />
            <h3 className="font-medium text-stratosphere">Organization</h3>
          </div>
          <p className="text-sky text-sm">{report.organization.name}</p>
          {report.organization.country && (
            <p className="text-xs text-sky mt-1">{report.organization.country}</p>
          )}
        </div>

        {/* Project */}
        <div className="bg-sky-tint rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin size={18} className="text-sky" />
            <h3 className="font-medium text-stratosphere">Project</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sky text-sm">{report.project.name}</p>
              {project?.status && (
                <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              )}
            </div>
            <button
              onClick={onGoToProject}
              className="text-sky hover:text-stratosphere"
              title="Go to project"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* Site (if applicable) */}
        {report.projectSite && (
          <div className="bg-sky-tint rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin size={18} className="text-ochre" />
              <h3 className="font-medium text-stratosphere">Site</h3>
            </div>
            <p className="text-sky text-sm">{report.projectSite.name}</p>
            {report.projectSite.region && (
              <p className="text-xs text-sky mt-1">{report.projectSite.region}</p>
            )}
          </div>
        )}

        {/* Entity Type for non-site reports */}
        {!report.projectSite && (
          <div className="bg-sky-tint rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Tag size={18} className="text-grass" />
              <h3 className="font-medium text-stratosphere">Scope</h3>
            </div>
            <p className="text-sky text-sm">
              {report.entityType === 'project' ? 'Project-wide' : 'Site-specific'}
            </p>
            <p className="text-xs text-sky mt-1">
              {report.visibility === 'organization' ? 'Organization visible' : 
               report.visibility === 'public' ? 'Publicly visible' : 'Private'}
            </p>
          </div>
        )}
      </div>

      {/* Approval Information */}
      {report.approvedBy && report.approvedAt && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">
              Approved by {report.approvedBy.name} on {formatReportDate(report.approvedAt)}
            </span>
          </div>
        </div>
      )}

      {/* Warning for expired/outdated reports */}
      {urgency === 'critical' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-800">
              This report may be outdated and should be regenerated
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportHeader;