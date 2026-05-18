// app/dashboard/stakeholders/edit/project/[projectId]/[groupId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProject } from '@/lib/api/project';
import { Project } from '@/types';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import StakeholderGroupForm from '@/components/stakeholders/StakeholderGroupForm';

const EditStakeholderGroupPage = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const groupId = params.groupId as string;
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
    
    if (projectId) {
      loadProject();
    }
  }, [projectId, toast]);

  const handleGoBack = () => {
    router.push(`/dashboard/stakeholders/project/${projectId}`);
  };

  const handleSuccess = () => {
    router.push(`/dashboard/stakeholders/project/${projectId}`);
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
          {project && (
            <p className="text-gray-600 mt-1">Project: {project.name}</p>
          )}
        </div>

        <StakeholderGroupForm
          projectId={projectId}
          groupId={groupId}
          context="project"
          mode="edit"
          onBack={handleGoBack}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default EditStakeholderGroupPage;