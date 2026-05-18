// app/dashboard/project/[id]/theory-of-change/stage2/intro/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, TrendingUp, AlertTriangle, Shield,
  CheckCircle, Target, Users,
  RefreshCw
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
              <p className="text-stratosphere/70 mt-2">
                External-facing: What will CHANGE for stakeholders?
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
              title="Need Help with Stage 2?"
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
                  content: "Stage 2 of the Theory of Change focusses on understanding what changes the stakeholders want to EXPERIENCE as a result of receiving the carbon revenue. This stage is all about what could change - ie. outcomes - for different stakeholder groups.",
                  type: "tip"
                },
                {
                  content: "Don't shy away from documenting negative outcomes - addressing risks proactively is a sign of good project management.",
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
                <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center">
                  <TrendingUp className="text-forest" size={24} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-stratosphere mb-3">
                  Understanding Stage 2: Outcomes
                </h2>
                <p className="text-stratosphere/80 text-lg leading-relaxed">
                  Stage 2 focuses on what change looks like for stakeholders - both positive outcomes 
                  you hope to achieve and potential negative consequences you need to manage. This is 
                  an external-facing stage that centers on STAKEHOLDER experiences and impacts.
                </p>
              </div>
            </div>

            {/* Key Differences from Stage 1 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-stratosphere mb-4">
                Stage 1 vs Stage 2: Key Differences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="text-sky" size={20} />
                    <h4 className="font-medium text-stratosphere">Stage 1: Actions</h4>
                  </div>
                  <ul className="text-sm text-stratosphere/70 space-y-1 ml-7">
                    <li>• What YOU will do</li>
                    <li>• Internal team activities</li>
                    <li>• Your responsibilities</li>
                    <li>• Your accountability</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-forest" size={20} />
                    <h4 className="font-medium text-stratosphere">Stage 2: Outcomes</h4>
                  </div>
                  <ul className="text-sm text-stratosphere/70 space-y-1 ml-7">
                    <li>• What stakeholders experience</li>
                    <li>• Changes in communities</li>
                    <li>• Benefits and risks</li>
                    <li>• Social and environmental impacts</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Focus Areas */}
            <div className="bg-sky-tint rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-stratosphere mb-4">Key Focus Areas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Positive Outcomes</h4>
                    <p className="text-sm text-stratosphere/70">
                      Identify intended benefits and improvements for stakeholder groups
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Risks & Challenges</h4>
                    <p className="text-sm text-stratosphere/70">
                      Document potential negative consequences and unintended impacts
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Mitigation Strategies</h4>
                    <p className="text-sm text-stratosphere/70">
                      Plan how to prevent, reduce, or manage identified risks
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Impact Alignment</h4>
                    <p className="text-sm text-stratosphere/70">
                      Link outcomes to SDGs and resilience frameworks
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What You'll Define */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-stratosphere">What You'll Define in Stage 2</h3>
              
              <div className="space-y-3">
                <div className="bg-white border-2 border-forest rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-forest flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-stratosphere mb-1">Select Stakeholder Group</h4>
                      <p className="text-sm text-stratosphere/70">
                        Choose which stakeholder group will experience this outcome
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-forest rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-forest flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-stratosphere mb-1">Choose Themes & Subthemes</h4>
                      <p className="text-sm text-stratosphere/70">
                        Categorize the outcome using relevant themes (e.g., "Economic Impact") and 
                        subthemes (e.g., "Income Diversification")
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-forest rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-forest flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-stratosphere mb-1">Describe the Outcome</h4>
                      <p className="text-sm text-stratosphere/70">
                        Write a clear description of the change stakeholders will experience. Focus on 
                        their perspective, not your actions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-forest rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-forest flex items-center justify-center text-white font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium text-stratosphere mb-1">Identify Risks</h4>
                      <p className="text-sm text-stratosphere/70">
                        Document potential risks, rate their severity (low, medium, high), and describe 
                        mitigation strategies
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-forest rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-forest flex items-center justify-center text-white font-bold">
                      5
                    </div>
                    <div>
                      <h4 className="font-medium text-stratosphere mb-1">Tag Impact Areas</h4>
                      <p className="text-sm text-stratosphere/70">
                        Link outcomes to relevant SDGs and resilience dimensions for comprehensive impact tracking
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
              Example Outcomes
            </h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <TrendingUp className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-stratosphere mb-1">
                      "Smallholder farmers experience 30% increase in household income through diversified agroforestry products"
                    </p>
                    <div className="text-xs space-y-1 text-stratosphere/70 mt-2">
                      <p><strong>Stakeholder:</strong> Smallholder Farmers</p>
                      <p><strong>Theme:</strong> Economic Impact → Subtheme: Income Diversification</p>
                      <p><strong>Risks:</strong> Market access challenges (Medium severity)</p>
                      <p><strong>Mitigation:</strong> Establish cooperative marketing structures and buyer relationships</p>
                      <p><strong>SDGs:</strong> No Poverty, Zero Hunger</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-stratosphere mb-1">
                      "Risk: Some community members may lose access to traditional forest resources during restoration phase"
                    </p>
                    <div className="text-xs space-y-1 text-stratosphere/70 mt-2">
                      <p><strong>Stakeholder:</strong> Local Community Members</p>
                      <p><strong>Theme:</strong> Resource Access → Subtheme: Forest Products</p>
                      <p><strong>Risk Severity:</strong> High</p>
                      <p><strong>Mitigation:</strong> Implement zoning plan allowing sustainable harvesting; provide alternative livelihood support; phase restoration activities</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <TrendingUp className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-stratosphere mb-1">
                      "Women's groups gain decision-making authority over community benefit-sharing from carbon revenues"
                    </p>
                    <div className="text-xs space-y-1 text-stratosphere/70 mt-2">
                      <p><strong>Stakeholder:</strong> Women's Groups</p>
                      <p><strong>Theme:</strong> Governance → Subtheme: Decision-Making Authority</p>
                      <p><strong>Risks:</strong> Resistance from traditional power structures (Medium severity)</p>
                      <p><strong>Mitigation:</strong> Engage traditional leaders early; build capacity of women leaders; establish clear governance protocols</p>
                      <p><strong>SDGs:</strong> Gender Equality, Reduced Inequalities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-xl font-medium text-stratosphere mb-6">
              Best Practices for Defining Outcomes
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-forest mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Write from Stakeholder Perspective</h3>
                  <p className="text-sm text-stratosphere/70">
                    Describe what stakeholders will experience, not what you will do. Focus on "they will" not "we will"
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-forest mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Consider Both Positive and Negative</h3>
                  <p className="text-sm text-stratosphere/70">
                    Document potential negative outcomes honestly - this is crucial for risk management and GDPR compliance
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-forest mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Be Specific and Measurable</h3>
                  <p className="text-sm text-stratosphere/70">
                    Where possible, include specific metrics or indicators that can be tracked and verified
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-forest mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Assess Risk Severity Honestly</h3>
                  <p className="text-sm text-stratosphere/70">
                    Rate risks based on likelihood and potential impact - high-severity risks require detailed mitigation plans
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-forest mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Link to Broader Frameworks</h3>
                  <p className="text-sm text-stratosphere/70">
                    Connect outcomes to SDGs and resilience dimensions to show alignment with global development goals
                  </p>
                </div>
              </div>
            </div>
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