// app/dashboard/project/[id]/stakeholders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Users, AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { getProject } from '@/lib/api/project';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import HeaderHelpActions from '@/components/HeaderHelpActions';
import { Topbar, TopbarBack, TopbarTitle } from '@/components/shared/Topbar';
import { TickList } from '@/components/shared/Lists';
import { Callout } from '@/components/shared/Callout';


interface PageParams {
  id: string;
}

const StakeholderMappingPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: projectId } = params;
  
  const [project, setProject] = useState<Project | any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await getProject(projectId);
        setProject(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project data',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, authLoading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        <ProjectSidebar
          projectId={projectId}
          projectName={project?.name || 'Loading...'}
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c4c-coral"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        <ProjectSidebar
          projectId={projectId}
          projectName="Project"
        />
        <div className="flex-1 p-8">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-medium text-black mb-2">Project Not Found</h2>
          </Card>
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

      <div className="flex-1 min-w-0">
        {/* Header */}
        <Topbar motif="sage">
          <TopbarBack href={`/dashboard/project/${projectId}`}>Back to Project Overview</TopbarBack>
          <TopbarTitle>Stakeholder Mapping</TopbarTitle>
          {project?.organization && (
            <HeaderHelpActions
              organizationId={project.organization}
              guideHref={`/dashboard/project/${projectId}/stakeholders/guide`}
            />
          )}
        </Topbar>

        <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
          {/* Action Section */}
          <Card className="p-8">
            <h2 className="font-title text-xl font-semibold text-black">Ready to Start Mapping?</h2>

            {/* Grey-bg, not gold — gold is reserved for "needs attention"
                status, and coral (the spotlight button below) can't sit
                next to yellow (a banned pairing, Brand Guidelines p.7). */}
            <div className="max-w-2xl mx-auto mt-6">
              <div className="border border-c4c-rule bg-c4c-grey-bg p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-c4c-petrol flex items-center justify-center">
                    <Users size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">
                      Project-Level Stakeholders
                    </h3>
                    <p className="text-c4c-ink/80 mb-4">
                      Map stakeholders that affect or are affected by the entire project across all sites.
                      This includes national agencies, international partners, project-wide community groups,
                      and other stakeholders whose influence or impact spans multiple locations.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 mb-4">
                  <h4 className="font-medium text-black mb-2">What you'll capture:</h4>
                  <TickList
                    icon={<Users />}
                    items={[
                      'Stakeholder identification and categorization',
                      'Interests, concerns, and expectations',
                      'Potential benefits and risks',
                      'Influence and impact assessment',
                    ]}
                  />
                </div>

                <Button
                  className="w-full"
                  variant="spotlight"
                  size="lg"
                  onClick={() => router.push(`/dashboard/stakeholders/project/${projectId}`)}
                >
                  <Users size={20} />
                  Begin Stakeholder Mapping
                </Button>
              </div>
            </div>

            <Callout icon={<AlertCircle size={20} />}>
              <strong>Note:</strong> Site-specific stakeholder mapping is done at the individual site level.
              Navigate to a specific project site to map stakeholders that are unique to that location.
              This separation helps maintain clarity between project-wide and site-specific stakeholder relationships.
            </Callout>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="quiet"
              onClick={() => router.push(`/dashboard/project/${projectId}`)}
            >
              <ArrowLeft size={16} />
              Back to Overview
            </Button>

            <Button
              variant="spotlight"
              onClick={() => router.push(`/dashboard/project/${projectId}/theory-of-change`)}
            >
              Next: Theory of Change
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeholderMappingPage;