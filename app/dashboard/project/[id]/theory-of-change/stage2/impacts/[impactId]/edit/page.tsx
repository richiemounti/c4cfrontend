// app/dashboard/project/[id]/theory-of-change/stage2/impacts/[impactId]/edit/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getImpactById, updateImpact } from '@/lib/api/theoryOfChange';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import ImpactForm from '@/components/forms/ImpactForm';
import { CreateImpactData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface StakeholderGroup {
  _id: string;
  name: string;
  project: string;
  projectSite?: string;
  category: {
    _id: string;
    name: string;
  };
}

export default function EditImpactPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const impactId = params.impactId as string;
  const siteId = searchParams.get('siteId'); // Get siteId from query params
  
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [allStakeholderGroups, setAllStakeholderGroups] = useState<StakeholderGroup[]>([]);
  const [project, setProject] = useState<any>(null);
  const [impactData, setImpactData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter stakeholder groups based on context (project vs site)
  const filteredStakeholderGroups = useMemo(() => {
    if (!allStakeholderGroups || allStakeholderGroups.length === 0) return [];
    
    if (siteId) {
      // Site context: Show only stakeholders with this specific projectSite
      return allStakeholderGroups.filter(group => group.projectSite === siteId);
    } else {
      // Project context: Show only stakeholders WITHOUT projectSite
      return allStakeholderGroups.filter(group => !group.projectSite);
    }
  }, [allStakeholderGroups, siteId]);
  
  // Helper function to get error message from API response
  const getErrorMessage = (error: any): string => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return data.message || 'Please check your input and try again';
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return 'You don\'t have permission to perform this action.';
        case 404:
          return 'Impact not found. It may have been deleted.';
        case 409:
          return 'An impact with the same content already exists.';
        case 422:
          return 'Invalid data provided. Please check your inputs.';
        case 500:
          return 'Server error. Please try again or contact support.';
        default:
          return data.message || `Error ${status}: Operation failed`;
      }
    } else if (error.request) {
      return 'Network error. Please check your connection and try again.';
    } else {
      return error.message || 'An unexpected error occurred';
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch project details
        const projectData = await getProject(projectId);
        setProject(projectData.data);
        
        // Get ALL stakeholder groups for the project (we'll filter client-side)
        const { data: stakeholderResponse } = await stakeholderMappingApi.getStakeholderGroups(projectId, siteId || undefined);
        
        // Extract stakeholder groups from the correct path
        const extractedStakeholderGroups = stakeholderResponse.data?.stakeholderGroups || [];
        setAllStakeholderGroups(extractedStakeholderGroups);
        
        // Fetch existing impact data
        const { data: impactResponse } = await getImpactById(impactId);
        if (impactResponse.success) {
          setImpactData(impactResponse.data);
        } else {
          throw new Error('Failed to load impact data');
        }
        
      } catch (error) {
        console.error("Error loading data:", error);
        
        const errorMessage = getErrorMessage(error);
        toast({
          title: "Loading Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Navigate back on error
        setTimeout(() => {
          const url = `/dashboard/project/${projectId}/theory-of-change/stage2`;
          router.push(siteId ? `${url}?siteId=${siteId}` : url);
        }, 2000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, impactId, siteId, toast, router]);
  
  const handleSubmit = async (data: CreateImpactData) => {
    try {
      setIsSubmitting(true);
      
      toast({
        title: "Updating Outcome",
        description: "Please wait while we update your outcome...",
      });
      
      await updateImpact(impactId, data);
      
      toast({
        title: "Success!",
        description: "Outcome updated successfully",
      });
      
      // Navigate back with context preserved
      setTimeout(() => {
        const url = `/dashboard/project/${projectId}/theory-of-change/stage2`;
        router.push(siteId ? `${url}?siteId=${siteId}` : url);
      }, 1500);
      
    } catch (error) {
      console.error("Error updating impact:", error);
      
      const errorMessage = getErrorMessage(error);
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const url = `/dashboard/project/${projectId}/theory-of-change/stage2`;
    router.push(siteId ? `${url}?siteId=${siteId}` : url);
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
          <p className="text-stratosphere font-medium ml-3">Loading impact data...</p>
        </div>
      </div>
    );
  }
  
  if (!impactData) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        {project && (
          <ProjectSidebar 
            projectId={project._id}
            projectName={project.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">Impact not found</p>
            <button
              onClick={handleCancel}
              className="text-sky-500 hover:text-stratosphere"
            >
              Return to Stage 2
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
            onClick={() => {
              const url = `/dashboard/project/${projectId}/theory-of-change/stage2`;
              router.push(siteId ? `${url}?siteId=${siteId}` : url);
            }}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Stage 2
          </button>
          <div>
            <h1 className="text-2xl font-medium text-stratosphere">
              Edit Social Outcome {siteId && <span className="text-gray-500">(Site Level)</span>}
            </h1>
            <p className="text-gray-500 mt-2">
              Update outcome for {impactData.stakeholderGroup.name}
            </p>
          </div>
        </div>

        {/* Context Info */}
        {siteId && (
          <div className="mx-8 mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Site Context:</span> You are editing a site-specific outcome.
            </p>
          </div>
        )}

        {/* Main content */}
        <div className="p-8">
          <ImpactForm
            projectId={projectId}
            projectSiteId={siteId || undefined}
            stageId={impactData.stage}
            stakeholderGroups={filteredStakeholderGroups}
            impactId={impactId}
            organizationId={project?.organization?._id || project?.organization}
            userRole={(user?.primaryRole as 'manager' | 'projectCreator' | 'organiser' | 'reviewer') || 'reviewer'}
            currentUser={user ? { _id: user._id, name: user.name, email: user.email } : undefined}
            initialData={impactData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitLabel="Update Outcome"
            title="Edit Outcome Details"
          />
        </div>
      </div>
    </div>
  );
}