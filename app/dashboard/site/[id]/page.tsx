// app/dashboard/site/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Calendar, Clock, Edit, Map, Users, AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { getProjectSite, getProject } from '@/lib/api/project';
import { ProjectSite, Project, SetupResponse } from '@/types';
import { Button } from '@/components/ui/button';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import ProjectSetupSummary from '@/components/project/ProjectSetupSummary';
import InstructionalPanel from '@/components/InstructionalPanel';
import { getProjectSiteSetup } from '@/lib/api/projectSiteSetup';

interface PageParams {
  id: string;
}

const SiteDetailsPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: siteId } = params;
  
  const [site, setSite] = useState<ProjectSite | any>(null);
  const [project, setProject] = useState<Project | any>(null);
  const [loading, setLoading] = useState(true);
  const [siteSetupData, setSiteSetupData] = useState<SetupResponse | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const siteResponse = await getProjectSite(siteId);
      setSite(siteResponse.data);

      if (siteResponse.data.project) {
        const projectId = typeof siteResponse.data.project === 'object' 
          ? siteResponse.data.project._id 
          : siteResponse.data.project;
          
        const projectResponse = await getProject(projectId);
        setProject(projectResponse.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load site data',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const fetchSiteSetupData = async () => {
    try {
      const response = await getProjectSiteSetup(siteId);
      setSiteSetupData(response);
    } catch (error) {
      console.error('Error fetching site setup data:', error);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }
    fetchData();
    fetchSiteSetupData();
  }, [siteId, authLoading, isAuthenticated, router]);

  const handleGoBackToProject = () => {
    if (project && project._id) {
      router.push(`/dashboard/project/${project._id}`);
    } else {
      router.push('/dashboard');
    }
  };

  const getSiteTaskValue = (fieldName: string) => {
    if (!siteSetupData?.tasks) return null;
    const task = siteSetupData.tasks.find(t => t.fieldName === fieldName);
    return task?.responseData || null;
  };

  const formatSiteTaskValue = (value: any): string => {
    if (!value) return 'Not specified';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const formatCoordinates = (coords: any): string => {
    if (!coords || typeof coords !== 'object') return 'Not specified';
    if (coords.lat && coords.lng) {
      return `${coords.lat}, ${coords.lng}`;
    }
    return 'Not specified';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        {project && (
          <ProjectSidebar 
            projectId={project._id}
            projectName={project.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        <ProjectSidebar 
          projectId={project?._id}
          projectName={project?.name || 'Project'}
        />
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Site Not Found</h2>
            <p className="text-gray-500 mb-4">The site you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sky-tint">
      <ProjectSidebar 
        projectId={project._id}
        projectName={project.name}
      />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-sky">
          <button 
            onClick={handleGoBackToProject}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Project
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-medium text-stratosphere">{site.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  site.status === 'active' ? 'bg-green-100 text-green-800' :
                  site.status === 'inactive' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {site.status || 'Status not set'}
                </span>
                {project && (
                  <span className="text-gray-500 text-sm">
                    Project: {project.name}
                  </span>
                )}
              </div>
            </div>
            
            {/* Edit Site Button */}
            <button
              onClick={() => router.push(`/dashboard/site/${site._id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
            >
              <Edit size={16} />
              Edit Site
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="p-8 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-2xl font-medium text-stratosphere mb-4">
              Site Dashboard
            </h2>
            <p className="text-stratosphere/80 text-lg mb-6">
              This is your site-level hub for managing all activities specific to this location. 
              Configure site details, map local stakeholders, and track site-specific data collection.
            </p>
            
            {/* Site Description */}
            {site.description && (
              <div className="bg-sky-tint p-6 rounded-lg mb-6">
                <h3 className="text-sm font-medium text-stratosphere mb-2">Site Description</h3>
                <p className="text-stratosphere whitespace-pre-wrap">
                  {site.description}
                </p>
              </div>
            )}

            {/* Site Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <MapPin className="text-sky mt-1 mr-3" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="text-stratosphere font-medium">
                    {site.city && site.country 
                      ? `${site.city}, ${site.country}`
                      : site.region || 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="text-sky mt-1 mr-3" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type & Size</h3>
                  <p className="text-stratosphere font-medium">
                    {site.siteType || 'Not specified'}
                    {site.size && site.sizeUnit && ` - ${site.size} ${site.sizeUnit}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="text-sky mt-1 mr-3" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="text-stratosphere font-medium">
                    {new Date(site.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Site Workflow */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-xl font-medium text-stratosphere mb-6">
              Site Workflow
            </h2>
            <p className="text-stratosphere/80 mb-8">
              Complete these essential steps to configure your site and prepare for data collection:
            </p>

            {/* Workflow Steps */}
            <div className="space-y-6">
              {/* Step 1: Setup */}
              <div className="border-l-4 border-sky pl-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky text-white text-sm font-bold">
                        1
                      </div>
                      <h3 className="text-lg font-medium text-stratosphere">Site Setup & Configuration</h3>
                    </div>
                    <p className="text-stratosphere/70 ml-11 mb-4">
                      Complete essential site tasks including location details, demographics, 
                      livelihoods, and vulnerability assessment. This ensures comprehensive 
                      site characterization and provides the foundation for all site-level activities.
                    </p>
                    
                    <div className="ml-11">
                      <ProjectSetupSummary 
                        projectId={project._id}
                        siteId={site._id}
                        contextType="site"
                        projectSites={[]}
                      />
                    </div>

                    {/* Helper text directing to Manage Tasks button */}
                    {(!siteSetupData || !siteSetupData.tasks || siteSetupData.tasks.length === 0) && (
                      <div className="ml-11 mt-4 bg-sky/10 border border-sky/30 rounded-lg p-3">
                        <p className="text-sm text-stratosphere flex items-center gap-2">
                          <ArrowRight className="text-sky animate-pulse" size={16} />
                          <span>
                            Click "Manage Tasks" to initialize and complete your site setup tasks.
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="ml-4"
                    onClick={() => router.push(`/dashboard/site/${site._id}/setup`)}
                  >
                    Manage Tasks
                  </Button>
                </div>
              </div>

              {/* Step 2: Stakeholder Mapping */}
              <div className="border-l-4 border-ochre pl-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ochre text-white text-sm font-bold">
                        2
                      </div>
                      <h3 className="text-lg font-medium text-stratosphere">Site Stakeholder Mapping</h3>
                    </div>
                    <p className="text-stratosphere/70 ml-11 mb-3">
                      Identify and analyze stakeholder groups specific to this site location. 
                      Focus on local communities, site-level authorities, and location-specific 
                      interest groups. These stakeholder groups will be used throughout other modules 
                      when site-specific data collection is needed.
                    </p>
                    <div className="ml-11 flex gap-2 text-sm text-stratosphere/60">
                      <span>• Map local stakeholders</span>
                      <span>• Analyze site-specific concerns</span>
                      <span>• Plan local engagement</span>
                    </div>
                  </div>
                  <Button 
                    className="ml-4 bg-ochre hover:bg-ochre/90 text-white"
                    onClick={() => router.push(`/dashboard/site/${site._id}/stakeholders`)}
                  >
                    <Map size={16} className="mr-2" />
                    Map Stakeholders
                  </Button>
                </div>
              </div>
            </div>

            {/* Additional Info Box */}
            <div className="mt-8 bg-sky-tint rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-sky flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-stratosphere mb-2">About Site-Level Data Collection</h4>
                  <p className="text-sm text-stratosphere/70">
                    Once you've mapped site stakeholders, these groups will be available in other project 
                    modules (Theory of Change, Surveys, etc.) when you need to collect site-specific data. 
                    The stakeholder groups you create here provide the foundation for targeted data collection 
                    at this location.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Site Details Summary */}
          {siteSetupData && (
            <div className="bg-white rounded-lg border border-sky p-8 mb-8">
              <h2 className="text-xl font-medium text-stratosphere mb-6">
                Site Details Summary
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location */}
                <div className="bg-sky-tint p-4 rounded-lg">
                  <h3 className="font-medium text-stratosphere mb-3">Location Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Region:</span>
                      <span className="text-stratosphere font-medium">{formatSiteTaskValue(getSiteTaskValue('admin_level_1'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">District:</span>
                      <span className="text-stratosphere font-medium">{formatSiteTaskValue(getSiteTaskValue('admin_level_2'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ward:</span>
                      <span className="text-stratosphere font-medium">{formatSiteTaskValue(getSiteTaskValue('admin_level_3'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">GPS:</span>
                      <span className="text-stratosphere font-medium text-xs">{formatCoordinates(getSiteTaskValue('gps_coordinates'))}</span>
                    </div>
                  </div>
                </div>

                {/* Ecology */}
                <div className="bg-sky-tint p-4 rounded-lg">
                  <h3 className="font-medium text-stratosphere mb-3">Ecology & Size</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Coverage:</span>
                      <span className="text-stratosphere font-medium">{formatSiteTaskValue(getSiteTaskValue('site_hectare_coverage'))} ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Zone:</span>
                      <span className="text-stratosphere font-medium">{formatSiteTaskValue(getSiteTaskValue('site_ecological_zone'))}</span>
                    </div>
                  </div>
                </div>

                {/* Demographics */}
                <div className="bg-sky-tint p-4 rounded-lg">
                  <h3 className="font-medium text-stratosphere mb-3">Demographics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Population:</span>
                      <span className="text-stratosphere font-medium">{formatSiteTaskValue(getSiteTaskValue('estimated_population'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vulnerable Groups:</span>
                      <span className="text-stratosphere font-medium">{getSiteTaskValue('vulnerable_groups_present') ? 'Present' : 'None identified'}</span>
                    </div>
                  </div>
                </div>

                {/* Livelihoods */}
                <div className="bg-sky-tint p-4 rounded-lg">
                  <h3 className="font-medium text-stratosphere mb-3">Livelihoods</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Primary Income:</span>
                      <span className="text-stratosphere font-medium">{formatSiteTaskValue(getSiteTaskValue('primary_income_sources'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wildlife Conflict:</span>
                      <span className="text-stratosphere font-medium">{getSiteTaskValue('wildlife_conflict_present') ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contacts */}
          {site.contacts && site.contacts.length > 0 && (
            <div className="bg-white rounded-lg border border-sky p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-stratosphere">Site Contacts</h2>
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/dashboard/site/${site._id}/edit`)}
                >
                  <Edit size={16} className="mr-2" />
                  Edit Contacts
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {site.contacts.map((contact: any, index: number) => (
                  <div key={contact._id || index} className="border border-sky rounded-lg p-4">
                    <h3 className="font-medium text-stratosphere mb-2">{contact.name}</h3>
                    <p className="text-sm text-stratosphere/70 mb-1">{contact.role || 'Role not specified'}</p>
                    {contact.phone && <p className="text-sm text-stratosphere/60">{contact.phone}</p>}
                    {contact.email && <p className="text-sm text-stratosphere/60">{contact.email}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help & Resources */}
          <InstructionalPanel
            title="Site Management Guide"
            subtitle="Resources for managing your project site"
            texts={[
              {
                content: "Complete site setup tasks first to establish baseline information about this location.",
                type: "tip"
              },
              {
                content: "Site-level stakeholder mapping focuses on local communities and location-specific groups.",
                type: "info"
              },
              {
                content: "Coordinate with field teams to ensure accurate data collection at this site.",
                type: "note"
              }
            ]}
            links={[
              {
                href: "/support/site-management",
                label: "Site Management Guide",
                description: "Best practices for managing project sites",
                external: false
              },
              {
                href: "/support",
                label: "Support Center",
                description: "Get help with any issues",
                external: false
              }
            ]}
            variant="default"
          />
        </div>
      </div>
    </div>
  );
};

export default SiteDetailsPage;