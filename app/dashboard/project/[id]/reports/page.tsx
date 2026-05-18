// app/dashboard/project/[id]/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { getProject } from '@/lib/api/project';
import { getProjectReports, getReportAnalytics } from '@/lib/api/reports';
import { Project } from '@/types';

import ReportsList from '@/components/project/reports/ReportsList';
import ReportsFilters from '@/components/project/reports/ReportsFilters';
import ReportsMetrics from '@/components/project/reports/ReportsMetrics';
import ReportGenerationModal from '@/components/project/reports/ReportGenerationModal';
import { BaseReportData, SearchFilters } from '@/types/reports';

interface PageParams {
  id: string;
}

interface ReportsPageState {
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
  filters: Partial<SearchFilters>;
  searchTerm: string;
  analytics: any;
}

const ProjectReportsPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: projectId } = params;
  
  const [project, setProject] = useState<Project | null>(null);
  const [state, setState] = useState<ReportsPageState>({
    reports: [],
    loading: true,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNext: false,
      hasPrev: false
    },
    filters: {},
    searchTerm: '',
    analytics: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch project data
  const fetchProject = async () => {
    try {
      const response = await getProject(projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project data',
        variant: 'destructive',
      });
    }
  };

  // Fetch reports data
  const fetchReports = async (page: number = 1, filters: Partial<SearchFilters> = {}) => {
  try {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    // Transform array filters to single values or comma-separated strings
    const transformedFilters: any = {};
    
    // Handle array filters - convert to comma-separated strings or first value
    if (filters.reportType && filters.reportType.length > 0) {
      transformedFilters.reportType = filters.reportType.join(',');
    }
    if (filters.status && filters.status.length > 0) {
      transformedFilters.status = filters.status.join(',');
    }
    if (filters.visibility && filters.visibility.length > 0) {
      transformedFilters.visibility = filters.visibility.join(',');
    }
    
    // Handle other filters directly
    if (filters.searchTerm) transformedFilters.searchTerm = filters.searchTerm;
    if (filters.createdAfter) transformedFilters.createdAfter = filters.createdAfter;
    if (filters.createdBefore) transformedFilters.createdBefore = filters.createdBefore;
    if (filters.minCompletionPercentage) transformedFilters.minCompletionPercentage = filters.minCompletionPercentage;
    if (filters.maxCompletionPercentage) transformedFilters.maxCompletionPercentage = filters.maxCompletionPercentage;
    
    const params = {
      page,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
      ...transformedFilters
    };

    const response = await getProjectReports(projectId, params);
      
      setState(prev => ({
        ...prev,
        reports: response.data.reports,
        pagination: response.data.pagination,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load reports'
      }));
      toast({
        title: 'Error',
        description: 'Failed to load reports',
        variant: 'destructive',
      });
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await getReportAnalytics({ projectId });
      console.log('Analytics response:', response);
      setState(prev => ({ ...prev, analytics: response.data, loading: false }));
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Don't show error toast for analytics as it's supplementary data
    }
  };

  // Initialize data
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }

    fetchProject();
    fetchReports();
    fetchAnalytics();
  }, [projectId, authLoading, isAuthenticated, router]);

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setState(prev => ({ ...prev, searchTerm }));
    const newFilters = { ...state.filters, searchTerm: searchTerm || undefined };
    fetchReports(1, newFilters);
  };

  // Handle filters change
  const handleFiltersChange = (filters: Partial<SearchFilters>) => {
    setState(prev => ({ ...prev, filters, pagination: { ...prev.pagination, currentPage: 1 } }));
    fetchReports(1, filters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, pagination: { ...prev.pagination, currentPage: page } }));
    fetchReports(page, state.filters);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchReports(state.pagination.currentPage, state.filters),
      fetchAnalytics()
    ]);
    setRefreshing(false);
    toast({
      title: 'Success',
      description: 'Reports refreshed successfully',
    });
  };

  // Handle report creation success
  const handleReportCreated = () => {
    setShowGenerationModal(false);
    fetchReports(state.pagination.currentPage, state.filters);
    fetchAnalytics();
    toast({
      title: 'Success',
      description: 'Report generation started successfully',
    });
  };

  // Handle back navigation
  const handleGoBack = () => {
    router.push(`/dashboard/project/${projectId}`);
  };

  if (!project && state.loading) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
          <p className="text-stratosphere font-medium ml-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-medium text-stratosphere mb-2">Project Not Found</h2>
            <p className="text-sky mb-4">The project you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-sky text-white rounded-md hover:bg-stratosphere"
            >
              Back to Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sky-tint">
      {/* Project Sidebar */}
      <ProjectSidebar 
        projectId={project._id}
        projectName={project.name}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-sky">
          <button 
            onClick={handleGoBack}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Project
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-medium text-stratosphere">Project Reports</h1>
              <p className="text-sky mt-1">
                Generate and manage reports for {project.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 text-sky border border-sky rounded-md hover:bg-sky-tint disabled:opacity-50"
              >
                <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={() => setShowGenerationModal(true)}
                className="flex items-center px-4 py-2 bg-ochre text-white rounded-md hover:bg-ochre-900"
              >
                <Plus size={16} className="mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Analytics Metrics */}
          {state.analytics && (
            <ReportsMetrics 
              analytics={state.analytics}
              loading={state.loading}
            />
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-sky p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={state.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  showFilters 
                    ? 'bg-sky text-white' 
                    : 'border border-sky text-sky hover:bg-sky-tint'
                }`}
              >
                <Filter size={16} className="mr-2" />
                Filters
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-sky-tint">
                <ReportsFilters
                  filters={state.filters}
                  onFiltersChange={handleFiltersChange}
                  projectId={projectId}
                />
              </div>
            )}
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-lg border border-sky">
            <ReportsList
              reports={state.reports}
              loading={state.loading}
              error={state.error}
              pagination={state.pagination}
              onPageChange={handlePageChange}
              onRefresh={handleRefresh}
              projectId={projectId}
            />
          </div>
        </div>
      </div>

      {/* Report Generation Modal */}
      {showGenerationModal && (
        <ReportGenerationModal
          projectId={projectId}
          projectName={project.name}
          onClose={() => setShowGenerationModal(false)}
          onSuccess={handleReportCreated}
        />
      )}
    </div>
  );
};

export default ProjectReportsPage;