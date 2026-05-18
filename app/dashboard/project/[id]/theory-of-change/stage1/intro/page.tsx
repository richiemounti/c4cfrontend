// app/dashboard/project/[id]/theory-of-change/stage1/intro/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, Target, Users, Calendar, 
  CheckCircle, AlertCircle, ListChecks, Clock,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProject } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import InstructionalPanel from '@/components/InstructionalPanel';

export default function Stage1IntroPage() {
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
    router.push(`/dashboard/project/${projectId}/theory-of-change/stage1${query}`);
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
              <h1 className="text-3xl font-medium text-stratosphere">Stage 1: Actions</h1>
              <p className="text-stratosphere/70 mt-2">
                Internal-facing: What will your team DO?
              </p>
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
              title="Need Help with Stage 1?"
              videos={[
                {
                  src: "/videos/instructional/project-setup/creating-project.mp4",
                  title: "How to Create a New Project",
                  description: "This 3-minute tutorial walks you through the entire project creation process, from initial setup to adding your first survey.",
                  poster: "/videos/instructional/project-setup/creating-project-poster.PNG",
                  autoPlay: false,
                  loop: false
                }
              ]}
              texts={[
                {
                  content: "Focus on what stakeholders and your team will DO, not what will change for them.",
                  type: "tip"
                },
                {
                  content: "Multiple actions can relate to the same stakeholder group - organize them by themes for clarity.",
                  type: "info"
                },
                {
                  content: "If you have questions check out the knowledge base.",
                  type: "tip"
                }
              ]}
            />
          </div>
          {/* Introduction */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-sky/10 flex items-center justify-center">
                  <Target className="text-sky" size={24} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-stratosphere mb-3">
                  Understanding Stage 1: Actions
                </h2>
                <p className="text-stratosphere/80 text-lg leading-relaxed">
                  Stage 1 is where you define the concrete actions your team and stakeholders will take to achieve 
                  your project goals. This is an internal-facing stage that focuses on YOUR activities, 
                  YOUR responsibilities, and YOUR accountability structures.
                </p>
              </div>
            </div>

            {/* Key Focus Areas */}
            <div className="bg-sky-tint rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-stratosphere mb-4">Key Focus Areas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Specific Actions</h4>
                    <p className="text-sm text-stratosphere/70">
                      Define clear, actionable steps your team will take to implement the project
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Stakeholder Connection</h4>
                    <p className="text-sm text-stratosphere/70">
                      Link each action to specific stakeholder groups who will be involved
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Thematic Organization</h4>
                    <p className="text-sm text-stratosphere/70">
                      Organize actions by themes and subthemes for clear categorization
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Accountability</h4>
                    <p className="text-sm text-stratosphere/70">
                      Assign responsibilities and timeframes to ensure follow-through
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What You'll Define */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-stratosphere">What You'll Define in Stage 1</h3>
              
              <div className="space-y-3">
                <div className="bg-white border-2 border-sky rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-stratosphere mb-1">Select Stakeholder Group</h4>
                      <p className="text-sm text-stratosphere/70">
                        Choose which stakeholder group this action relates to (from your stakeholder mapping)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-sky rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-stratosphere mb-1">Choose Themes & Subthemes</h4>
                      <p className="text-sm text-stratosphere/70">
                        Categorize the action using relevant themes (e.g., "Livelihoods") and subthemes 
                        (e.g., "Alternative Income") to organize your work
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-sky rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-stratosphere mb-1">Describe the Action</h4>
                      <p className="text-sm text-stratosphere/70">
                        Write a clear description of what your team will do. Be specific and action-oriented.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-sky rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky flex items-center justify-center text-white font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium text-stratosphere mb-1">Assign Responsibility</h4>
                      <p className="text-sm text-stratosphere/70">
                        Identify who is responsible for this action (name, role, contact information)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-sky rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky flex items-center justify-center text-white font-bold">
                      5
                    </div>
                    <div>
                      <h4 className="font-medium text-stratosphere mb-1">Set Timeframe</h4>
                      <p className="text-sm text-stratosphere/70">
                        Define when this action will start and when it should be completed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-xl font-medium text-stratosphere mb-6">
              Example Actions
            </h2>
            
            <div className="space-y-4">
              <div className="bg-sky-tint rounded-lg p-4">
                <div className="flex items-start gap-3 mb-2">
                  <ListChecks className="text-sky flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-stratosphere mb-1">
                      "Conduct baseline carbon stock assessment in collaboration with local communities"
                    </p>
                    <div className="text-xs space-y-1 text-stratosphere/70">
                      <p><strong>Stakeholder:</strong> Local Community Members</p>
                      <p><strong>Theme:</strong> Environmental Management → Subtheme: Carbon Sequestration</p>
                      <p><strong>Responsibility:</strong> John Doe, Field Coordinator</p>
                      <p><strong>Timeframe:</strong> Jan 2025 - Mar 2025</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-sky-tint rounded-lg p-4">
                <div className="flex items-start gap-3 mb-2">
                  <ListChecks className="text-sky flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-stratosphere mb-1">
                      "Provide training on agroforestry techniques to smallholder farmers"
                    </p>
                    <div className="text-xs space-y-1 text-stratosphere/70">
                      <p><strong>Stakeholder:</strong> Smallholder Farmers</p>
                      <p><strong>Theme:</strong> Livelihoods → Subtheme: Agricultural Practices</p>
                      <p><strong>Responsibility:</strong> Jane Smith, Training Officer</p>
                      <p><strong>Timeframe:</strong> Feb 2025 - Jun 2025</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-sky-tint rounded-lg p-4">
                <div className="flex items-start gap-3 mb-2">
                  <ListChecks className="text-sky flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-stratosphere mb-1">
                      "Establish community forest management committee with local leaders"
                    </p>
                    <div className="text-xs space-y-1 text-stratosphere/70">
                      <p><strong>Stakeholder:</strong> Traditional Leaders</p>
                      <p><strong>Theme:</strong> Governance → Subtheme: Community Institutions</p>
                      <p><strong>Responsibility:</strong> Project Manager</p>
                      <p><strong>Timeframe:</strong> Jan 2025 - Feb 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-xl font-medium text-stratosphere mb-6">
              Best Practices for Defining Actions
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-sky mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Be Specific and Action-Oriented</h3>
                  <p className="text-sm text-stratosphere/70">
                    Use clear, action verbs (conduct, provide, establish, develop, implement) and 
                    avoid vague language
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-sky mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Connect to Stakeholders</h3>
                  <p className="text-sm text-stratosphere/70">
                    Every action should clearly relate to at least one stakeholder group. This 
                    ensures your work is stakeholder-centered.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-sky mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Assign Clear Responsibility</h3>
                  <p className="text-sm text-stratosphere/70">
                    Identify specific team members responsible for each action to ensure accountability
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-sky mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Set Realistic Timeframes</h3>
                  <p className="text-sm text-stratosphere/70">
                    Provide achievable start and end dates that account for dependencies and resources
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-sky mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Organize by Themes</h3>
                  <p className="text-sm text-stratosphere/70">
                    Use themes and subthemes consistently to make reporting and analysis easier later
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-xl font-medium text-stratosphere mb-4">
              Ready to Define Your Actions?
            </h2>
            <p className="text-stratosphere/70 mb-6">
              You'll enter the Stage 1 workspace where you can create, organize, and manage all 
              actions for your project. You can add actions one at a time or in batches, and 
              you can always come back to refine them later.
            </p>
            
            <Button 
              className="w-full bg-sky hover:bg-sky/90 text-white"
              size="lg"
              onClick={handleContinue}
            >
              <Target size={20} className="mr-2" />
              Enter Stage 1 Workspace
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/project/${projectId}/theory-of-change/workspace${siteId ? `?selectedSite=${siteId}` : ''}`)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Theory of Change
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}