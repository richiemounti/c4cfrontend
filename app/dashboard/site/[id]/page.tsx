// app/dashboard/site/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Calendar, Clock, Edit, Map, Users, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { getProjectSite, getProject } from '@/lib/api/project';
import { ProjectSite, Project, SetupResponse } from '@/types';
import { Button } from '@/components/ui/button';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import HeaderHelpActions from '@/components/HeaderHelpActions';
import { getProjectSiteSetup, getProjectSiteSetupProgress } from '@/lib/api/projectSiteSetup';
import { canSubmitData } from '@/utils/permissions';
import { LastEditedBy } from '@/components/shared/LastEditedBy';

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
  const [setupProgress, setSetupProgress] = useState<number | null>(null);

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

    try {
      const progressResponse = await getProjectSiteSetupProgress(siteId);
      setSetupProgress(progressResponse?.progress ?? null);
    } catch (error) {
      console.error('Error fetching site setup progress:', error);
    }
  };

  const getSetupCtaLabel = () => {
    if (setupProgress === null || setupProgress === 0) return 'Start Site Setup';
    if (setupProgress >= 100) return 'Edit Site Setup';
    return 'Continue Site Setup';
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }
    fetchData();
    fetchSiteSetupData();
  }, [siteId, authLoading, isAuthenticated, router]);

  const organizationId = project?.organization
    ? (typeof project.organization === 'object' ? project.organization._id : project.organization)
    : undefined;
  const canEditSite = canSubmitData(user, organizationId);

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
      <div className="flex min-h-screen bg-c4c-grey-bg">
        {project && (
          <ProjectSidebar
            projectId={project._id}
            projectName={project.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c4c-coral"></div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        <ProjectSidebar
          projectId={project?._id}
          projectName={project?.name || 'Project'}
        />
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-medium text-black mb-2">Site Not Found</h2>
            <p className="text-c4c-petrol mb-4">The site you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-c4c-coral text-black rounded-md hover:bg-c4c-petrol hover:text-white"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-c4c-grey-bg">
      <ProjectSidebar
        projectId={project._id}
        projectName={project.name}
      />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-c4c-rule">
          <button
            onClick={handleGoBackToProject}
            className="flex items-center text-c4c-petrol hover:text-black mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Project
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-medium text-black">{site.name}</h1>
              {organizationId && <HeaderHelpActions organizationId={organizationId} />}
              <LastEditedBy
                name={typeof site.lastUpdatedBy === 'object' ? site.lastUpdatedBy?.name : undefined}
                timestamp={site.updatedAt}
                className="mt-1"
              />
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  site.status === 'active' ? 'bg-c4c-tint-sage text-black' :
                  site.status === 'planning' ? 'bg-c4c-tint-cyan text-black' :
                  site.status === 'completed' ? 'bg-c4c-grey-bg text-black' :
                  'bg-c4c-tint-gold text-black'
                }`}>
                  {site.status || 'Status not set'}
                </span>
                {project && (
                  <span className="text-c4c-petrol text-sm">
                    Project: {project.name}
                  </span>
                )}
              </div>
            </div>

            {/* Edit Site Button */}
            {canEditSite && (
              <button
                onClick={() => router.push(`/dashboard/site/${site._id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-c4c-petrol text-white rounded-md hover:bg-black transition-colors"
              >
                <Edit size={16} />
                Edit Site
              </button>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="p-8 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg border border-c4c-rule p-8 mb-8">
            <h2 className="text-2xl font-medium text-black mb-4">
              Site Dashboard
            </h2>
            <p className="text-black/80 text-lg mb-6">
              This is your site-level hub for managing all activities specific to this location.
              Configure site details, map local stakeholders, and track site-specific data collection.
            </p>

            {/* Site Description */}
            {site.description && (
              <div className="bg-c4c-grey-bg p-6 rounded-lg mb-6">
                <h3 className="text-sm font-medium text-black mb-2">Site Description</h3>
                <p className="text-black whitespace-pre-wrap">
                  {site.description}
                </p>
              </div>
            )}

            {/* Site Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <MapPin className="text-c4c-petrol mt-1 mr-3" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-c4c-petrol">Location</h3>
                  <p className="text-black font-medium">{site.location || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="text-c4c-petrol mt-1 mr-3" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-c4c-petrol">Timeline</h3>
                  <p className="text-black font-medium">
                    {site.startDate ? new Date(site.startDate).toLocaleDateString() : 'Not specified'} -{' '}
                    {site.endDate ? new Date(site.endDate).toLocaleDateString() : 'Ongoing'}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="text-c4c-petrol mt-1 mr-3" size={20} />
                <div>
                  <h3 className="text-sm font-medium text-c4c-petrol">Created</h3>
                  <p className="text-black font-medium">
                    {new Date(site.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Site Workflow */}
          <div className="bg-white rounded-lg border border-c4c-rule p-8 mb-8">
            <h2 className="text-xl font-medium text-black mb-6">
              Site Workflow
            </h2>
            <p className="text-black/80 mb-8">
              Complete these essential steps to configure your site and prepare for data collection:
            </p>

            {/* Workflow Steps */}
            <div className="space-y-6">
              {/* Step 1: Setup */}
              <div className="border-l-4 border-c4c-rule pl-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-c4c-petrol text-white text-sm font-bold">
                        1
                      </div>
                      <h3 className="text-lg font-medium text-black">Site Setup & Configuration</h3>
                    </div>
                    <p className="text-black/70 ml-11 mb-4">
                      Tell us the essentials for this location — its details, demographics,
                      livelihoods and vulnerabilities — so everything you build for this site
                      stands on solid ground.
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/dashboard/site/${site._id}/setup`)}
                    >
                      {getSetupCtaLabel()}
                    </Button>
                    {setupProgress !== null && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-c4c-grey-bg text-black whitespace-nowrap">
                        {Math.round(setupProgress)}% complete
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Stakeholder Mapping */}
              <div className="border-l-4 border-c4c-yellow pl-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-c4c-yellow text-black text-sm font-bold">
                        2
                      </div>
                      <h3 className="text-lg font-medium text-black">Site Stakeholder Mapping</h3>
                    </div>
                    <p className="text-black/70 ml-11 mb-3">
                      Map the people this site affects and involves — their interests, their concerns,
                      and how they connect to one another.
                    </p>
                    <div className="ml-11 flex gap-2 text-sm text-black/60">
                      <span>• Map local stakeholders</span>
                      <span>• Analyze site-specific concerns</span>
                      <span>• Plan local engagement</span>
                    </div>
                  </div>
                  <Button
                    className="ml-4 bg-c4c-yellow hover:bg-c4c-petrol text-black hover:text-white"
                    onClick={() => router.push(`/dashboard/site/${site._id}/stakeholders`)}
                  >
                    <Map size={16} className="mr-2" />
                    Map Stakeholders
                  </Button>
                </div>
              </div>
            </div>

            {/* Additional Info Box */}
            <div className="mt-8 bg-c4c-grey-bg rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-c4c-petrol flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-black mb-2">About Site-Level Data Collection</h4>
                  <p className="text-sm text-black/70">
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
            <div className="bg-white rounded-lg border border-c4c-rule p-8 mb-8">
              <h2 className="text-xl font-medium text-black mb-6">
                Site Details Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location */}
                <div className="bg-c4c-grey-bg p-4 rounded-lg">
                  <h3 className="font-medium text-black mb-3">Location Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-c4c-petrol">Region:</span>
                      <span className="text-black font-medium">{formatSiteTaskValue(getSiteTaskValue('admin_level_1'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-c4c-petrol">District:</span>
                      <span className="text-black font-medium">{formatSiteTaskValue(getSiteTaskValue('admin_level_2'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-c4c-petrol">Ward:</span>
                      <span className="text-black font-medium">{formatSiteTaskValue(getSiteTaskValue('admin_level_3'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-c4c-petrol">GPS:</span>
                      <span className="text-black font-medium text-xs">{formatCoordinates(getSiteTaskValue('gps_coordinates'))}</span>
                    </div>
                  </div>
                </div>

                {/* Ecology */}
                <div className="bg-c4c-grey-bg p-4 rounded-lg">
                  <h3 className="font-medium text-black mb-3">Ecology & Size</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-c4c-petrol">Coverage:</span>
                      <span className="text-black font-medium">{formatSiteTaskValue(getSiteTaskValue('site_hectare_coverage'))} ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-c4c-petrol">Zone:</span>
                      <span className="text-black font-medium">{formatSiteTaskValue(getSiteTaskValue('site_ecological_zone'))}</span>
                    </div>
                  </div>
                </div>

                {/* Demographics */}
                <div className="bg-c4c-grey-bg p-4 rounded-lg">
                  <h3 className="font-medium text-black mb-3">Demographics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-c4c-petrol">Population:</span>
                      <span className="text-black font-medium">{formatSiteTaskValue(getSiteTaskValue('estimated_population'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-c4c-petrol">Vulnerable Groups:</span>
                      <span className="text-black font-medium">{getSiteTaskValue('vulnerable_groups_present') ? 'Present' : 'None identified'}</span>
                    </div>
                  </div>
                </div>

                {/* Livelihoods */}
                <div className="bg-c4c-grey-bg p-4 rounded-lg">
                  <h3 className="font-medium text-black mb-3">Livelihoods</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-c4c-petrol">Primary Income:</span>
                      <span className="text-black font-medium">{formatSiteTaskValue(getSiteTaskValue('primary_income_sources'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-c4c-petrol">Wildlife Conflict:</span>
                      <span className="text-black font-medium">{getSiteTaskValue('wildlife_conflict_present') ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contacts */}
          {site.contacts && site.contacts.length > 0 && (
            <div className="bg-white rounded-lg border border-c4c-rule p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-black">Site Contacts</h2>
                {canEditSite && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/site/${site._id}/edit`)}
                  >
                    <Edit size={16} className="mr-2" />
                    Edit Contacts
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {site.contacts.map((contact: any, index: number) => (
                  <div key={contact._id || index} className="border border-c4c-rule rounded-lg p-4">
                    <h3 className="font-medium text-black mb-2">{contact.name}</h3>
                    <p className="text-sm text-black/70 mb-1">{contact.role || 'Role not specified'}</p>
                    {contact.phone && <p className="text-sm text-black/60">{contact.phone}</p>}
                    {contact.email && <p className="text-sm text-black/60">{contact.email}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteDetailsPage;