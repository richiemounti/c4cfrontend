// app/dashboard/project/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { getProject, updateProject, ProjectContact } from '@/lib/api/project';
import { Project } from '@/types';

interface PageParams {
  id: string;
}

const EditProjectPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: projectId } = params;
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'planning',
  });
  
  const [contacts, setContacts] = useState<ProjectContact[]>([
    { name: '', role: '', phone: '', email: '' }
  ]);

  // Fetch existing project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!authLoading && !isAuthenticated) {
        router.push('/account/login');
        return;
      }

      try {
        setFetchingData(true);
        const response = await getProject(projectId);
        const project = response.data;
        
        setProjectData(project);
        
        // Store the organization ID
        if (project.organization) {
          const orgId = typeof project.organization === 'object' 
            ? project.organization._id 
            : project.organization;
          setOrganizationId(orgId);
        }
        
        // Format dates for input fields
        const formatDate = (dateString: string | Date | undefined) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0]; // YYYY-MM-DD format
        };
        
        // Populate form with existing data
        setFormData({
          name: project.name || '',
          description: project.description || '',
          location: project.location || '',
          startDate: formatDate(project.startDate),
          endDate: formatDate(project.endDate),
          status: project.status || 'planning',
        });
        
        // Populate contacts if they exist
        if (project.contacts && project.contacts.length > 0) {
          setContacts(project.contacts);
        }
        
        setFetchingData(false);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project data',
          variant: 'destructive',
        });
        setFetchingData(false);
      }
    };

    fetchProjectData();
  }, [projectId, authLoading, isAuthenticated, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactChange = (index: number, field: keyof ProjectContact, value: string) => {
    const updatedContacts = [...contacts];
    updatedContacts[index] = {
      ...updatedContacts[index],
      [field]: value
    };
    setContacts(updatedContacts);
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', role: '', phone: '', email: '' }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      const updatedContacts = [...contacts];
      updatedContacts.splice(index, 1);
      setContacts(updatedContacts);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.location || !formData.startDate) {
      toast({
        title: 'Validation Error',
        description: 'Project name, description, location, and start date are required',
        variant: 'destructive',
      });
      return;
    }
    
    // Filter out empty contacts
    const filteredContacts = contacts.filter(contact => contact.name.trim() !== '');
    
    setLoading(true);
    
    try {
      await updateProject(projectId, {
        ...formData,
        contacts: filteredContacts.length > 0 ? filteredContacts : undefined,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      });
      
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
      
      // Navigate back to project details page
      router.push(`/dashboard/project/${projectId}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/project/${projectId}`);
  };

  if (fetchingData) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        {projectData && (
          <ProjectSidebar 
            projectId={projectData._id}
            projectName={projectData.name}
          />
        )}
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere mx-auto mb-4"></div>
            <p className="text-stratosphere font-medium">Loading project data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sky-tint">
      {/* Sidebar */}
      {projectData && (
        <ProjectSidebar 
          projectId={projectData._id}
          projectName={projectData.name}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-sky">
          <button 
            onClick={handleCancel}
            className="flex items-center text-sky hover:text-stratosphere"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Project
          </button>
          <h1 className="text-xl font-medium mt-4 text-stratosphere">Edit Project</h1>
        </div>

        <div className="max-w-3xl mx-auto p-8">
          <div className="bg-white rounded-lg border border-sky p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-stratosphere mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-stratosphere"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-stratosphere mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-stratosphere"
                  rows={4}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-stratosphere mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-stratosphere"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-stratosphere mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-sky/70 mb-2">
                    This must be aligned with your PDD
                  </p>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-stratosphere"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-stratosphere mb-1">
                    End Date
                  </label>
                  <p className="text-xs text-sky/70 mb-2">
                    Optional - leave blank if ongoing
                  </p>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-stratosphere"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="status" className="block text-sm font-medium text-stratosphere mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-stratosphere"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              
              {/* Contact Information */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-medium text-stratosphere">Contact Information</h3>
                  <button
                    type="button"
                    onClick={addContact}
                    className="flex items-center text-sm text-sky hover:text-stratosphere"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Contact
                  </button>
                </div>
                
                {contacts.map((contact, index) => (
                  <div key={index} className="border border-sky rounded-md p-4 mb-3 bg-sky-tint">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-stratosphere">Contact {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        className="text-sky hover:text-red-500"
                        disabled={contacts.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-sky mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-sm text-stratosphere bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-sky mb-1">
                          Role
                        </label>
                        <input
                          type="text"
                          value={contact.role || ''}
                          onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                          className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-sm text-stratosphere bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-sky mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={contact.phone || ''}
                          onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-sm text-stratosphere bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-sky mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={contact.email || ''}
                          onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-sm text-stratosphere bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6 gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-sky text-stratosphere rounded-md hover:bg-sky-tint"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-stratosphere rounded-md text-white hover:bg-stratosphere/90 flex items-center ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Updating...' : 'Update Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProjectPage;