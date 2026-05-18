// app/dashboard/project/[id]/stakeholders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Plus, Users, AlertCircle, CheckCircle, Map, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { getProject } from '@/lib/api/project';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import InstructionalPanel from '@/components/InstructionalPanel';


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
      <div className="flex min-h-screen bg-sky-tint">
        <ProjectSidebar 
          projectId={projectId}
          projectName={project?.name || 'Loading...'}
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        <ProjectSidebar 
          projectId={projectId}
          projectName="Project"
        />
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Project Not Found</h2>
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
            onClick={() => router.push(`/dashboard/project/${projectId}`)}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Project Overview
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-medium text-stratosphere">Stakeholder Mapping</h1>
              <p className="text-stratosphere/70 mt-2">
                Identify and analyze key stakeholders for {project.name}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Help Section */}
          <div className="py-8">
            <InstructionalPanel
              title="Need Help with Stakeholder Mapping?"
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
                  content: "Use stakeholder categories to organize groups logically - this makes analysis and reporting easier.",
                  type: "tip"
                },
                {
                  content: "Consider and document the relationship each stakeholder has with the project.",
                  type: "info"
                },
                {
                  content: "If you have questions check out the knowledge base.",
                  type: "tip"
                }
              ]}
            />
          </div>
          {/* Introduction Section */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-ochre/10 flex items-center justify-center">
                  <Map className="text-ochre" size={24} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-stratosphere mb-3">
                  Understanding Stakeholder Mapping
                </h2>
                <p className="text-stratosphere/80 text-md leading-relaxed">
                  Stakeholder mapping is a critical process for understanding who is affected by or can influence 
                  your project. This systematic approach helps you identify all relevant parties, understand their 
                  interests and concerns, assess their role in the project, and develop appropriate engagement strategies.
                </p>
              </div>
            </div>

            {/* Why It Matters */}
            <div className="bg-sky-tint rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-stratosphere mb-4">Why Stakeholder Mapping Matters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Risk Management</h4>
                    <p className="text-sm text-stratosphere/70">
                      Identify potential conflicts and risks early in the project lifecycle
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">GDPR Compliance</h4>
                    <p className="text-sm text-stratosphere/70">
                      Ensure proper data handling and consent management for all stakeholders
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Better Outcomes</h4>
                    <p className="text-sm text-stratosphere/70">
                      Design interventions that address real needs and concerns of affected communities
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Social License</h4>
                    <p className="text-sm text-stratosphere/70">
                      Build trust and maintain ongoing community support for project activities
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* The Process */}
            <div>
              <h3 className="text-lg font-medium text-stratosphere mb-4">The Stakeholder Mapping Process</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ochre text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Identify Stakeholder Groups</h4>
                    <p className="text-sm text-stratosphere/70">
                      List all individuals, communities, organizations, and entities that may be affected by 
                      or can influence the project. Consider local communities, government agencies, NGOs, 
                      private sector actors, and vulnerable groups.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ochre text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Analyze Interests & Concerns</h4>
                    <p className="text-sm text-stratosphere/70">
                      For each stakeholder group, document their interests in the project, concerns they may have, 
                      potential benefits they could receive, and risks they might face. This helps you understand 
                      different perspectives and priorities.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ochre text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Map Influence & Impact</h4>
                    <p className="text-sm text-stratosphere/70">
                      Assess each stakeholder's level of influence over the project and how much they will be 
                      impacted by it. This helps prioritize engagement efforts and resource allocation.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ochre text-white flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Use This Analysis To Develop Engagement Strategy</h4>
                    <p className="text-sm text-stratosphere/70">
                      Based on your analysis, create tailored engagement approaches for different stakeholder 
                      groups. Plan consultation activities, communication channels, and feedback mechanisms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-xl font-medium text-stratosphere mb-6">Ready to Start Mapping?</h2>
            
            <div className="max-w-2xl mx-auto">
              <div className="border border-ochre rounded-lg p-8 bg-ochre/5">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ochre flex items-center justify-center">
                    <Users size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-stratosphere mb-2">
                      Project-Level Stakeholders
                    </h3>
                    <p className="text-stratosphere/70 mb-4">
                      Map stakeholders that affect or are affected by the entire project across all sites.
                      This includes national agencies, international partners, project-wide community groups,
                      and other stakeholders whose influence or impact spans multiple locations.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-stratosphere mb-2">What you'll capture:</h4>
                  <ul className="space-y-2 text-sm text-stratosphere/70">
                    <li className="flex items-start gap-2">
                      <span className="text-ochre mt-1">•</span>
                      <span>Stakeholder identification and categorization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ochre mt-1">•</span>
                      <span>Interests, concerns, and expectations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ochre mt-1">•</span>
                      <span>Potential benefits and risks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ochre mt-1">•</span>
                      <span>Influence and impact assessment</span>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  className="w-full bg-ochre hover:bg-ochre/90 text-white"
                  size="lg"
                  onClick={() => router.push(`/dashboard/stakeholders/project/${projectId}`)}
                >
                  <Users size={20} className="mr-2" />
                  Begin Stakeholder Mapping
                </Button>
              </div>
            </div>

            <div className="bg-sky-tint rounded-lg p-4 flex items-start gap-3 mt-6">
              <AlertCircle className="text-sky flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-stratosphere">
                <strong>Note:</strong> Site-specific stakeholder mapping is done at the individual site level. 
                Navigate to a specific project site to map stakeholders that are unique to that location. 
                This separation helps maintain clarity between project-wide and site-specific stakeholder relationships.
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-xl font-medium text-stratosphere mb-6">Best Practices</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ochre mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Be Inclusive</h3>
                  <p className="text-sm text-stratosphere/70">
                    Consider all groups that might be affected, especially vulnerable and marginalized communities 
                    who may not have a strong voice but could be significantly impacted.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ochre mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Engage Early & Often</h3>
                  <p className="text-sm text-stratosphere/70">
                    Stakeholder mapping is not a one-time exercise. Update your mapping as you learn more, 
                    as circumstances change, or as new stakeholders emerge.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ochre mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Document Thoroughly</h3>
                  <p className="text-sm text-stratosphere/70">
                    Keep detailed records of stakeholder interests, concerns, and engagement activities. 
                    This documentation is crucial for compliance and helps maintain institutional memory.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ochre mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Respect Data Privacy</h3>
                  <p className="text-sm text-stratosphere/70">
                    Always obtain proper consent before collecting stakeholder information. Handle personal 
                    data in accordance with GDPR and local data protection regulations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/project/${projectId}`)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Overview
            </Button>
            
            <Button 
              onClick={() => router.push(`/dashboard/project/${projectId}/theory-of-change`)}
            >
              Next: Theory of Change
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default StakeholderMappingPage;