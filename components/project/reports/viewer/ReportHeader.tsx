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
import { LastEditedBy } from '@/components/shared/LastEditedBy';

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
          <div className="p-3 bg-c4c-grey-bg rounded-lg">
            <ReportTypeIcon type={report.reportType} size={32} />
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-semibold text-black">
                {report.title}
              </h1>
              <ReportStatusBadge status={report.status} size="md" />
            </div>

            <div className="flex items-center space-x-4 text-sm text-c4c-petrol">
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

            <LastEditedBy
              name={report.lastUpdatedBy?.name}
              timestamp={report.updatedAt}
              className="mt-2"
            />

            {report.description && (
              <p className="text-black mt-3 max-w-2xl">
                {report.description}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Progress Bar
      <div className="bg-c4c-grey-bg rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-black">Completion Progress</span>
          <span className="text-sm text-c4c-petrol">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-3 shadow-inner">
          <div
            className="bg-gradient-to-r from-c4c-petrol to-c4c-sage h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        {report.metadata?.summary && (
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <div className="text-lg font-semibold text-black">
                {report.metadata.summary.totalItems || 0}
              </div>
              <div className="text-xs text-c4c-petrol">Total Items</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-black">
                {report.metadata.summary.completedItems || 0}
              </div>
              <div className="text-xs text-c4c-petrol">Completed</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-black">
                {((report.metadata.summary.totalItems || 0) - (report.metadata.summary.completedItems || 0))}
              </div>
              <div className="text-xs text-c4c-petrol">Remaining</div>
            </div>
          </div>
        )}
      </div> */}

      {/* Context Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Organization */}
        <div className="bg-c4c-grey-bg rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Building size={18} className="text-c4c-petrol" />
            <h3 className="font-medium text-black">Organization</h3>
          </div>
          <p className="text-c4c-petrol text-sm">{report.organization.name}</p>
          {report.organization.country && (
            <p className="text-xs text-c4c-petrol mt-1">{report.organization.country}</p>
          )}
        </div>

        {/* Project */}
        <div className="bg-c4c-grey-bg rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin size={18} className="text-c4c-petrol" />
            <h3 className="font-medium text-black">Project</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-c4c-petrol text-sm">{report.project.name}</p>
              {project?.status && (
                <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                  project.status === 'active' ? 'bg-c4c-tint-sage text-black' :
                  project.status === 'completed' ? 'bg-c4c-tint-cyan text-black' :
                  'bg-c4c-grey-bg text-c4c-petrol'
                }`}>
                  {project.status}
                </span>
              )}
            </div>
            <button
              onClick={onGoToProject}
              className="text-c4c-petrol hover:text-black"
              title="Go to project"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* Site (if applicable) */}
        {report.projectSite && (
          <div className="bg-c4c-grey-bg rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin size={18} className="text-c4c-petrol" />
              <h3 className="font-medium text-black">Site</h3>
            </div>
            <p className="text-c4c-petrol text-sm">{report.projectSite.name}</p>
            {report.projectSite.location && (
              <p className="text-xs text-c4c-petrol mt-1">{report.projectSite.location}</p>
            )}
          </div>
        )}

        {/* Entity Type for non-site reports */}
        {!report.projectSite && (
          <div className="bg-c4c-grey-bg rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Tag size={18} className="text-c4c-sage" />
              <h3 className="font-medium text-black">Scope</h3>
            </div>
            <p className="text-c4c-petrol text-sm">
              {report.entityType === 'project' ? 'Project-wide' : 'Site-specific'}
            </p>
            <p className="text-xs text-c4c-petrol mt-1">
              {report.visibility === 'organization' ? 'Organization visible' :
               report.visibility === 'public' ? 'Publicly visible' : 'Private'}
            </p>
          </div>
        )}
      </div>

      {/* Approval Information */}
      {report.approvedBy && report.approvedAt && (
        <div className="bg-c4c-tint-sage border border-c4c-sage rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-c4c-sage rounded-full"></div>
            <span className="text-sm font-medium text-black">
              Approved by {report.approvedBy.name} on {formatReportDate(report.approvedAt)}
            </span>
          </div>
        </div>
      )}

      {/* Warning for expired/outdated reports */}
      {urgency === 'critical' && (
        <div className="bg-c4c-tint-coral border border-c4c-pink rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-c4c-burgundy rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-c4c-burgundy">
              This report may be outdated and should be regenerated
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportHeader;