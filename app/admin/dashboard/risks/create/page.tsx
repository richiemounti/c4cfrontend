// app/admin/dashboard/risks/create/page.tsx - Fixed with proper types

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  AlertTriangle,
  Save,
  X,
  Calendar,
  User,
  Building2,
  FolderOpen,
  MapPin,
  Info
} from 'lucide-react';

// Import API functions
import { createRiskItem } from '@/lib/api/riskManagement';
import { getProject } from '@/lib/api/project';
import { getProjectSite } from '@/lib/api/project';
import { getOrganization } from '@/lib/api/organization';
import { getUsers } from '@/lib/api/user';

// Define types locally to avoid import issues
interface Project {
  _id: string;
  name: string;
  description?: string;
  status?: string; // Make status optional as well
  organization: any; // Can be string or object
}

interface ProjectSite {
  _id: string;
  name: string;
  status?: string; // Make status optional to match the API response
}

interface Organization {
  _id: string;
  name: string;
  country: string;
  city: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
}

interface CreateRiskFormData {
  name: string;
  riskType: string;
  riskDescription: string;
  probability: string;
  consequences: string;
  owner: string;
  mitigationStrategy: string;
  category: string;
  impactArea: string[];
  reviewDate: string;
  notes: string;
}

const riskTypes = [
  { value: 'operational', label: 'Operational' },
  { value: 'financial', label: 'Financial' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'social', label: 'Social' },
  { value: 'technical', label: 'Technical' },
  { value: 'reputational', label: 'Reputational' },
  { value: 'political', label: 'Political' },
  { value: 'market', label: 'Market' },
  { value: 'legal', label: 'Legal' }
];

const probabilityLevels = [
  { value: 'very_low', label: 'Very Low (1)', description: 'Highly unlikely to occur' },
  { value: 'low', label: 'Low (2)', description: 'Unlikely to occur' },
  { value: 'medium', label: 'Medium (3)', description: 'Possible to occur' },
  { value: 'high', label: 'High (4)', description: 'Likely to occur' },
  { value: 'very_high', label: 'Very High (5)', description: 'Almost certain to occur' }
];

const consequenceLevels = [
  { value: 'negligible', label: 'Negligible (1)', description: 'Minimal impact' },
  { value: 'minor', label: 'Minor (2)', description: 'Small impact' },
  { value: 'moderate', label: 'Moderate (3)', description: 'Moderate impact' },
  { value: 'major', label: 'Major (4)', description: 'Significant impact' },
  { value: 'catastrophic', label: 'Catastrophic (5)', description: 'Severe impact' }
];

const categories = [
  { value: 'current', label: 'Current Risk' },
  { value: 'inherent', label: 'Inherent Risk' },
  { value: 'residual', label: 'Residual Risk' }
];

const impactAreas = [
  { value: 'timeline', label: 'Timeline' },
  { value: 'budget', label: 'Budget' },
  { value: 'scope', label: 'Scope' },
  { value: 'quality', label: 'Quality' },
  { value: 'stakeholders', label: 'Stakeholders' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'reputation', label: 'Reputation' }
];

function CreateRiskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const projectSiteId = searchParams.get('projectSiteId');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contextLoading, setContextLoading] = useState(true);
  
  // Context data
  const [project, setProject] = useState<Project | null>(null);
  const [projectSite, setProjectSite] = useState<ProjectSite | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [formData, setFormData] = useState<CreateRiskFormData>({
    name: '',
    riskType: '',
    riskDescription: '',
    probability: '',
    consequences: '',
    owner: '',
    mitigationStrategy: '',
    category: 'current',
    impactArea: [],
    reviewDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchContextData = async () => {
      if (!projectId) {
        router.push('/admin/dashboard');
        return;
      }

      try {
        setContextLoading(true);
        
        // Fetch project data first
        const projectRes = await getProject(projectId);
        setProject(projectRes.data);
        
        // Extract organization ID from project and fetch organization data
        if (projectRes.data.organization) {
          let organizationId: string;
          
          const orgData = projectRes.data.organization;
          
          if (typeof orgData === 'string') {
            // If it's already a string (ObjectId as string)
            organizationId = orgData;
          } else if (orgData && typeof orgData === 'object' && '_id' in orgData) {
            // If it's an organization object with _id
            organizationId = (orgData as any)._id;
          } else {
            // Fallback: convert whatever it is to string
            organizationId = String(orgData);
          }
            
          const orgRes = await getOrganization(organizationId);
          setOrganization(orgRes.data);
        }
        
        // Fetch project site data if provided
        if (projectSiteId) {
          const siteRes = await getProjectSite(projectSiteId);
          setProjectSite(siteRes.data);
        }
        
      } catch (error) {
        console.error('Error fetching context data:', error);
        alert('Failed to load project information. Please try again.');
      } finally {
        setContextLoading(false);
      }
    };

    fetchContextData();
  }, [projectId, projectSiteId, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await getUsers(); 
        const usersData = await response;
        setUsers(usersData.data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const calculateRiskScore = (probability: string, consequences: string): string => {
    const probabilityValues: Record<string, number> = {
      'very_low': 1, 'low': 2, 'medium': 3, 'high': 4, 'very_high': 5
    };
    
    const consequenceValues: Record<string, number> = {
      'negligible': 1, 'minor': 2, 'moderate': 3, 'major': 4, 'catastrophic': 5
    };
    
    const probValue = probabilityValues[probability] || 0;
    const consValue = consequenceValues[consequences] || 0;
    const score = probValue * consValue;
    
    if (score <= 6) return 'low';
    if (score <= 15) return 'medium';
    return 'high';
  };

  const getRiskScoreColor = (score: string) => {
    switch (score) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const currentRiskScore = formData.probability && formData.consequences 
    ? calculateRiskScore(formData.probability, formData.consequences)
    : null;

  const handleInputChange = (field: keyof CreateRiskFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImpactAreaChange = (area: string, checked: boolean) => {
    const newImpactAreas = checked 
      ? [...formData.impactArea, area]
      : formData.impactArea.filter(a => a !== area);
    
    handleInputChange('impactArea', newImpactAreas);
  };

  const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.name.trim()) newErrors.name = 'Risk name is required';
  if (!formData.riskType) newErrors.riskType = 'Risk type is required';
  if (!formData.riskDescription.trim()) newErrors.riskDescription = 'Risk description is required';
  if (!formData.probability) newErrors.probability = 'Probability is required';
  if (!formData.consequences) newErrors.consequences = 'Consequences are required';
  if (!formData.owner.trim()) newErrors.owner = 'Risk owner is required';
  if (!formData.mitigationStrategy.trim()) newErrors.mitigationStrategy = 'Mitigation strategy is required';
  if (!formData.reviewDate) newErrors.reviewDate = 'Review date is required'; // ✅ ADD THIS

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!organization) {
      alert('Organization information is required');
      return;
    }

    try {
      setSaving(true);
      
      const riskData = {
      projectId: projectId!,
      projectSiteId: projectSiteId || undefined,
      organizationId: organization._id,
      name: formData.name.trim(),
      riskType: formData.riskType,
      riskDescription: formData.riskDescription.trim(),
      probability: formData.probability,
      consequences: formData.consequences,
      owner: formData.owner.trim(),
      mitigationStrategy: formData.mitigationStrategy.trim(),
      category: formData.category,
      impactArea: formData.impactArea,
      reviewDate: formData.reviewDate, // ✅ No undefined here - validated above
      notes: formData.notes.trim() || undefined
};

      await createRiskItem(riskData);
      
      // Redirect back to the appropriate page
      if (projectSiteId) {
        router.push(`/admin/dashboard/project-site/${projectSiteId}?tab=risks`);
      } else {
        router.push(`/admin/dashboard/project/${projectId}?tab=risks`);
      }
      
    } catch (error) {
      console.error('Error creating risk:', error);
      alert('Failed to create risk. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (contextLoading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Project Not Found</h1>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Risk Item</h1>
            <p className="text-gray-600">Add a new risk to the risk register</p>
          </div>
        </div>
      </div>

      {/* Context Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Context Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">{organization?.name}</p>
              <p className="text-xs text-gray-500">Organization</p>
            </div>
          </div>
          <div className="flex items-center">
            <FolderOpen className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">{project?.name}</p>
              <p className="text-xs text-gray-500">Project</p>
            </div>
          </div>
          {projectSite && (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">{projectSite.name}</p>
                <p className="text-xs text-gray-500">Project Site</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Risk Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Risk Identification</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Name *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter a clear, concise name for the risk"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Risk Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Type *
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.riskType ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.riskType}
                onChange={(e) => handleInputChange('riskType', e.target.value)}
              >
                <option value="">Select risk type</option>
                {riskTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.riskType && <p className="text-red-600 text-sm mt-1">{errors.riskType}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Category
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            {/* Risk Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Description *
              </label>
              <textarea
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.riskDescription ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.riskDescription}
                onChange={(e) => handleInputChange('riskDescription', e.target.value)}
                placeholder="Describe the risk in detail, including potential causes and triggers"
              />
              {errors.riskDescription && <p className="text-red-600 text-sm mt-1">{errors.riskDescription}</p>}
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Risk Assessment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Probability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Probability *
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.probability ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.probability}
                onChange={(e) => handleInputChange('probability', e.target.value)}
              >
                <option value="">Select probability</option>
                {probabilityLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
              {errors.probability && <p className="text-red-600 text-sm mt-1">{errors.probability}</p>}
            </div>

            {/* Consequences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consequences *
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.consequences ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.consequences}
                onChange={(e) => handleInputChange('consequences', e.target.value)}
              >
                <option value="">Select consequences</option>
                {consequenceLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
              {errors.consequences && <p className="text-red-600 text-sm mt-1">{errors.consequences}</p>}
            </div>
          </div>

          {/* Risk Score Display */}
          {currentRiskScore && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-700 mr-2">Calculated Risk Score:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskScoreColor(currentRiskScore)}`}>
                  {currentRiskScore.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Impact Areas */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Impact Areas
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {impactAreas.map(area => (
                <label key={area.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.impactArea.includes(area.value)}
                    onChange={(e) => handleImpactAreaChange(area.value, e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{area.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Risk Management</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Owner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Owner *
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.owner ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.owner}
                onChange={(e) => handleInputChange('owner', e.target.value)}
                disabled={loadingUsers}
              >
                <option value="">Select risk owner</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {loadingUsers && <p className="text-gray-500 text-sm mt-1">Loading users...</p>}
              {errors.owner && <p className="text-red-600 text-sm mt-1">{errors.owner}</p>}
            </div>

            {/* Review Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Review Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.reviewDate}
                  onChange={(e) => handleInputChange('reviewDate', e.target.value)}
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            

            {/* Mitigation Strategy */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mitigation Strategy *
              </label>
              <textarea
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.mitigationStrategy ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.mitigationStrategy}
                onChange={(e) => handleInputChange('mitigationStrategy', e.target.value)}
                placeholder="Describe the strategy for mitigating or managing this risk"
              />
              {errors.mitigationStrategy && <p className="text-red-600 text-sm mt-1">{errors.mitigationStrategy}</p>}
            </div>

            {/* Additional Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information or context about this risk"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
            disabled={saving}
          >
            <X className="h-4 w-4 mr-2 inline" />
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 inline border-2 border-white border-t-transparent rounded-full"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2 inline" />
                Create Risk
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateRiskPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <CreateRiskContent />
    </Suspense>
  );
}