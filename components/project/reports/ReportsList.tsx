// components/reports/ReportsList.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, AlertTriangle
} from 'lucide-react';
import { BaseReportData } from '@/types/reports';
import { useToast } from '@/hooks/use-toast';
import ReportCard from './ReportCard';
import ReportStatusBadge from './ReportStatusBadge';
import ReportTypeIcon from './ReportTypeIcon';
import ReportActions from './ReportActions';
import {
  getReportTypeLabel,
  getRelativeTime,
  calculateReportUrgency,
} from '@/lib/utils/reports';
import { Button } from '@/components/ui/button';
import { SegmentedToggle, SegmentedButton } from '@/components/shared/Toolbar';
import { EmptyState } from '@/components/shared/EmptyState';

interface ReportsListProps {
  reports: BaseReportData[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  projectId: string;
}

type ViewMode = 'table' | 'grid';

const ReportsList: React.FC<ReportsListProps> = ({
  reports,
  loading,
  error,
  pagination,
  onPageChange,
  onRefresh,
  projectId
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showGenerationModal, setShowGenerationModal] = useState(false);

  const handleViewReport = (reportId: string) => {
    router.push(`/dashboard/project/${projectId}/reports/${reportId}`);
  };

  const handleEditReport = (reportId: string) => {
    router.push(`/dashboard/project/${projectId}/reports/${reportId}/edit`);
  };

  const handleExportReport = async (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    try {
      // Implementation would call export API
      toast({
        title: 'Export Started',
        description: `Report export in ${format.toUpperCase()} format has been queued.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('Are you sure you want to archive this report?')) {
      try {
        // Implementation would call delete API
        toast({
          title: 'Success',
          description: 'Report archived successfully',
        });
        onRefresh();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to archive report',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    setSelectedReports(
      selectedReports.length === reports.length 
        ? [] 
        : reports.map(report => report.id)
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-c4c-grey-bg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertTriangle />}
        title="Error Loading Reports"
        description={error}
        actions={<Button variant="anchor" onClick={onRefresh}>Try Again</Button>}
      />
    );
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={<FileText />}
        title="No Reports Found"
        description="No reports have been generated for this project yet. Create your first report to get started."
      />
    );
  }

  return (
    <div className="p-6">
      {/* View Mode Toggle & Bulk Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <SegmentedToggle>
            <SegmentedButton active={viewMode === 'table'} onClick={() => setViewMode('table')}>Table</SegmentedButton>
            <SegmentedButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>Grid</SegmentedButton>
          </SegmentedToggle>

          {/* Results Count */}
          <p className="text-sm text-c4c-petrol">
            Showing {reports.length} of {pagination.totalCount} reports
          </p>
        </div>

        {/* Bulk Actions */}
        {selectedReports.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-c4c-petrol">
              {selectedReports.length} selected
            </span>
            <Button variant="quiet" size="sm">Export Selected</Button>
            <Button variant="destructive" size="sm">Archive Selected</Button>
          </div>
        )}
      </div>

      {/* Reports Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onView={() => handleViewReport(report.id)}
              onEdit={() => handleEditReport(report.id)}
              onExport={(format:any) => handleExportReport(report.id, format)}
              onDelete={() => handleDeleteReport(report.id)}
              selected={selectedReports.includes(report.id)}
              onSelect={() => handleSelectReport(report.id)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden mb-6 border border-c4c-rule">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-c4c-rule">
              <thead className="bg-c4c-grey-bg">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedReports.length === reports.length}
                      onChange={handleSelectAll}
                      className="accent-c4c-petrol"
                    />
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-title text-[10.5px] font-semibold text-c4c-petrol uppercase tracking-[0.1em] min-w-[200px]">
                    Report
                  </th>
                  <th scope="col" className="px-3 py-3 text-left font-title text-[10.5px] font-semibold text-c4c-petrol uppercase tracking-[0.1em] w-24">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3 text-left font-title text-[10.5px] font-semibold text-c4c-petrol uppercase tracking-[0.1em] w-32">
                    Created
                  </th>
                  <th scope="col" className="px-3 py-3 text-left font-title text-[10.5px] font-semibold text-c4c-petrol uppercase tracking-[0.1em] w-24">
                    Progress
                  </th>
                  <th scope="col" className="px-3 py-3 text-right font-title text-[10.5px] font-semibold text-c4c-petrol uppercase tracking-[0.1em] w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-c4c-rule">
                {reports.map((report) => {
                  const urgency = calculateReportUrgency(report);
                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-c4c-grey-bg cursor-pointer"
                      onClick={() => handleViewReport(report.id)}
                    >
                      <td className="px-3 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedReports.includes(report.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectReport(report.id);
                          }}
                          className="accent-c4c-petrol"
                        />
                      </td>
                      <td className="px-4 py-4 min-w-[200px]">
                        <div className="flex items-center">
                          <ReportTypeIcon type={report.reportType} size={16} />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-black line-clamp-1">
                              {report.title}
                            </div>
                            <div className="text-xs text-c4c-petrol">
                              {getReportTypeLabel(report.reportType)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 w-24">
                        <ReportStatusBadge status={report.status} />
                      </td>
                      <td className="px-3 py-4 w-32">
                        <div className="text-sm text-black">
                          {new Date(report.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-c4c-petrol">
                          {getRelativeTime(report.createdAt)}
                        </div>
                      </td>
                      <td className="px-3 py-4 w-24">
                        <div className="w-full bg-c4c-grey-bg h-1">
                          <div
                            className="bg-c4c-sage h-1"
                            style={{
                              width: `${report.metadata?.summary?.completionPercentage || 0}%`
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-c4c-petrol mt-1">
                          {report.metadata?.summary?.completionPercentage || 0}%
                        </div>
                      </td>
                      <td className="px-3 py-4 w-20 text-right">
                        <ReportActions
                          report={report}
                          onView={() => handleViewReport(report.id)}
                          onEdit={() => handleEditReport(report.id)}
                          onExport={(format: any) => handleExportReport(report.id, format)}
                          onDelete={() => handleDeleteReport(report.id)}
                          compact={true}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-c4c-petrol">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="quiet" size="sm" onClick={() => onPageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrev}>
              Previous
            </Button>

            {/* Page Numbers */}
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const pageNum = Math.max(1, pagination.currentPage - 2) + i;
              if (pageNum > pagination.totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 text-sm ${
                    pageNum === pagination.currentPage
                      ? 'bg-c4c-petrol text-white'
                      : 'text-c4c-petrol hover:bg-c4c-grey-bg'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <Button variant="quiet" size="sm" onClick={() => onPageChange(pagination.currentPage + 1)} disabled={!pagination.hasNext}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsList;