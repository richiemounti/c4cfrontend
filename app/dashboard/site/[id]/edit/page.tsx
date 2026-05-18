// app/dashboard/site/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { getProject, getProjectSite, updateProjectSite, ProjectContact } from '@/lib/api/project';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { Project, ProjectSite } from '@/types';
import InstructionalPanel from '@/components/InstructionalPanel';

interface PageParams {
  id: string;
}

const EditSitePage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: siteId } = params;
  
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [site, setSite] = useState<ProjectSite | any>(null);
  const [project, setProject] = useState<Project | any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    region: '',
    city: '',
    country: '',
    size: '',
    sizeUnit: 'hectares',
    siteType: 'forest',
    status: 'active',
    notes: '',
    startDate: '',
  });
  
  const [contacts, setContacts] = useState<ProjectContact[]>([
    { name: '', role: '', phone: '', email: '' }
  ]);

  // Fetch site data and populate form
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch site details
        const siteResponse = await getProjectSite(siteId);
        const siteData = siteResponse.data;
        setSite(siteData);
        
        // Fetch project details
        const projectId = typeof siteData.project === 'object' 
          ? siteData.project._id 
          : siteData.project;
        const projectResponse = await getProject(projectId);
        setProject(projectResponse.data);
        
        // Populate form with existing site data
        setFormData({
          name: siteData.name || '',
          description: siteData.description || '',
          address: siteData.address || '',
          region: siteData.region || '',
          city: siteData.city || '',
          country: siteData.country || '',
          size: siteData.size ? siteData.size.toString() : '',
          sizeUnit: siteData.sizeUnit || 'hectares',
          siteType: siteData.siteType || 'forest',
          status: siteData.status || 'active',
          notes: siteData.notes || '',
          startDate: siteData.startDate ? new Date(siteData.startDate).toISOString().split('T')[0] : '',
        });
        
        // Populate contacts or use default empty contact
        if (siteData.contacts && siteData.contacts.length > 0) {
          setContacts(siteData.contacts);
        }
        
        setIsLoadingData(false);
      } catch (error) {
        console.error('Error fetching site data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load site data',
          variant: 'destructive',
        });
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [siteId, authLoading, isAuthenticated, router, toast]);

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
    
    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Site name is required',
        variant: 'destructive',
      });
      return;
    }
    
    // Filter out empty contacts
    const filteredContacts = contacts.filter(contact => contact.name.trim() !== '');
    
    setLoading(true);
    
    try {
      // Convert numeric fields from string to number
      const sizeValue = formData.size ? parseFloat(formData.size) : undefined;
      
      // Cast the form fields to their expected types
      const data = {
        ...formData,
        size: sizeValue,
        sizeUnit: formData.sizeUnit as 'hectares' | 'sqkm' | 'acres' | 'sqmi',
        siteType: formData.siteType as 'forest' | 'wetland' | 'grassland' | 'coastal' | 'agricultural' | 'urban' | 'other',
        status: formData.status as 'active' | 'inactive' | 'planned',
        contacts: filteredContacts.length > 0 ? filteredContacts : undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      };
      
      await updateProjectSite(siteId, data);
      
      toast({
        title: 'Success',
        description: 'Site updated successfully',
      });
      
      // Navigate back to site details
      router.push(`/dashboard/site/${siteId}`);
    } catch (error) {
      console.error('Error updating site:', error);
      toast({
        title: 'Error',
        description: 'Failed to update site',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/site/${siteId}`);
  };

  // Show loading spinner while data is being fetched
  if (isLoadingData || !site || !project) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ProjectSidebar 
        projectId={project._id}
        projectName={project.name}
      />
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 shadow-sm">
          <button 
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Site Details
          </button>
          <h1 className="text-xl font-medium mt-4">Edit Site</h1>
          <p className="text-sm text-gray-600 mt-2">
            {site.name}
          </p>
        </div>

        <div className="max-w-3xl mx-auto p-8">
          <div className='py-8'>
            {/* Help & Resources */}
            <InstructionalPanel
              title="Update Site Information"
              texts={[
                {
                  content: "Modify any site details as needed. All fields are optional except the site name.",
                  type: "info"
                },
                {
                  content: "Changes will be saved immediately when you click 'Update Site'.",
                  type: "tip"
                }
              ]}
              variant="default"
            />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <input
                    type="number"
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label htmlFor="sizeUnit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    id="sizeUnit"
                    name="sizeUnit"
                    value={formData.sizeUnit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hectares">Hectares</option>
                    <option value="sqkm">Square Kilometers</option>
                    <option value="acres">Acres</option>
                    <option value="sqmi">Square Miles</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="siteType" className="block text-sm font-medium text-gray-700 mb-1">
                    Site Type
                  </label>
                  <select
                    id="siteType"
                    name="siteType"
                    value={formData.siteType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="forest">Forest</option>
                    <option value="wetland">Wetland</option>
                    <option value="grassland">Grassland</option>
                    <option value="coastal">Coastal</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="urban">Urban</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              {/* Contact Information */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-medium text-gray-700">Site Contacts</h3>
                  <button
                    type="button"
                    onClick={addContact}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Contact
                  </button>
                </div>
                
                {contacts.map((contact, index) => (
                  <div key={index} className="border rounded-md p-4 mb-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Contact {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        className="text-gray-400 hover:text-red-500"
                        disabled={contacts.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Role
                        </label>
                        <input
                          type="text"
                          value={contact.role || ''}
                          onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={contact.phone || ''}
                          onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={contact.email || ''}
                          onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 flex items-center ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : 'Update Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSitePage;