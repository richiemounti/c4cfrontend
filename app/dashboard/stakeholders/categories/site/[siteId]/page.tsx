// app/dashboard/stakeholders/categories/site/[siteId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProject, getProjectSite } from '@/lib/api/project';
import { Project, ProjectSite } from '@/types';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import StakeholderGroupForm from '@/components/stakeholders/StakeholderGroupForm';

interface PageProps {
  params: {
    siteId: string;
  };
}

const SiteCategoriesPage = ({ params }: PageProps) => {
  const { siteId } = params;
  const router = useRouter();
  const { toast } = useToast();
  
  // Get projectId from query params
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [site, setSite] = useState<ProjectSite | any>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load site details
        const siteResponse = await getProjectSite(siteId);
        setSite(siteResponse.data);

        // Fetch project data
        if (projectId) {
          const projectResponse = await getProject(projectId);
          setProject(projectResponse.data); 
        }
        
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
    
    loadData();
  }, [siteId, projectId, toast]);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere mx-auto mb-4"></div>
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
            Back
          </button>
          <h1 className="text-2xl font-medium mt-4 text-stratosphere">Choose Category</h1>
          <p className="text-sm text-gray-600 mt-2">
            Site: <span className="font-medium">{site?.name || 'Unnamed Site'}</span>
          </p>
        </div>

        <StakeholderGroupForm
          projectId={projectId}
          siteId={siteId}
          context="site"
          mode="create"
          siteName={site?.name}
          onBack={handleGoBack}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default SiteCategoriesPage;