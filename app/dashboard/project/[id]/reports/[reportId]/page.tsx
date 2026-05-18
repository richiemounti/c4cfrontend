// app/dashboard/reports/[reportId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Edit, RefreshCw, Settings, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { getReportById, getCachedReport } from '@/lib/api/reports';
import { getProject } from '@/lib/api/project';
import { Project } from '@/types';
import ReportHeader from '@/components/project/reports/viewer/ReportHeader';
import ReportContent from '@/components/project/reports/viewer/ReportContent';
import ReportMetadata from '@/components/project/reports/viewer/ReportMetadata';
import ReportWorkflowControls from '@/components/project/reports/viewer/ReportWorkflowControls';
import ReportVersionHistory from '@/components/project/reports/viewer/ReportVersionHistory';
import ReportComments from '@/components/project/reports/viewer/ReportComments';
import ReportExportModal from '@/components/project/reports/viewer/ReportExportModal';
import ReportQuickActions from '@/components/project/reports/viewer/ReportQuickActions';
import { canUserEditReport } from '@/lib/utils/reports';
import { BaseReportData } from '@/types/reports';

interface PageParams {
  reportId: string;
}

interface ReportDetailState {
  report: BaseReportData | null;
  project: Project | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  showVersionHistory: boolean;
  showComments: boolean;
  showExportModal: boolean;
}

const ReportDetailPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { reportId } = params;
  
  const [state, setState] = useState<ReportDetailState>({
    report: null,
    project: null,
    loading: true,
    error: null,
    refreshing: false,
    showVersionHistory: false,
    showComments: false,
    showExportModal: false,
  });

  const [showControls, setShowControls] = useState(true);

  // Fetch report data
  const fetchReport = async (useCache: boolean = true) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = useCache 
        ? await getCachedReport(reportId)
        : await getReportById(reportId);

      if (response && response.success && response.data) {
        setState(prev => ({ ...prev, report: response.data }));
        
        const projectId = response.data.project?.id || response.data.project?._id;
        
        if (projectId) {
          await fetchProject(projectId);
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } else {
        throw new Error('Failed to load report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load report. You may not have permission to view it.',
        loading: false
      }));
    }
  };

  // Fetch project data for sidebar
  const fetchProject = async (projectId: string) => {
    try {
      const response = await getProject(projectId);
      setState(prev => ({ 
        ...prev, 
        project: response.data, 
        loading: false 
      }));
    } catch (error) {
      console.error('Error fetching project:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }

    fetchReport();
  }, [reportId, isAuthenticated, router]);

  const handleRefresh = async () => {
    setState(prev => ({ ...prev, refreshing: true }));
    await fetchReport(false);
    setState(prev => ({ ...prev, refreshing: false }));
    toast({
      title: 'Success',
      description: 'Report refreshed successfully',
    });
  };

  const handleGoBack = () => {
    if (state.project) {
      router.push(`/dashboard/project/${state.project._id}/reports`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoToProject = () => {
    if (state.project) {
      router.push(`/dashboard/project/${state.project._id}`);
    }
  };

  const handleEditReport = () => {
    router.push(`/dashboard/reports/${reportId}/edit`);
  };

  const handleWorkflowUpdate = async () => {
    await fetchReport(false);
    toast({
      title: 'Success',
      description: 'Report status updated successfully',
    });
  };

  const handleExportPreview = () => {
    setState(prev => ({ ...prev, showExportModal: true }));
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    try {
      toast({
        title: 'Export Started',
        description: `Report export in ${format.toUpperCase()} format has been queued.`,
      });
      
      // Call export API here
      
      setTimeout(() => {
        toast({
          title: 'Export Complete',
          description: `Your ${format.toUpperCase()} file is ready for download.`,
        });
      }, 2000);
      
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCloseExportModal = () => {
    setState(prev => ({ ...prev, showExportModal: false }));
  };

  if (state.loading) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        {state.project && (
          <ProjectSidebar 
            projectId={state.project._id}
            projectName={state.project.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
          <p className="text-stratosphere font-medium ml-4">Loading report...</p>
        </div>
      </div>
    );
  }

  if (state.error || !state.report) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        {state.project && (
          <ProjectSidebar 
            projectId={state.project._id}
            projectName={state.project.name}
          />
        )}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-medium text-stratosphere mb-2">Report Not Found</h2>
            <p className="text-sky mb-4">
              {state.error || "The report you're looking for doesn't exist or you don't have permission to view it."}
            </p>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-sky text-white rounded-md hover:bg-stratosphere"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = canUserEditReport(state.report, user);

  return (
    <div className="flex min-h-screen bg-sky-tint">
      {/* Project Sidebar */}
      {state.project && (
        <ProjectSidebar 
          projectId={state.project._id}
          projectName={state.project.name}
        />
      )}

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-sky">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={handleGoBack}
              className="flex items-center text-sky-500 hover:text-stratosphere"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Reports
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={state.refreshing}
                className="flex items-center px-3 py-2 text-sky border border-sky rounded-md hover:bg-sky-tint disabled:opacity-50"
              >
                <RefreshCw size={16} className={`mr-2 ${state.refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>



              <button
                onClick={handleExportPreview}
                className="flex items-center px-4 py-2 bg-ochre text-white rounded-md hover:bg-ochre-900"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Report Header */}
          <ReportHeader 
            report={state.report}
            project={state.project}
            onGoToProject={handleGoToProject}
            onExport={handleExportPreview}
          />
        </div>

        {/* Controls Section - Collapsible */}
        <div className="p-8">
          <div className="space-y-8">
            <button
              onClick={() => setShowControls(!showControls)}
              className={`w-full px-6 py-4 flex items-center justify-between transition-all duration-200 rounded-lg ${
                showControls 
                  ? 'bg-sky text-white' 
                  : 'bg-sky-tint/50 hover:bg-sky-tint text-stratosphere'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  showControls ? 'bg-white/20' : 'bg-white'
                }`}>
                  <Settings className={showControls ? 'text-white' : 'text-sky'} size={20} />
                </div>
                <h3 className="text-lg font-medium">Report Controls & Details</h3>
              </div>
              <div className="flex items-center space-x-2">
                {showControls ? (
                  <>
                    <EyeOff size={16} />
                    <ChevronDown size={20} />
                  </>
                ) : (
                  <>
                    <Eye size={16} />
                    <ChevronRight size={20} />
                  </>
                )}
              </div>
            </button>
            
            {showControls && (
              <div className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Workflow Controls */}
                  <div className="bg-white rounded-lg border border-sky">
                    <ReportWorkflowControls
                      report={state.report}
                      onUpdate={handleWorkflowUpdate}
                      user={user}
                    />
                  </div>

                  {/* Metadata */}
                  <div className="bg-white rounded-lg border border-sky">
                    <ReportMetadata 
                      report={state.report}
                      onShowVersionHistory={() => setState(prev => ({ ...prev, showVersionHistory: true }))}
                      onShowComments={() => setState(prev => ({ ...prev, showComments: true }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Report Content - Full Width */}
        <div className="p-8">
          <div className="space-y-8">
            {/* Report Content */}
            <div className="bg-white rounded-lg border border-sky" id="report-content-export">
              <ReportContent 
                report={state.report}
                onUpdate={handleWorkflowUpdate}
                onExport={handleExportPreview}
              />
            </div>

            {/* Version History */}
            {state.showVersionHistory && (
              <div className="bg-white rounded-lg border border-sky">
                <ReportVersionHistory 
                  reportId={reportId}
                  onClose={() => setState(prev => ({ ...prev, showVersionHistory: false }))}
                />
              </div>
            )}

            {/* Comments */}
            {state.showComments && (
              <div className="bg-white rounded-lg border border-sky">
                <ReportComments 
                  reportId={reportId}
                  onClose={() => setState(prev => ({ ...prev, showComments: false }))}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Preview Modal */}
      <ReportExportModal
        report={state.report}
        isOpen={state.showExportModal}
        onClose={handleCloseExportModal}
        onExport={handleExport}
      />
    </div>
  );
};

export default ReportDetailPage;