// components/stakeholders/StakeholderGroupForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { fetchCategories } from '@/lib/api/category';
import { Category, INCLUSION_OPTIONS } from "@/types/taxonomy";
import InstructionalPanel from '@/components/InstructionalPanel';

interface StakeholderGroupFormProps {
  projectId: string;
  siteId?: string;
  groupId?: string; // For edit mode
  context: 'project' | 'site';
  mode: 'create' | 'edit';
  siteName?: string; // For display in site context
  onBack: () => void;
  onSuccess: () => void;
}

const StakeholderGroupForm = ({
  projectId,
  siteId,
  groupId,
  context,
  mode,
  siteName,
  onBack,
  onSuccess
}: StakeholderGroupFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [stakeholderName, setStakeholderName] = useState('');
  const [stakeholderDescription, setStakeholderDescription] = useState('');
  const [selectedInclusion, setSelectedInclusion] = useState<string[]>([]);
  const [estimatedPopulation, setEstimatedPopulation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingCategory, setExistingCategory] = useState<Category | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load categories
        const categoriesResponse = await fetchCategories();
        setCategories(categoriesResponse.data);
        
        // If in edit mode, load existing stakeholder group data
        if (mode === 'edit' && groupId) {
          const groupResponse = await stakeholderMappingApi.getStakeholderGroup(groupId);
          const group = groupResponse.data.data;
          
          // Set form values
          setStakeholderName(group.name);
          setStakeholderDescription(group.description || '');
          setEstimatedPopulation(group.estimatedPopulation?.toString() || '');
          
          // Set the existing category (read-only in edit mode)
          if (typeof group.category === 'object') {
            setExistingCategory(group.category);
          } else {
            // If category is just an ID, find it in the categories list
            const cat = categoriesResponse.data.find((c: Category) => c._id === group.category);
            if (cat) setExistingCategory(cat);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    
    loadData();
  }, [mode, groupId, toast]);

  const handleSelectCategory = (category: Category) => {
    // Only allow in create mode
    if (mode === 'create' && !selectedCategories.some(c => c._id === category._id)) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    // Only allow in create mode
    if (mode === 'create') {
      setSelectedCategories(selectedCategories.filter(c => c._id !== categoryId));
    }
  };

  const handleInclusionToggle = (option: string) => {
    setSelectedInclusion(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleSave = async () => {
    if (!stakeholderName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a stakeholder name',
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'create' && selectedCategories.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one category',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      // Parse population if provided
      const populationValue = estimatedPopulation.trim() 
        ? parseInt(estimatedPopulation, 10) 
        : undefined;
      
      if (mode === 'edit' && groupId) {
        // Edit existing stakeholder group
        await stakeholderMappingApi.updateStakeholderGroup(groupId, {
          name: stakeholderName.trim(),
          description: stakeholderDescription.trim() || undefined,
          estimatedPopulation: populationValue,
        });
        
        toast({
          title: 'Success',
          description: 'Stakeholder group updated successfully',
        });
      } else {
        // Create new stakeholder group(s)
        for (const category of selectedCategories) {
          await stakeholderMappingApi.createStakeholderGroup({
            projectId,
            projectSiteId: siteId,
            categoryId: category._id,
            name: stakeholderName,
            description: stakeholderDescription || undefined,
            estimatedPopulation: populationValue,
          });
        }
        
        toast({
          title: 'Success',
          description: 'Stakeholder group(s) created successfully',
        });
      }
      
      // Call success callback
      onSuccess();
    } catch (error: any) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} stakeholder group:`, error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} stakeholder group`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {mode === 'create' && (
        <div className='py-8'>
          <InstructionalPanel
            title={`Start by brainstorming and identifying all the different stakeholders affected by ${context === 'site' ? 'this site' : 'the project'}`}
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
                content: "Identify your stakeholder category and name it, press save. If you have more stakeholders to add press add stakeholder and repeat the process.",
                type: "tip"
              },
              {
                content: "If you have questions check out the knowledge base.",
                type: "tip"
              }
            ]}
            variant="default"
          />
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-600 mb-6">
          {mode === 'edit' 
            ? `Edit stakeholder group details`
            : `Start by choosing one stakeholder category that is affected by ${context === 'site' ? 'this site' : 'the project'}`
          }
        </p>
        
        {/* Category Selection/Display */}
        {mode === 'create' ? (
          <>
            {/* Category Dropdown - Create Mode */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Select Category
              </label>
              <select
                id="category"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-stratosphere-500 focus:ring-stratosphere-500 text-stratosphere-500 text-md"
                onChange={(e) => {
                  const categoryId = e.target.value;
                  if (categoryId) {
                    const category = categories.find(c => c._id === categoryId);
                    if (category) {
                      handleSelectCategory(category);
                    }
                  }
                }}
                value=""
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Selected Categories */}
            {selectedCategories.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(category => (
                    <div 
                      key={category._id} 
                      className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
                    >
                      <span className="text-sm">{category.name}</span>
                      <button 
                        className="ml-2 text-gray-500 hover:text-gray-700"
                        onClick={() => handleRemoveCategory(category._id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Category Display - Edit Mode (Read-only) */
          existingCategory && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <p className="text-md text-gray-900">{existingCategory.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                Note: The category cannot be changed after creation
              </p>
            </div>
          )
        )}
        
        <div className="border-t border-gray-200 my-6 pt-6">
          <p className="text-md text-gray-600 mb-4">
            {mode === 'edit' 
              ? 'Update the stakeholder information'
              : 'For each selected category, specify the name of the stakeholder'
            }
          </p>
          
          {/* Stakeholder Name Input */}
          <div className="mb-4">
            <label htmlFor="stakeholderName" className="block text-md font-medium text-gray-700 mb-1">
              Stakeholder name <span className="text-clay-500">*</span>
            </label>
            <input
              id="stakeholderName"
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={stakeholderName}
              onChange={(e) => setStakeholderName(e.target.value)}
              placeholder={context === 'site' ? "e.g., Local Community Leaders" : "e.g., Ministry of Environment"}
              required
            />
          </div>
          
          {/* Stakeholder Description Input */}
          <div className="mb-6">
            <label htmlFor="stakeholderDescription" className="block text-md font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="stakeholderDescription"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={stakeholderDescription}
              onChange={(e) => setStakeholderDescription(e.target.value)}
              placeholder="Brief description of this stakeholder"
              rows={3}
            />
          </div>

          {/* Estimated Population */}
          <div className="mb-6">
            <label htmlFor="estimatedPopulation" className="block text-md font-medium text-gray-700 mb-1">
              Estimated Population (optional)
            </label>
            <input
              id="estimatedPopulation"
              type="number"
              min="0"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={estimatedPopulation}
              onChange={(e) => setEstimatedPopulation(e.target.value)}
              placeholder="Enter estimated population size"
            />
            <p className="text-xs text-gray-500 mt-1">
              {context === 'site' 
                ? 'Approximate number of people in this stakeholder category at this site'
                : 'Approximate number of people in this stakeholder category'
              }
            </p>
          </div>

          {/* Inclusion Checkboxes - Currently not saved, kept for future use */}
          <div className="mb-6">
            <label className="block text-md font-medium text-gray-700 mb-3">
              Does particular attention need to be paid to any groups with these protected characteristics
            </label>
            <div className="space-y-3">
              {INCLUSION_OPTIONS.map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    id={`inclusion-${option}`}
                    type="checkbox"
                    checked={selectedInclusion.includes(option)}
                    onChange={() => handleInclusionToggle(option)}
                    className="h-4 w-4 text-stratosphere-500 focus:ring-stratosphere-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`inclusion-${option}`}
                    className="ml-3 text-sm text-gray-700 capitalize"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {mode === 'edit' ? 'Cancel' : 'Discard'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !stakeholderName || (mode === 'create' && selectedCategories.length === 0)}
            className="px-4 py-2 border border-sky rounded-md shadow-sm text-sm font-medium text-white bg-stratosphere-500 hover:bg-stratosphere-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (mode === 'edit' ? 'Updating...' : 'Saving...') : (mode === 'edit' ? 'Update' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StakeholderGroupForm;