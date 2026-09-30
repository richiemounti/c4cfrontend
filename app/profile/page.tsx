// app/profile/page.tsx
'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Shield, Building, Calendar, Edit, Save, X } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  
  // For a real implementation, you would have state for editable fields
  // and API calls to update the user profile
  const [formData, setFormData] = useState({
    name: user?.name || '',
    userName: user?.userName || '',
    email: user?.email || '',
  });

  const toggleEditMode = () => {
    if (isEditMode) {
      // Reset form data if canceling edit
      setFormData({
        name: user?.name || '',
        userName: user?.userName || '',
        email: user?.email || '',
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call an API to update the user profile
    console.log('Updating profile with:', formData);
    
    // For now, just exit edit mode
    setIsEditMode(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Header with user info */}
              <div className="bg-c4c-petrol text-white p-6">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <div className="h-24 w-24 rounded-full bg-white/30 flex items-center justify-center">
                      <User className="h-12 w-12" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{user?.name}</h1>
                    <p className="text-white/80">{user?.email}</p>
                    {user?.primaryRole && (
                      <div className="mt-2 inline-block bg-white/20 px-3 py-1 rounded-full text-sm">
                        {user.primaryRole}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Profile content */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-black">Profile Information</h2>
                  <button
                    onClick={toggleEditMode}
                    className="flex items-center text-c4c-petrol hover:text-black"
                  >
                    {isEditMode ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Profile
                      </>
                    )}
                  </button>
                </div>
                
                {isEditMode ? (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-c4c-petrol mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-c4c-rule rounded-md focus:outline-none focus:ring-2 focus:ring-c4c-petrol"
                        />
                      </div>

                      <div>
                        <label htmlFor="userName" className="block text-sm font-medium text-c4c-petrol mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          id="userName"
                          name="userName"
                          value={formData.userName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-c4c-rule rounded-md focus:outline-none focus:ring-2 focus:ring-c4c-petrol"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-c4c-petrol mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-c4c-rule rounded-md focus:outline-none focus:ring-2 focus:ring-c4c-petrol"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="flex items-center px-4 py-2 bg-c4c-coral text-black rounded-md hover:bg-c4c-petrol hover:text-white"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-c4c-petrol mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-c4c-petrol">Full Name</h3>
                        <p className="text-base text-black">{user?.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <User className="h-5 w-5 text-c4c-petrol mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-c4c-petrol">Username</h3>
                        <p className="text-base text-black">{user?.userName}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-c4c-petrol mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-c4c-petrol">Email</h3>
                        <p className="text-base text-black">{user?.email}</p>
                      </div>
                    </div>

                    {user?.primaryRole && (
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 text-c4c-petrol mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-c4c-petrol">Role</h3>
                          <p className="text-base text-black">{user.primaryRole}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Roles section */}
              {user?.roles && user.roles.length > 0 && (
                <div className="border-t border-c4c-rule p-6">
                  <h2 className="text-xl font-semibold text-black mb-4">Your Roles & Permissions</h2>

                  <div className="space-y-4">
                    {user.roles.map((role: any, index: number) => (
                      <div key={index} className="bg-c4c-grey-bg p-4 rounded-md">
                        <div className="flex items-center mb-2">
                          <Shield className="h-5 w-5 text-c4c-petrol mr-2" />
                          <h3 className="font-medium text-black">{role.role}</h3>
                        </div>

                        {role.organization && (
                          <div className="flex items-center text-sm text-c4c-petrol ml-7">
                            <Building className="h-4 w-4 mr-1" />
                            <span>Organization: {role.organization}</span>
                          </div>
                        )}

                        {role.projects && role.projects.length > 0 && (
                          <div className="mt-2 ml-7">
                            <p className="text-sm text-c4c-petrol mb-1">Projects:</p>
                            <div className="flex flex-wrap gap-2">
                              {role.projects.map((project: string, idx: number) => (
                                <span key={idx} className="inline-block bg-c4c-rule px-2 py-1 rounded text-xs">
                                  {project}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;