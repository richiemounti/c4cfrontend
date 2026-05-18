// app/dashboard/organization/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Trash2, Pin, HelpCircle, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { getOrganization } from '@/lib/api/organization';
import { getOrganizationProjects, archiveProject, createProject } from '@/lib/api/project';
import { Organization, Project } from '@/types';
import InstructionalPanel from '@/components/InstructionalPanel';

interface PageParams {
  id: string;
}

const ProjectDashboard = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: organizationId } = params;
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pinnedProjects, setPinnedProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch organization data
      const orgResponse = await getOrganization(organizationId);
      setOrganization(orgResponse.data);
      
      // Fetch projects for this organization
      const projectsResponse = await getOrganizationProjects(organizationId);
      
      setProjects(projectsResponse.data);
      
      // For demonstration purposes, let's assume pinned projects are saved in localStorage
      // In a real app, this would be a property on the project or a separate user preference
      const pinnedProjectIds = JSON.parse(localStorage.getItem(`pinnedProjects_${organizationId}`) || '[]');
      const pinnedProjs = projectsResponse.data.filter(project => 
        pinnedProjectIds.includes(project._id)
      );
      setPinnedProjects(pinnedProjs);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organization data',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }

    fetchData();
  }, [organizationId, authLoading, isAuthenticated, router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const togglePinProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    
    // Get current pinned projects
    const pinnedProjectIds = JSON.parse(localStorage.getItem(`pinnedProjects_${organizationId}`) || '[]');
    
    // Toggle pinned status
    let newPinnedIds: any;
    if (pinnedProjectIds.includes(projectId)) {
      newPinnedIds = pinnedProjectIds.filter((id: string) => id !== projectId);
    } else {
      newPinnedIds = [...pinnedProjectIds, projectId];
    }
    
    // Save to localStorage
    localStorage.setItem(`pinnedProjects_${organizationId}`, JSON.stringify(newPinnedIds));
    
    // Update UI
    const newPinnedProjects = projects.filter(project => 
      newPinnedIds.includes(project._id)
    );
    setPinnedProjects(newPinnedProjects);
    
    // Update isPinned property for rendering
    const updatedProjects = projects.map(project => {
      if (project._id === projectId) {
        return {...project, isPinned: !pinnedProjectIds.includes(projectId)};
      }
      return {...project, isPinned: pinnedProjectIds.includes(project._id)};
    });
    
    setProjects(updatedProjects);
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    
    if (window.confirm('Are you sure you want to archive this project?')) {
      try {
        await archiveProject(projectId);
        
        // Remove the archived project from the local state immediately
        setProjects(prevProjects => prevProjects.filter(p => p._id !== projectId));
        setPinnedProjects(prevPinned => prevPinned.filter(p => p._id !== projectId));
        
        // Also update localStorage for pinned projects
        const pinnedProjectIds = JSON.parse(localStorage.getItem(`pinnedProjects_${organizationId}`) || '[]');
        const newPinnedIds = pinnedProjectIds.filter((id: string) => id !== projectId);
        localStorage.setItem(`pinnedProjects_${organizationId}`, JSON.stringify(newPinnedIds));
        
        toast({
          title: 'Success',
          description: 'Project archived successfully',
        });
      } catch (error) {
        console.error('Archive error:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to archive project',
          variant: 'destructive',
        });
      }
    }
  };

  // Filter projects based on search and status filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  }).map(project => ({
    ...project,
    isPinned: pinnedProjects.some(p => p._id === project._id)
  }));

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere mx-auto mb-4"></div>
          <p className="text-stratosphere font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="flex-1">
        {/* Organization Header */}
        <div className="bg-sky-tint px-8 py-6 border-b border-sky">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-white border border-sky rounded-full flex items-center justify-center mr-4">
              <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-medium text-stratosphere">{organization?.name}</h1>
              <p className="text-sm text-sky">
                {organization?.city}, {organization?.country}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Help & Resources Panel */}
          <div className="py-4">
            <InstructionalPanel
              title="Set up your organisation"
              texts={[
                {
                  content: "Pin frequently accessed projects to your dashboard for quick navigation and overview of key metrics.",
                  type: "info"
                },
                {
                content: "If you have questions check out the knowledge base.",
                type: "tip"
              }
              ]}
              variant="default"
            />
          </div>
          {/* Pinned Projects section */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <h2 className="text-lg font-medium text-stratosphere">Pinned Projects</h2>
              <button className="ml-2 text-gray-400 hover:text-gray-500" title="Pin your most important projects for quick access">
                <HelpCircle size={16} />
              </button>
            </div>
            <p className="text-sm text-sky mb-4">
              Pin projects here to access them quickly and view key metrics
            </p>
            
            {pinnedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedProjects.map(project => (
                  <div 
                    key={project._id} 
                    className="border border-sky bg-white rounded-lg p-4 cursor-pointer hover:border-sky-500 hover:bg-sky-50"
                    onClick={() => router.push(`/dashboard/project/${project._id}`)}
                  >
                    <h3 className="font-medium text-stratosphere">{project.name}</h3>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-sky">{project.status}</span>
                      <span className="text-sm text-sky">{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-sky rounded-lg p-6 text-center text-sky bg-white">
                No pinned projects. Pin a project to see it here.
              </div>
            )}
          </div>

          {/* All Projects section */}
          <div className="bg-white rounded-lg border border-sky">
            <div className="border-b border-sky px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-medium text-stratosphere">{projects.length} Projects</h2>
              <Link 
                href={`/dashboard/organization/${organizationId}/create-project`} 
                className="bg-ochre text-white py-2 px-4 rounded hover:bg-ochre-900 flex items-center"
              >
                <Plus size={20} className="mr-1" />
                Create project
              </Link>
            </div>

            {/* Filter and search */}
            <div className="px-6 py-4 flex justify-between">
              <div>
                <label className="block text-sm text-stratosphere mb-1">Filter by</label>
                <select 
                  className="bg-sky-tint border border-sky rounded px-3 py-2 text-sm text-stratosphere w-36"
                  value={filterStatus}
                  onChange={handleFilterChange}
                >
                  <option>All</option>
                  <option>planning</option>
                  <option>active</option>
                  <option>completed</option>
                  <option>suspended</option>
                </select>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Project"
                  className="pl-10 pr-4 py-2 border border-sky rounded w-60 bg-white"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-sky-tint">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stratosphere uppercase tracking-wider">
                      Project
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stratosphere uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stratosphere uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-sky">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map(project => (
                      <tr 
                        key={project._id}
                        className="hover:bg-sky-tint cursor-pointer"
                        onClick={() => router.push(`/dashboard/project/${project._id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-sky-tint border border-sky rounded-md flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-stratosphere">{project.name}</div>
                              <div className="text-sm text-sky">
                                {project.description 
                                  ? project.description.length > 30 
                                    ? `${project.description.substring(0, 30)}...` 
                                    : project.description
                                  : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-sky">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-4">
                            <button 
                              className={`${project.isPinned ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`}
                              onClick={(e) => togglePinProject(project._id, e)}
                              title={project.isPinned ? "Unpin project" : "Pin project"}
                            >
                              <Pin size={18} />
                            </button>
                            <button 
                              className="text-gray-400 hover:text-red-500"
                              onClick={(e) => handleDeleteProject(project._id, e)}
                              title="Archive project"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sky">
                        No projects found. Create a new project to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProjectDashboard;