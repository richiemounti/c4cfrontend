// app/dashboard/stakeholders/edit/site/[siteId]/[groupId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProject, getProjectSite } from '@/lib/api/project';
import { Project, ProjectSite } from '@/types';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import StakeholderGroupForm from '@/components/stakeholders/StakeholderGroupForm';

const EditSiteStakeholderGroupPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const siteId = params.siteId as string;
  const groupId = params.groupId as string;
  const projectId = searchParams.get('projectId');
  const router = useRouter();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [site, setSite] = useState<ProjectSite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) {
        toast({
          title: 'Error',
          description: 'Missing project ID',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load project details
        const projectResponse = await getProject(projectId);
        setProject(projectResponse.data);
        
        // Load site details
        const siteResponse = await getProjectSite(siteId);
        setSite(siteResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    
    if (siteId && groupId) {
      loadData();
    }
  }, [projectId, siteId, groupId, toast]);

  const handleGoBack = () => {
    router.push(`/dashboard/stakeholders/site/${siteId}?projectId=${projectId}`);
  };

  const handleSuccess = () => {
    router.push(`/dashboard/stakeholders/site/${siteId}?projectId=${projectId}`);
  };

  if (!projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Missing Project ID</h2>
          <p className="text-gray-600 mt-2">Please provide a valid project ID in the URL.</p>
        </div>
      </div>
    );
  }

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sky-tint">
      {project && (
        <ProjectSidebar 
          projectId={project._id}
          projectName={project.name}
        />
      )}
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-sky">
          <button 
            onClick={handleGoBack}
            className="flex items-center text-sky-500 hover:text-stratosphere"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Stakeholder Mapping
          </button>
          <h1 className="text-2xl font-medium mt-4 text-stratosphere">Edit Stakeholder Group</h1>
          {site && (
            <p className="text-gray-600 mt-1">Site: {site.name}</p>
          )}
        </div>

        <StakeholderGroupForm
          projectId={projectId}
          siteId={siteId}
          groupId={groupId}
          context="site"
          mode="edit"
          siteName={site?.name}
          onBack={handleGoBack}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default EditSiteStakeholderGroupPage;