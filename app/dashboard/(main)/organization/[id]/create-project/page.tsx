// app/dashboard/organization/[id]/create-project/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { createProject, ProjectContact } from '@/lib/api/project';

interface PageParams {
  id: string;
}

const CreateProjectPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { id: organizationId } = params;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    status: 'planning',
  });
  
  const [contacts, setContacts] = useState<ProjectContact[]>([
    { name: '', role: '', phone: '', email: '' }
  ]);

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
      await createProject({
        ...formData,
        contacts: filteredContacts.length > 0 ? filteredContacts : undefined,
        startDate: new Date(formData.startDate),
        organization: organizationId,
      });
      
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      
      // Navigate back to organization details
      router.push(`/dashboard/organization/${organizationId}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="bg-sky-tint px-8 py-6 border-b border-sky">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-sky hover:text-stratosphere"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Organization
          </button>
          <h1 className="text-xl font-medium mt-4 text-stratosphere">Create New Project</h1>
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
                  className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere"
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
                  className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere"
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
                  className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-stratosphere mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
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
                <label htmlFor="status" className="block text-sm font-medium text-stratosphere mb-1">
                  Status
                </label>
                {/* Add matching spacing to align with start date field */}
                <div className="h-5 mb-2"></div>
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
                  <option value="suspended">Suspended</option>
                </select>
              </div>
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
                          className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-sm"
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
                          className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-sm"
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
                          className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-sm"
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
                          className="w-full px-3 py-2 border border-sky rounded-md focus:outline-none focus:ring-2 focus:ring-stratosphere text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-ochre bg-ochre text-white rounded-md mr-2 hover:bg-ochre-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-stratosphere rounded-md text-white hover:bg-stratosphere-900 flex items-center ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
    </div>
  );
};

export default CreateProjectPage;