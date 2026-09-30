// /dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Building, 
  Shield, 
  Bell, 
  Eye, 
  Lock, 
  Globe, 
  Download, 
  Trash2, 
  Save, 
  ArrowLeft,
  Settings,
  Key,
  Database,
  AlertTriangle,
  CheckCircle,
  Camera,
  Edit3,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Profile settings state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    userName: ''
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    surveyUpdates: true,
    projectAlerts: true,
    systemUpdates: false,
    weeklyDigest: true,
    marketingEmails: false
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'organization',
    dataSharing: false,
    analyticsOptOut: false,
    twoFactorAuth: false
  });

  // Security settings state
  const [securityData, setSecurityData] = useState({
    lastLogin: '',
    activeSessions: 1,
    loginAttempts: 0
  });

  // Initialize data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        userName: user.userName || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    setMessage({ type: 'success', text: 'Data export initiated. You will receive an email when ready.' });
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setMessage({ type: 'error', text: 'Account deletion is not available in this demo version.' });
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-c4c-petrol" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-c4c-grey-bg">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-c4c-burgundy mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-black mb-2">Access Denied</h1>
          <p className="text-c4c-petrol mb-4">You must be logged in to access settings.</p>
          <Link
            href="/account/login"
            className="px-6 py-3 bg-c4c-coral text-black rounded-md hover:bg-c4c-petrol hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'data', label: 'Data Management', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-c4c-grey-bg">
      {/* Header */}
      <div className="bg-white border-b border-c4c-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-c4c-petrol hover:text-black transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Settings className="h-6 w-6 text-black mr-3" />
              <div>
                <h1 className="text-2xl font-semibold text-black">Settings</h1>
                <p className="text-sm text-c4c-petrol">Manage your account and preferences</p>
              </div>
            </div>
            <Link href="/" style={{ flexShrink: 0, display: 'flex' }}>
              <Image
                src="/logos/Primary logo_black.png"
                alt="Citizens for Change"
                width={130}
                height={56}
                style={{ height: 36, width: 'auto' }}
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-c4c-rule p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-c4c-grey-bg text-c4c-petrol border border-c4c-petrol'
                          : 'text-c4c-petrol hover:bg-c4c-grey-bg hover:text-black'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-c4c-rule">
              {/* Messages */}
              {message && (
                <div className={`mx-6 mt-6 p-4 rounded-md flex items-center ${
                  message.type === 'success'
                    ? 'bg-c4c-tint-sage text-black border border-c4c-sage'
                    : 'bg-c4c-tint-coral text-black border border-c4c-pink'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                  )}
                  {message.text}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-black mb-2">Profile Information</h2>
                    <p className="text-c4c-petrol">Update your personal information and preferences.</p>
                  </div>

                  {/* Profile Picture */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-black mb-3">Profile Picture</label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-c4c-grey-bg rounded-full flex items-center justify-center">
                        <User className="h-10 w-10 text-c4c-petrol" />
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-c4c-petrol text-white rounded-md hover:bg-black transition-colors text-sm flex items-center">
                          <Camera className="h-4 w-4 mr-2" />
                          Upload Photo
                        </button>
                        <p className="text-xs text-c4c-petrol mt-1">JPG, PNG up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-c4c-rule rounded-md focus:outline-none focus:ring-2 focus:ring-c4c-cobalt focus:border-c4c-cobalt"
                      />
                    </div>

                    <div>
                      <label htmlFor="userName" className="block text-sm font-medium text-black mb-2">
                        Username *
                      </label>
                      <input
                        id="userName"
                        name="userName"
                        type="text"
                        value={profileData.userName}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-c4c-rule rounded-md focus:outline-none focus:ring-2 focus:ring-c4c-cobalt focus:border-c4c-cobalt"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-c4c-rule rounded-md focus:outline-none focus:ring-2 focus:ring-c4c-cobalt focus:border-c4c-cobalt bg-c4c-grey-bg"
                        readOnly
                      />
                      <p className="text-xs text-c4c-petrol mt-1">Contact support to change your email</p>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-black mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-c4c-rule rounded-md focus:outline-none focus:ring-2 focus:ring-c4c-cobalt focus:border-c4c-cobalt"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-black mb-2">
                        Position/Title
                      </label>
                      <input
                        id="position"
                        name="position"
                        type="text"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-c4c-rule rounded-md focus:outline-none focus:ring-2 focus:ring-c4c-cobalt focus:border-c4c-cobalt"
                        placeholder="Data Analyst"
                      />
                    </div>

                    <div>
                      <label htmlFor="organization" className="block text-sm font-medium text-black mb-2">
                        Organization
                      </label>
                      <input
                        id="organization"
                        name="organization"
                        type="text"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-c4c-rule rounded-md focus:outline-none focus:ring-2 focus:ring-c4c-cobalt focus:border-c4c-cobalt"
                        placeholder="Your Organization"
                      />
                    </div>

                    
                  </div>

                  
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-black mb-2">Security Settings</h2>
                    <p className="text-c4c-petrol">Manage your account security and access.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Password Section */}
                    <div className="bg-c4c-grey-bg border border-c4c-rule rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Lock className="h-5 w-5 text-black mr-3" />
                          <div>
                            <h3 className="font-medium text-black">Password</h3>
                            <p className="text-sm text-c4c-petrol">Last changed 3 months ago</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-c4c-coral text-black rounded-md hover:bg-c4c-petrol hover:text-white transition-colors text-sm">
                          Change Password
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-c4c-grey-bg border border-c4c-rule rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Key className="h-5 w-5 text-black mr-3" />
                          <div>
                            <h3 className="font-medium text-black">Two-Factor Authentication</h3>
                            <p className="text-sm text-c4c-petrol">
                              {privacySettings.twoFactorAuth ? 'Enabled' : 'Add an extra layer of security'}
                            </p>
                          </div>
                        </div>
                        <button className={`px-4 py-2 rounded-md transition-colors text-sm ${
                          privacySettings.twoFactorAuth
                            ? 'bg-c4c-burgundy text-white hover:bg-c4c-petrol'
                            : 'bg-c4c-sage text-white hover:bg-c4c-petrol'
                        }`}>
                          {privacySettings.twoFactorAuth ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="bg-c4c-grey-bg border border-c4c-rule rounded-lg p-4">
                      <h3 className="font-medium text-black mb-3">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-white p-3 rounded border border-c4c-rule">
                          <div>
                            <p className="font-medium text-black">Current Session</p>
                            <p className="text-sm text-c4c-petrol">Chrome on macOS • Nairobi, Kenya</p>
                            <p className="text-xs text-c4c-petrol">Last activity: Just now</p>
                          </div>
                          <span className="px-2 py-1 bg-c4c-tint-sage text-black text-xs rounded">Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Login History */}
                    <div className="bg-c4c-grey-bg border border-c4c-rule rounded-lg p-4">
                      <h3 className="font-medium text-black mb-3">Recent Login Activity</h3>
                      <div className="space-y-2">
                        {[
                          { location: 'Nairobi, Kenya', time: '2 hours ago', success: true },
                          { location: 'Nairobi, Kenya', time: '1 day ago', success: true },
                          { location: 'London, UK', time: '3 days ago', success: false }
                        ].map((login, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-c4c-rule last:border-b-0">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                login.success ? 'bg-c4c-sage' : 'bg-c4c-burgundy'
                              }`} />
                              <div>
                                <p className="text-sm text-black">{login.location}</p>
                                <p className="text-xs text-c4c-petrol">{login.time}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              login.success
                                ? 'bg-c4c-tint-sage text-black'
                                : 'bg-c4c-tint-coral text-black'
                            }`}>
                              {login.success ? 'Success' : 'Failed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-black mb-2">Notification Preferences</h2>
                    <p className="text-c4c-petrol">Choose what notifications you want to receive.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="font-medium text-black mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'emailNotifications', label: 'All Email Notifications', description: 'Receive all notifications via email' },
                          { key: 'surveyUpdates', label: 'Survey Updates', description: 'Notifications about survey responses and completions' },
                          { key: 'projectAlerts', label: 'Project Alerts', description: 'Important updates about your projects' },
                          { key: 'systemUpdates', label: 'System Updates', description: 'Platform maintenance and feature announcements' },
                          { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of your platform activity' },
                          { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates and educational content' }
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between py-3 border-b border-c4c-rule last:border-b-0">
                            <div>
                              <label htmlFor={setting.key} className="font-medium text-black cursor-pointer">
                                {setting.label}
                              </label>
                              <p className="text-sm text-c4c-petrol">{setting.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                id={setting.key}
                                name={setting.key}
                                type="checkbox"
                                checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                                onChange={handleNotificationChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-c4c-rule peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-c4c-tint-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-c4c-petrol"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-black mb-2">Privacy Settings</h2>
                    <p className="text-c4c-petrol">Control how your data is used and shared.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Profile Visibility */}
                    <div className="bg-c4c-grey-bg border border-c4c-rule rounded-lg p-4">
                      <h3 className="font-medium text-black mb-3">Profile Visibility</h3>
                      <select
                        name="profileVisibility"
                        value={privacySettings.profileVisibility}
                        onChange={handlePrivacyChange}
                        className="w-full px-3 py-2 border border-c4c-rule rounded-md focus:outline-none focus:ring-2 focus:ring-c4c-cobalt focus:border-c4c-cobalt"
                      >
                        <option value="public">Public - Visible to everyone</option>
                        <option value="organization">Organization - Visible to organization members only</option>
                        <option value="private">Private - Only visible to you</option>
                      </select>
                    </div>

                    {/* Data Sharing */}
                    <div className="space-y-4">
                      {[
                        { key: 'dataSharing', label: 'Data Sharing', description: 'Allow anonymized data to be used for research and platform improvement' },
                        { key: 'analyticsOptOut', label: 'Analytics Opt-out', description: 'Opt out of usage analytics and tracking' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-3 border-b border-c4c-rule last:border-b-0">
                          <div>
                            <label htmlFor={setting.key} className="font-medium text-black cursor-pointer">
                              {setting.label}
                            </label>
                            <p className="text-sm text-c4c-petrol">{setting.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              id={setting.key}
                              name={setting.key}
                              type="checkbox"
                            //   checked={privacySettings[setting.key as keyof typeof privacySettings]}
                              onChange={handlePrivacyChange}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-c4c-rule peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-c4c-tint-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-c4c-petrol"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* GDPR Compliance */}
                    <div className="bg-c4c-tint-cyan border border-c4c-rule rounded-lg p-4">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-c4c-petrol mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-black mb-1">GDPR Compliance</h4>
                          <p className="text-sm text-black">
                            As part of our GDPR compliance, you have the right to access, rectify, or delete your personal data.
                            You can also request data portability and object to data processing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Management Tab */}
              {activeTab === 'data' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-black mb-2">Data Management</h2>
                    <p className="text-c4c-petrol">Export or delete your data from the platform.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Data Export */}
                    <div className="bg-c4c-grey-bg border border-c4c-rule rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Download className="h-5 w-5 text-black mr-3" />
                          <div>
                            <h3 className="font-medium text-black">Export Your Data</h3>
                            <p className="text-sm text-c4c-petrol">Download a copy of all your data including surveys, responses, and projects</p>
                          </div>
                        </div>
                        <button
                          onClick={handleExportData}
                          className="px-4 py-2 bg-c4c-petrol text-white rounded-md hover:bg-black transition-colors text-sm flex items-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </button>
                      </div>
                      <div className="mt-3 text-xs text-c4c-petrol">
                        <p>Export includes: Profile information, survey responses, project data, and activity logs.</p>
                        <p>Data will be provided in JSON format via email within 24 hours.</p>
                      </div>
                    </div>

                    {/* Data Retention */}
                    <div className="bg-c4c-grey-bg border border-c4c-rule rounded-lg p-4">
                      <h3 className="font-medium text-black mb-3">Data Retention Policy</h3>
                      <div className="space-y-3 text-sm text-black">
                        <div className="flex justify-between">
                          <span>Survey responses:</span>
                          <span className="font-medium">7 years (compliance requirement)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Project data:</span>
                          <span className="font-medium">5 years after project completion</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Account information:</span>
                          <span className="font-medium">30 days after account deletion</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Activity logs:</span>
                          <span className="font-medium">2 years</span>
                        </div>
                      </div>
                    </div>

                    {/* Storage Usage */}
                    <div className="bg-c4c-grey-bg border border-c4c-rule rounded-lg p-4">
                      <h3 className="font-medium text-black mb-3">Storage Usage</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-black">Used</span>
                          <span className="text-sm font-medium text-black">2.4 GB of 5 GB</span>
                        </div>
                        <div className="w-full bg-c4c-rule rounded-full h-2">
                          <div className="bg-c4c-petrol h-2 rounded-full" style={{ width: '48%' }}></div>
                        </div>
                        <div className="text-xs text-c4c-petrol">
                          <p>• Survey data: 1.2 GB</p>
                          <p>• File uploads: 0.8 GB</p>
                          <p>• Reports & exports: 0.4 GB</p>
                        </div>
                      </div>
                    </div>

                    {/* Account Deletion */}
                    <div className="bg-c4c-tint-coral border border-c4c-pink rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Trash2 className="h-5 w-5 text-c4c-burgundy mr-3" />
                          <div>
                            <h3 className="font-medium text-c4c-burgundy">Delete Account</h3>
                            <p className="text-sm text-c4c-burgundy">Permanently delete your account and all associated data</p>
                          </div>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          className="px-4 py-2 bg-c4c-burgundy text-white rounded-md hover:bg-c4c-petrol transition-colors text-sm flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </button>
                      </div>
                      <div className="mt-3 text-xs text-c4c-burgundy">
                        <p><strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.</p>
                        <p>Survey responses may be retained for compliance purposes even after account deletion.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {(activeTab === 'profile' || activeTab === 'notifications' || activeTab === 'privacy') && (
                <div className="border-t border-c4c-rule px-6 py-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-c4c-petrol">
                      Changes are saved automatically. Last saved: Just now
                    </p>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2 bg-c4c-coral text-black rounded-md hover:bg-c4c-petrol hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-c4c-coral disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;