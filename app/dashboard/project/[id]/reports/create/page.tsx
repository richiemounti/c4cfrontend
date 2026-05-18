// app/dashboard/project/[id]/reports/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, Sliders, Map, Filter, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from '@/components/DashboardSidebar';
import stakeholderReportApi from '@/lib/api/stakeholderReport';
import { getProject, getProjectSites } from '@/lib/api/project';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping'; // Fixed import
import { Project, ProjectSite, ReportFilters, GenerateReportRequest, StakeholderGroup } from '@/types'; // Added types import
import ProjectSidebar from '@/components/project/ProjectSidebar';

interface PageParams {
  id: string;
}

const CreateReportPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: projectId } = params;
  
  const [project, setProject] = useState<Project | any>(null);
  const [sites, setSites] = useState<ProjectSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [reportData, setReportData] = useState<{
    title: string;
    description: string;
    projectSiteId: string;
    filters: ReportFilters;
  }>({
    title: '',
    description: '',
    projectSiteId: '',
    filters: {
      categories: [],
      connectionStrength: {
        min: 1,
        max: 10,
      },
      includeArchived: false,
    }
  });
  
  const [stakeholderCategories, setStakeholderCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch project data
        const projectResponse = await getProject(projectId);
        setProject(projectResponse.data);
        
        // Fetch project sites
        try {
          const sitesResponse = await getProjectSites(projectId);
          setSites(sitesResponse.data || []);
        } catch (siteError) {
          console.error('Error fetching project sites:', siteError);
        }
        
        // Fetch stakeholder data to get categories
        try {
          // Using the correct API for stakeholder mapping
          const stakeholdersResponse = await stakeholderMappingApi.getStakeholderGroups(projectId);
          const stakeholders = stakeholdersResponse.data || [];
          
          // Get unique categories with explicit type assertion
            const uniqueCategories = Array.from(
                new Set(
                stakeholders
                    .map((s: any) => s.category)
                    .filter((category: string): category is string => 
                    typeof category === 'string' && category.length > 0
                    )
                )
            ) as string[]; // Explicit type assertion here
          
          // Set categories with explicit string[] typing
          setAvailableCategories(uniqueCategories);
          setStakeholderCategories(uniqueCategories);
          
          // Initialize selected categories - use a typed setter to avoid type errors
          setReportData(prev => {
            const newData = { ...prev };
            newData.filters = {
              ...prev.filters,
              categories: uniqueCategories
            };
            return newData;
          });
        } catch (stakeholderError) {
          console.error('Error fetching stakeholders:', stakeholderError);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project data',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, authLoading, isAuthenticated, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReportData({ ...reportData, [name]: value });
  };

  const handleCategoryChange = (category: string) => {
    setReportData(prev => {
      // Create a proper copy to ensure type safety
      const currentCategories = [...(prev.filters.categories || [])];
      
      // Update categories
      const updatedCategories = currentCategories.includes(category)
        ? currentCategories.filter(c => c !== category)
        : [...currentCategories, category];
      
      // Return fully typed object
      return {
        ...prev,
        filters: {
          ...prev.filters,
          categories: updatedCategories
        }
      };
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = parseInt(e.target.value, 10);
    setReportData(prev => {
      // Create a copy of the current state
      const newData = { ...prev };
      
      // Ensure connectionStrength exists before updating
      const connectionStrength = prev.filters.connectionStrength || { min: 1, max: 10 };
      
      // Update with proper typing
      newData.filters = {
        ...prev.filters,
        connectionStrength: {
          ...connectionStrength,
          [type]: value
        }
      };
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Report title is required',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare data for API - using proper type
      const data: GenerateReportRequest = {
        projectId,
        projectSiteId: reportData.projectSiteId || undefined,
        title: reportData.title,
        description: reportData.description || undefined,
        filters: {
          categories: reportData.filters.categories,
          connectionStrength: reportData.filters.connectionStrength,
          includeArchived: reportData.filters.includeArchived,
        }
      };
      
      // Call API to generate report
      const response = await stakeholderReportApi.generateReport(data);
      
      toast({
        title: 'Success',
        description: 'Report generated successfully',
      });
      
      // Redirect to report view
      router.push(`/dashboard/project/${projectId}/reports/${response.data._id}`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/project/${projectId}/reports`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {project && (
          <ProjectSidebar 
            projectId={project._id}
            projectName={project.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ProjectSidebar 
        projectId={project._id}
        projectName={project.name}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 shadow-sm">
          <button 
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Reports
          </button>
          <div className="flex justify-between items-center mt-4">
            <h1 className="text-2xl font-medium">Generate Stakeholder Report</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={submitting}
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                <Save size={16} className="mr-2" />
                {submitting ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <div className="p-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <Info size={18} className="mr-2 text-gray-400" />
                  Report Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Report Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={reportData.title}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter report title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="projectSiteId" className="block text-sm font-medium text-gray-700 mb-1">
                      Project Site (Optional)
                    </label>
                    <select
                      id="projectSiteId"
                      name="projectSiteId"
                      value={reportData.projectSiteId}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Sites</option>
                      {sites.map(site => (
                        <option key={site._id} value={site._id}>{site.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={reportData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter report description (optional)"
                  />
                </div>
              </div>
              
              <div className="mb-6 border-t border-gray-200 pt-6">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <Filter size={18} className="mr-2 text-gray-400" />
                  Report Filters
                </h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stakeholder Categories
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableCategories.map(category => (
                      <div key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          checked={reportData.filters.categories?.includes(category) || false}
                          onChange={() => handleCategoryChange(category)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`category-${category}`} className="ml-2 block text-sm text-gray-700">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connection Strength Range
                  </label>
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 w-12">Min: {reportData.filters.connectionStrength?.min || 1}</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={reportData.filters.connectionStrength?.min || 1}
                        onChange={(e) => handleSliderChange(e, 'min')}
                        className="mx-2 w-32"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 w-12">Max: {reportData.filters.connectionStrength?.max || 10}</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={reportData.filters.connectionStrength?.max || 10}
                        onChange={(e) => handleSliderChange(e, 'max')}
                        className="mx-2 w-32"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeArchived"
                      checked={reportData.filters.includeArchived || false}
                      onChange={(e) => {
                        setReportData(prev => {
                          // Create a copy with proper typing
                          return {
                            ...prev,
                            filters: {
                              ...prev.filters,
                              includeArchived: e.target.checked
                            }
                          };
                        });
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="includeArchived" className="ml-2 block text-sm text-gray-700">
                      Include archived stakeholders
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReportPage;