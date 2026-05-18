// app/dashboard/site/[id]/stakeholders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Users, AlertCircle, CheckCircle, Map, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { getProjectSite, getProject } from '@/lib/api/project';
import { ProjectSite, Project } from '@/types';
import { Button } from '@/components/ui/button';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import InstructionalPanel from '@/components/InstructionalPanel';


interface PageParams {
  id: string;
}

const SiteStakeholderMappingPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: siteId } = params;
  
  const [site, setSite] = useState<ProjectSite | any>(null);
  const [project, setProject] = useState<Project | any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }

    const fetchData = async () => {
      try {
        const siteResponse = await getProjectSite(siteId);
        setSite(siteResponse.data);

        if (siteResponse.data.project) {
          const projectId = typeof siteResponse.data.project === 'object' 
            ? siteResponse.data.project._id 
            : siteResponse.data.project;
            
          const projectResponse = await getProject(projectId);
          setProject(projectResponse.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load site data',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId, authLoading, isAuthenticated, router]);

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

  if (!site || !project) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        <ProjectSidebar 
          projectId={project?._id || ''}
          projectName={project?.name || 'Project'}
        />
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Site Not Found</h2>
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
            onClick={() => router.push(`/dashboard/site/${siteId}`)}
            className="flex items-center text-sky-500 hover:text-stratosphere mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Site Overview
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-medium text-stratosphere">Site Stakeholder Mapping</h1>
              <p className="text-stratosphere/70 mt-2">
                Map local stakeholders for {site.name}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
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
                  Understanding Site-Level Stakeholder Mapping
                </h2>
                <p className="text-stratosphere/80 text-lg leading-relaxed">
                  Site-level stakeholder mapping focuses on identifying and understanding individuals, 
                  groups, and organizations that are specifically affected by or can influence activities 
                  at this particular location. This complements the project-level mapping by providing 
                  granular, location-specific stakeholder intelligence.
                </p>
              </div>
            </div>

            {/* Site Context */}
            <div className="bg-sky-tint rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-stratosphere mb-3">Site Context</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Site Name:</span>
                  <p className="text-stratosphere font-medium mt-1">{site.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <p className="text-stratosphere font-medium mt-1">
                    {site.city && site.country 
                      ? `${site.city}, ${site.country}`
                      : site.region || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="text-stratosphere font-medium mt-1">{site.siteType || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* What Makes Site Mapping Different */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-stratosphere mb-4">What Makes Site-Level Mapping Different?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Local Focus</h4>
                    <p className="text-sm text-stratosphere/70">
                      Emphasis on community members, local leaders, and groups that live or work at this specific location
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Direct Impact</h4>
                    <p className="text-sm text-stratosphere/70">
                      Focus on stakeholders who will be directly affected by day-to-day project activities
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Ground-Level Context</h4>
                    <p className="text-sm text-stratosphere/70">
                      Understanding of local dynamics, relationships, and power structures specific to this area
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-stratosphere mb-1">Practical Engagement</h4>
                    <p className="text-sm text-stratosphere/70">
                      Actionable insights for field teams conducting activities at this location
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Stakeholder Types */}
            <div>
              <h3 className="text-lg font-medium text-stratosphere mb-4">Key Stakeholder Types to Consider</h3>
              <div className="space-y-3">
                <div className="bg-white border border-sky rounded-lg p-4">
                  <h4 className="font-medium text-stratosphere mb-2">Local Communities</h4>
                  <p className="text-sm text-stratosphere/70">
                    Residents, households, and community groups directly living in or near the site. 
                    Consider different sub-groups: youth, women, elders, vulnerable populations.
                  </p>
                </div>
                
                <div className="bg-white border border-sky rounded-lg p-4">
                  <h4 className="font-medium text-stratosphere mb-2">Traditional & Local Leaders</h4>
                  <p className="text-sm text-stratosphere/70">
                    Chiefs, elders, religious leaders, and other influential figures in the local community 
                    who have decision-making authority or social influence.
                  </p>
                </div>
                
                <div className="bg-white border border-sky rounded-lg p-4">
                  <h4 className="font-medium text-stratosphere mb-2">Local Government</h4>
                  <p className="text-sm text-stratosphere/70">
                    Ward administrators, local council members, extension officers, and other 
                    government representatives operating at this location.
                  </p>
                </div>
                
                <div className="bg-white border border-sky rounded-lg p-4">
                  <h4 className="font-medium text-stratosphere mb-2">Local Organizations</h4>
                  <p className="text-sm text-stratosphere/70">
                    Community-based organizations (CBOs), cooperatives, self-help groups, 
                    and local NGOs active in the area.
                  </p>
                </div>
                
                <div className="bg-white border border-sky rounded-lg p-4">
                  <h4 className="font-medium text-stratosphere mb-2">Resource Users</h4>
                  <p className="text-sm text-stratosphere/70">
                    Farmers, pastoralists, fishers, and others who depend on natural resources 
                    in the site area for their livelihoods.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-xl font-medium text-stratosphere mb-6">Begin Site Stakeholder Mapping</h2>
            
            <div className="max-w-2xl mx-auto">
              <div className="border border-ochre rounded-lg p-8 bg-ochre/5">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ochre flex items-center justify-center">
                    <Users size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-stratosphere mb-2">
                      Map {site.name} Stakeholders
                    </h3>
                    <p className="text-stratosphere/70 mb-4">
                      Identify and analyze stakeholder groups specific to this site. Focus on local 
                      communities, site-level authorities, and other location-specific groups.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-stratosphere mb-2">What you'll document:</h4>
                  <ul className="space-y-2 text-sm text-stratosphere/70">
                    <li className="flex items-start gap-2">
                      <span className="text-ochre mt-1">•</span>
                      <span>Local stakeholder identification and categorization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ochre mt-1">•</span>
                      <span>Site-specific interests and concerns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ochre mt-1">•</span>
                      <span>Local benefits and risks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ochre mt-1">•</span>
                      <span>Community dynamics and relationships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ochre mt-1">•</span>
                      <span>Site-specific engagement strategies</span>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  className="w-full bg-ochre hover:bg-ochre/90 text-white"
                  size="lg"
                  onClick={() => router.push(`/dashboard/stakeholders/site/${siteId}?projectId=${project._id}`)}
                >
                  <Map size={20} className="mr-2" />
                  Start Site Stakeholder Mapping
                </Button>
              </div>
            </div>

            <div className="bg-sky-tint rounded-lg p-4 flex items-start gap-3 mt-6">
              <AlertCircle className="text-sky flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-stratosphere">
                <strong>Tip:</strong> Coordinate with field teams and local staff who have direct 
                knowledge of the site. Their insights about community dynamics and local relationships 
                are invaluable for comprehensive stakeholder mapping.
              </div>
            </div>
          </div>

          {/* Site-Specific Best Practices */}
          <div className="bg-white rounded-lg border border-sky p-8 mb-8">
            <h2 className="text-xl font-medium text-stratosphere mb-6">Site Mapping Best Practices</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ochre mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Work with Local Staff</h3>
                  <p className="text-sm text-stratosphere/70">
                    Engage field officers, enumerators, and community liaisons who have established 
                    relationships and understand local context. They can provide crucial insights 
                    about community dynamics.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ochre mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Consider Sub-Groups</h3>
                  <p className="text-sm text-stratosphere/70">
                    Don't treat communities as monolithic. Identify different groups within the 
                    community (by age, gender, livelihood, ethnicity) as they may have different 
                    interests and concerns.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ochre mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Map Power Dynamics</h3>
                  <p className="text-sm text-stratosphere/70">
                    Understand local power structures and decision-making processes. Who has 
                    formal authority? Who has informal influence? How are decisions typically made?
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ochre mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Update Regularly</h3>
                  <p className="text-sm text-stratosphere/70">
                    Stakeholder dynamics can change quickly at the local level. Update your mapping 
                    as you learn more, as seasons change, or as project activities progress.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ochre mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-stratosphere mb-1">Link to Project-Level Mapping</h3>
                  <p className="text-sm text-stratosphere/70">
                    Be aware of how site-level stakeholders relate to project-level ones. 
                    Local groups may be affiliated with national organizations, or local leaders 
                    may have connections to regional authorities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/site/${siteId}`)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Site Overview
            </Button>
            
            <Button 
              onClick={() => router.push(`/dashboard/project/${project._id}`)}
            >
              Go to Project Dashboard
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-8">
            <InstructionalPanel
              title="Need Help with Site Stakeholder Mapping?"
              texts={[
                {
                  content: "Involve local staff and community members in the mapping process - they have invaluable contextual knowledge.",
                  type: "tip"
                },
                {
                  content: "Document both positive and negative perceptions to understand the full range of stakeholder views.",
                  type: "info"
                }
              ]}
              links={[
                {
                  href: "/support/stakeholder-mapping",
                  label: "Stakeholder Mapping Guide",
                  description: "Comprehensive guide to stakeholder analysis",
                  external: false
                },
                {
                  href: "/support/site-management",
                  label: "Site Management Best Practices",
                  description: "Learn about effective site-level operations",
                  external: false
                }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteStakeholderMappingPage;