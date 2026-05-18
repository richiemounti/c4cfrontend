// components/reports/ReportsList.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Eye, Download, MoreHorizontal, Calendar, User, 
  FileText, Trash2, Edit, Share2, Clock, AlertTriangle 
} from 'lucide-react';
import { BaseReportData } from '@/types/reports';
import { useToast } from '@/hooks/use-toast';
import ReportCard from './ReportCard';
import ReportStatusBadge from './ReportStatusBadge';
import ReportTypeIcon from './ReportTypeIcon';
import ReportActions from './ReportActions';
import { 
  getReportTypeLabel, 
  formatReportDate, 
  getRelativeTime,
  calculateReportUrgency,
  getUrgencyBadgeClass 
} from '@/lib/utils/reports';

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
            <div key={i} className="h-16 bg-sky-tint rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">
          <AlertTriangle size={48} className="mx-auto mb-2" />
          <h3 className="text-lg font-medium">Error Loading Reports</h3>
          <p className="text-sm text-sky">{error}</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-sky text-white rounded-md hover:bg-stratosphere"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="p-12 text-center">
        <FileText size={64} className="mx-auto text-sky mb-4" />
        <h3 className="text-xl font-medium text-stratosphere mb-2">No Reports Found</h3>
        <p className="text-sky mb-6">
          No reports have been generated for this project yet. Create your first report to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* View Mode Toggle & Bulk Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-sky-tint rounded-md p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white text-stratosphere shadow-sm' 
                  : 'text-sky hover:text-stratosphere'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-stratosphere shadow-sm' 
                  : 'text-sky hover:text-stratosphere'
              }`}
            >
              Grid
            </button>
          </div>

          {/* Results Count */}
          <p className="text-sm text-sky">
            Showing {reports.length} of {pagination.totalCount} reports
          </p>
        </div>

        {/* Bulk Actions */}
        {selectedReports.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-sky">
              {selectedReports.length} selected
            </span>
            <button className="px-3 py-1 text-sm bg-sky-tint text-stratosphere rounded hover:bg-sky hover:text-white">
              Export Selected
            </button>
            <button className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200">
              Archive Selected
            </button>
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
        <div className="overflow-hidden mb-6 border border-sky rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-sky">
              <thead className="bg-sky-tint">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedReports.length === reports.length}
                      onChange={handleSelectAll}
                      className="rounded border-sky text-sky focus:ring-sky"
                    />
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-stratosphere uppercase tracking-wider min-w-[200px]">
                    Report
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-stratosphere uppercase tracking-wider w-24">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-stratosphere uppercase tracking-wider w-32">
                    Created
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-stratosphere uppercase tracking-wider w-24">
                    Progress
                  </th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-stratosphere uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-sky">
                {reports.map((report) => {
                  const urgency = calculateReportUrgency(report);
                  return (
                    <tr 
                      key={report.id}
                      className="hover:bg-sky-tint cursor-pointer"
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
                          className="rounded border-sky text-sky focus:ring-sky"
                        />
                      </td>
                      <td className="px-4 py-4 min-w-[200px]">
                        <div className="flex items-center">
                          <ReportTypeIcon type={report.reportType} size={16} />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-stratosphere line-clamp-1">
                              {report.title}
                            </div>
                            <div className="text-xs text-sky">
                              {getReportTypeLabel(report.reportType)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 w-24">
                        <ReportStatusBadge status={report.status} />
                      </td>
                      <td className="px-3 py-4 w-32">
                        <div className="text-sm text-stratosphere">
                          {new Date(report.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="text-xs text-sky">
                          {getRelativeTime(report.createdAt)}
                        </div>
                      </td>
                      <td className="px-3 py-4 w-24">
                        <div className="w-full bg-sky-tint rounded-full h-2">
                          <div 
                            className="bg-sky h-2 rounded-full" 
                            style={{ 
                              width: `${report.metadata?.summary?.completionPercentage || 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-sky mt-1">
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
          <div className="text-sm text-sky">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-1 border border-sky rounded text-sky hover:bg-sky-tint disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const pageNum = Math.max(1, pagination.currentPage - 2) + i;
              if (pageNum > pagination.totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded text-sm ${
                    pageNum === pagination.currentPage
                      ? 'bg-sky text-white'
                      : 'text-sky hover:bg-sky-tint'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-1 border border-sky rounded text-sky hover:bg-sky-tint disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsList;