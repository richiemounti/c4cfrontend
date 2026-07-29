// app/dashboard/project/[id]/theory-of-change/stage2/intro/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, TrendingUp, RefreshCw, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import InstructionalPanel from '@/components/InstructionalPanel';

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
              <Link
                href={`/dashboard/project/${projectId}/theory-of-change/stage2/guide${siteId ? `?siteId=${siteId}` : ''}`}
                className="inline-flex items-center text-sm text-forest hover:text-forest-600 mt-2"
              >
                <BookOpen size={14} className="mr-1" />
                Theory of Change Stage 2 Guide
              </Link>
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
          {/* Help Section */}
          <div className="py-8">
            <InstructionalPanel
              title="Getting Started Guide"
              subtitle="Stage 2 is external-facing — it's about what changes for stakeholders as a result of your work. That's different from Stage 1, which covers what your team will do."
              texts={[
                {
                  content: "Watch the video tutorial for an overview of Stage 2.",
                  type: "tip"
                },
                {
                  content: "Read the Theory of Change Stage 2 Guide.",
                  type: "info"
                },
                {
                  content: "Enter the workspace and define your outcomes — for every stakeholder group, covering both the benefits you hope for and the risks you need to manage.",
                  type: "info"
                },
                {
                  content: "Questions? Reach out to your Mentor, Hannah.",
                  type: "note"
                }
              ]}
              links={[
                {
                  href: `/dashboard/project/${projectId}/theory-of-change/stage2/guide${siteId ? `?siteId=${siteId}` : ''}`,
                  label: "Theory of Change Stage 2 Guide",
                  description: "Review this before you begin",
                  external: false
                },
                {
                  href: "mailto:hannah@citizens4change.net",
                  label: "Email Hannah",
                  description: "Your project mentor",
                  external: true
                }
              ]}
            />
          </div>

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