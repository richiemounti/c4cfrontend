// app/dashboard/project/[id]/theory-of-change/stage2/intro/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, TrendingUp, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import HeaderHelpActions from '@/components/HeaderHelpActions';

export default function Stage2IntroPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const siteId = searchParams.get('siteId');
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);  // Add this

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);  // Add this to show loading on refresh
        const projectData = await getProject(projectId);
        setProject(projectData.data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading project:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, refreshTrigger]);  // Add refreshTrigger here

  const handleContinue = () => {
    const query = siteId ? `?siteId=${siteId}` : '';
    router.push(`/dashboard/project/${projectId}/theory-of-change/stage2${query}`);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
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
            onClick={() => router.push(`/dashboard/project/${projectId}/theory-of-change/workspace${siteId ? `?selectedSite=${siteId}` : ''}`)}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Theory of Change
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-medium text-stratosphere">Stage 2: Outcomes</h1>
              {project?.organization && (
                <HeaderHelpActions
                  organizationId={project.organization}
                  guideHref={`/dashboard/project/${projectId}/theory-of-change/stage2/guide${siteId ? `?siteId=${siteId}` : ''}`}
                />
              )}
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Call to Action */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-xl font-medium text-stratosphere mb-4">
              Ready to Define Outcomes?
            </h2>
            <p className="text-stratosphere/70 mb-6">
              You'll enter the Stage 2 workspace where you can document expected outcomes, assess risks, 
              and plan mitigation strategies for all stakeholder groups. This is a critical step for 
              comprehensive impact assessment and risk management.
            </p>
            
            <Button 
              className="w-full bg-forest hover:bg-forest/90 text-white"
              size="lg"
              onClick={handleContinue}
            >
              <TrendingUp size={20} className="mr-2" />
              Enter Stage 2 Workspace
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}