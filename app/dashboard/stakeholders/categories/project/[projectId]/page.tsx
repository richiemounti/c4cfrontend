// app/dashboard/stakeholders/categories/project/[projectId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProject } from '@/lib/api/project';
import { Project } from '@/types';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import StakeholderGroupForm from '@/components/stakeholders/StakeholderGroupForm';

interface PageProps {
  params: {
    projectId: string;
  };
}

const CategoriesPage = ({ params }: PageProps) => {
  const { projectId } = params;
  const router = useRouter();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const projectResponse = await getProject(projectId);
        setProject(projectResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    
    loadProject();
  }, [projectId, toast]);

  const handleGoBack = () => {
    router.push(`/dashboard/stakeholders/project/${projectId}`);
  };

  const handleSuccess = () => {
    router.push(`/dashboard/stakeholders/project/${projectId}`);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c4c-coral mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-c4c-grey-bg">
      {project && (
        <ProjectSidebar 
          projectId={project._id}
          projectName={project.name}
        />
      )}
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-c4c-rule">
          <button 
            onClick={handleGoBack}
            className="flex items-center text-c4c-petrol hover:text-black"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Stakeholder Mapping
          </button>
          <h1 className="text-2xl font-medium mt-4 text-black">Add a Stakeholder Group</h1>
        </div>

        <StakeholderGroupForm
          projectId={projectId}
          context="project"
          mode="create"
          onBack={handleGoBack}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default CategoriesPage;