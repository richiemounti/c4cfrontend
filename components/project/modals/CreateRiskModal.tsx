'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, User, AlertCircle, Info, MessageSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import from types
import { CreateRiskData } from '@/types';

// Import API functions
import {
  createRiskItem,
  getRiskTypeOptions,
  getRiskSourceOptions,
  getProbabilityOptions,
  getConsequencesOptions,
  getImpactAreaOptions,
  getReviewFrequencyOptions, // ✅ NEW
  calculateNextReviewDate // ✅ NEW
} from '@/lib/api/riskManagement';


interface CreateRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  organizationId: string;
  userRole: 'manager' | 'projectCreator' | 'organiser' | 'reviewer';
  onRiskCreated?: () => void;
  projectSites?: Array<{ _id: string; name: string; }>;
  currentUser?: { _id: string; name: string; email: string; };
  riskSource?: 'manual' | 'project_setup' | 'site_setup' | 'stakeholder_mapping' | 'toc_stage1' | 'toc_stage2';
  sourceReference?: string;
  sourceFieldName?: string;
  initialDescription?: string;
}

interface FormData {
  name: string;
  riskType: string;
  riskDescription: string;
  riskSource: string;
  sourceReference: string;
  probability: string;
  consequences: string;
  owner: string;
  mitigationStrategy: string;
  category: string;
  impactArea: string[];
  reviewDate?: Date;
  reviewFrequency: 'quarterly' | 'half_yearly' | 'yearly'; // ✅ NEW
  comment: string;
  projectSiteId?: string;
}

const CreateRiskModal = ({
  isOpen,
  onClose,
  projectId,
  organizationId,
  userRole,
  onRiskCreated,
  projectSites = [],
  currentUser,
  riskSource = 'manual',
  sourceReference,
  sourceFieldName,
  initialDescription
}: CreateRiskModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    riskType: '',
    riskDescription: '',
    riskSource: 'manual',
    sourceReference: '',
    probability: '',
    consequences: '',
    owner: '',
    mitigationStrategy: '',
    category: 'current',
    impactArea: [],
    reviewFrequency: 'quarterly', // ✅ NEW: Default to quarterly
    comment: '',
    projectSiteId: undefined
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get allowed risk types based on user role
  const allowedRiskTypes = getRiskTypeOptions()[userRole] || [];
  const riskSourceOptions = getRiskSourceOptions();
  const probabilityOptions = getProbabilityOptions();
  const consequencesOptions = getConsequencesOptions();
  const impactAreaOptions = getImpactAreaOptions();
  const reviewFrequencyOptions = getReviewFrequencyOptions(); // ✅ NEW

  // ✅ Risk category options with descriptive labels
  const riskCategoryOptions = [
    {
      value: 'current',
      label: 'Addressed Risk',
      description: 'Risks that are being actively managed'
    },
    {
      value: 'inherent',
      label: 'Underlying Risk',
      description: 'Structural or contextual risks that exist'
    },
    {
      value: 'residual',
      label: 'Unavoidable Risk',
      description: 'Risks that cannot reasonably be eliminated'
    }
  ];

  // Get the current category label for display
  const getCurrentCategoryLabel = () => {
    const option = riskCategoryOptions.find(opt => opt.value === formData.category);
    return option?.label || formData.category;
  };

  // ✅ NEW: Get current review frequency label
  const getCurrentReviewFrequencyLabel = () => {
    const option = reviewFrequencyOptions.find(opt => opt.value === formData.reviewFrequency);
    return option?.label || formData.reviewFrequency;
  };

  // Calculate suggested review date based on risk assessment
  const calculateSuggestedReviewDate = (probability: string, consequences: string): Date => {
    const now = new Date();
    const DAY_MS = 24 * 60 * 60 * 1000;
    
    let days = 30;
    
    const probMultiplier = {
      'very_low': 1.5,
      'low': 1.2,
      'medium': 1.0,
      'high': 0.5,
      'very_high': 0.25
    };
    
    const consMultiplier = {
      'negligible': 2.0,
      'minor': 1.5,
      'moderate': 1.0,
      'major': 0.5,
      'catastrophic': 0.25
    };
    
    const probAdjustment = probMultiplier[probability as keyof typeof probMultiplier] || 1.0;
    const consAdjustment = consMultiplier[consequences as keyof typeof consMultiplier] || 1.0;
    
    days = Math.round(days * probAdjustment * consAdjustment);
    days = Math.max(7, Math.min(90, days));
    
    return new Date(now.getTime() + days * DAY_MS);
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && currentUser) {
      const finalSourceReference = sourceReference || 
        (sourceFieldName ? `Source: ${sourceFieldName}` : '');
      const finalDescription = initialDescription || '';
      
      setFormData(prev => ({
        ...prev,
        owner: currentUser._id,
        riskSource: riskSource,
        sourceReference: finalSourceReference,
        riskDescription: finalDescription,
        comment: sourceFieldName ? `Context: ${sourceFieldName}` : ''
      }));
    } else if (!isOpen) {
      setFormData({
        name: '',
        riskType: '',
        riskDescription: '',
        riskSource: 'manual',
        sourceReference: '',
        probability: '',
        consequences: '',
        owner: '',
        mitigationStrategy: '',
        category: 'current',
        impactArea: [],
        reviewFrequency: 'quarterly', // ✅ NEW: Reset to default
        comment: '',
        projectSiteId: undefined
      });
      setErrors({});
    }
  }, [isOpen, currentUser, riskSource, sourceReference, sourceFieldName, initialDescription]);

  // Auto-suggest review date
  useEffect(() => {
    if (formData.probability && formData.consequences && !formData.reviewDate) {
      const suggestedDate = calculateSuggestedReviewDate(formData.probability, formData.consequences);
      handleInputChange('reviewDate', suggestedDate);
    }
  }, [formData.probability, formData.consequences]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Risk name is required';
    if (!formData.riskType) newErrors.riskType = 'Risk type is required';
    if (!formData.riskDescription.trim()) newErrors.riskDescription = 'Risk description is required';
    if (!formData.probability) newErrors.probability = 'Probability is required';
    if (!formData.consequences) newErrors.consequences = 'Consequences are required';
    if (!formData.owner) newErrors.owner = 'Risk owner is required';
    if (!formData.mitigationStrategy.trim()) newErrors.mitigationStrategy = 'Mitigation strategy is required';
    if (!formData.reviewDate) newErrors.reviewDate = 'Review date is required';
    if (!formData.reviewFrequency) newErrors.reviewFrequency = 'Review frequency is required'; // ✅ NEW

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      const riskData: CreateRiskData = {
        projectId,
        organizationId,
        name: formData.name.trim(),
        riskType: formData.riskType,
        riskDescription: formData.riskDescription.trim(),
        riskSource: formData.riskSource,
        sourceReference: formData.sourceReference?.trim() || undefined,
        probability: formData.probability,
        consequences: formData.consequences,
        owner: formData.owner,
        mitigationStrategy: formData.mitigationStrategy.trim(),
        category: formData.category,
        impactArea: formData.impactArea,
        reviewDate: formData.reviewDate!.toISOString(),
        reviewFrequency: formData.reviewFrequency, // ✅ NEW: Include review frequency
        comment: formData.comment.trim() || undefined,
        projectSiteId: formData.projectSiteId === 'none' ? undefined : formData.projectSiteId
      };

      await createRiskItem(riskData);
      
      onClose();
      if (onRiskCreated) onRiskCreated();
    } catch (error) {
      console.error('Failed to create risk:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create risk' });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle impact area changes
  const handleImpactAreaChange = (value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      impactArea: checked
        ? [...prev.impactArea, value]
        : prev.impactArea.filter(area => area !== value)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-sky-200">
        <DialogHeader>
          <DialogTitle className="text-xl text-stratosphere">Create New Risk</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Risk Source Information */}
          {formData.riskSource !== 'manual' && (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-sky-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-stratosphere">Risk Source</p>
                  <p className="text-sm text-sky-600">
                    This risk is being logged from: {riskSourceOptions.find(opt => opt.value === formData.riskSource)?.label}
                  </p>
                  {formData.sourceReference && (
                    <p className="text-xs text-sky-500 mt-1">
                      Context: {formData.sourceReference}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-stratosphere">Risk Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter risk name"
                className={cn(
                  "border-sky-200 focus:border-sky-500",
                  errors.name && "border-sand-500"
                )}
              />
              {errors.name && <p className="text-sm text-sand-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskType" className="text-stratosphere">Risk Type *</Label>
              <Select value={formData.riskType} onValueChange={(value) => handleInputChange('riskType', value)}>
                <SelectTrigger className={cn(
                  "border-sky-200 focus:border-sky-500",
                  errors.riskType && "border-sand-500"
                )}>
                  <SelectValue placeholder="Select risk type" />
                </SelectTrigger>
                <SelectContent>
                  {allowedRiskTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.riskType && <p className="text-sm text-sand-500">{errors.riskType}</p>}
            </div>
          </div>

          {/* Risk Source */}
          {riskSource === 'manual' && (
            <div className="space-y-2">
              <Label htmlFor="riskSource" className="text-stratosphere">Risk Source</Label>
              <Select value={formData.riskSource} onValueChange={(value) => handleInputChange('riskSource', value)}>
                <SelectTrigger className="border-sky-200 focus:border-sky-500">
                  <SelectValue placeholder="Select where this risk was identified" />
                </SelectTrigger>
                <SelectContent>
                  {riskSourceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-sky-500">
                Select where this risk was identified to help track risk sources
              </p>
            </div>
          )}

          {/* Source Reference */}
          {formData.riskSource !== 'manual' && (
            <div className="space-y-2">
              <Label htmlFor="sourceReference" className="text-stratosphere">Source Context</Label>
              <Input
                id="sourceReference"
                value={formData.sourceReference}
                onChange={(e) => handleInputChange('sourceReference', e.target.value)}
                placeholder="Additional context about the source"
                className="border-sky-200 focus:border-sky-500"
              />
              <p className="text-xs text-sky-500">
                Optional: Provide specific context (e.g., "Stakeholder Group: Local Community")
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-stratosphere">Risk Description *</Label>
            <Textarea
              id="description"
              value={formData.riskDescription}
              onChange={(e) => handleInputChange('riskDescription', e.target.value)}
              placeholder="Describe the risk in detail"
              rows={3}
              className={cn(
                "border-sky-200 focus:border-sky-500",
                errors.riskDescription && "border-sand-500"
              )}
            />
            {errors.riskDescription && <p className="text-sm text-sand-500">{errors.riskDescription}</p>}
          </div>

          {/* Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="probability" className="text-stratosphere">Probability *</Label>
              <Select value={formData.probability} onValueChange={(value) => handleInputChange('probability', value)}>
                <SelectTrigger className={cn(
                  "border-sky-200 focus:border-sky-500",
                  errors.probability && "border-sand-500"
                )}>
                  <SelectValue placeholder="Select probability" />
                </SelectTrigger>
                <SelectContent>
                  {probabilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.probability && <p className="text-sm text-sand-500">{errors.probability}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="consequences" className="text-stratosphere">Consequences *</Label>
              <Select value={formData.consequences} onValueChange={(value) => handleInputChange('consequences', value)}>
                <SelectTrigger className={cn(
                  "border-sky-200 focus:border-sky-500",
                  errors.consequences && "border-sand-500"
                )}>
                  <SelectValue placeholder="Select consequences" />
                </SelectTrigger>
                <SelectContent>
                  {consequencesOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.consequences && <p className="text-sm text-sand-500">{errors.consequences}</p>}
            </div>
          </div>

          {/* Owner and Project Site */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner" className="text-stratosphere">Risk Owner *</Label>
              <div className="flex items-center gap-2 p-3 bg-sky-50 border border-sky-200 rounded-md">
                <User className="h-4 w-4 text-sky-500" />
                <div>
                  <p className="text-sm font-medium text-stratosphere">{currentUser?.name || 'Current User'}</p>
                  <p className="text-xs text-sky-500">{currentUser?.email || 'Loading...'}</p>
                </div>
              </div>
              <p className="text-xs text-sky-500">
                You will be assigned as the owner of this risk
              </p>
            </div>

            {projectSites.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="projectSite" className="text-stratosphere">Project Site</Label>
                <Select value={formData.projectSiteId || ''} onValueChange={(value) => handleInputChange('projectSiteId', value || undefined)}>
                  <SelectTrigger className="border-sky-200 focus:border-sky-500">
                    <SelectValue placeholder="Select project site (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific site</SelectItem>
                    {projectSites.map((site) => (
                      <SelectItem key={site._id} value={site._id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Mitigation Strategy */}
          <div className="space-y-2">
            <Label htmlFor="mitigation" className="text-stratosphere">Mitigation Strategy *</Label>
            <Textarea
              id="mitigation"
              value={formData.mitigationStrategy}
              onChange={(e) => handleInputChange('mitigationStrategy', e.target.value)}
              placeholder="Describe how this risk will be mitigated"
              rows={3}
              className={cn(
                "border-sky-200 focus:border-sky-500",
                errors.mitigationStrategy && "border-sand-500"
              )}
            />
            {errors.mitigationStrategy && <p className="text-sm text-sand-500">{errors.mitigationStrategy}</p>}
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Category with descriptive labels and tooltip */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="category" className="text-stratosphere">Risk Category</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-sky-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Risk Category Types:</p>
                        {riskCategoryOptions.map((opt) => (
                          <div key={opt.value} className="space-y-1">
                            <p className="text-sm font-medium">{opt.label}</p>
                            <p className="text-xs text-sky-200">{opt.description}</p>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="border-sky-200 focus:border-sky-500">
                  <SelectValue>
                    {getCurrentCategoryLabel()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {riskCategoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col py-1">
                        <span className="font-medium text-sm">{option.label}</span>
                        <span className="text-xs text-sky-600">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-sky-500">
                Hover the info icon for detailed explanations
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewDate" className="text-stratosphere">Review Date *</Label>
              <Input
                type="date"
                id="reviewDate"
                value={formData.reviewDate ? format(formData.reviewDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                  handleInputChange('reviewDate', dateValue);
                }}
                min={format(new Date(), 'yyyy-MM-dd')}
                className={cn(
                  "border-sky-200 focus:border-sky-500",
                  errors.reviewDate && "border-sand-500"
                )}
              />
              {errors.reviewDate && <p className="text-sm text-sand-500">{errors.reviewDate}</p>}
              <p className="text-xs text-sky-500">
                Suggested based on risk assessment
              </p>
            </div>
          </div>

          {/* ✅ NEW: Review Frequency Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-500" />
              <Label htmlFor="reviewFrequency" className="text-stratosphere">Review Frequency *</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-sky-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Review Frequency Options:</p>
                      {reviewFrequencyOptions.map((opt) => (
                        <div key={opt.value} className="space-y-1">
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-sky-200">{opt.description}</p>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={formData.reviewFrequency} 
              onValueChange={(value: 'quarterly' | 'half_yearly' | 'yearly') => handleInputChange('reviewFrequency', value)}
            >
              <SelectTrigger className={cn(
                "border-sky-200 focus:border-sky-500",
                errors.reviewFrequency && "border-sand-500"
              )}>
                <SelectValue>
                  {getCurrentReviewFrequencyLabel()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {reviewFrequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col py-1">
                      <span className="font-medium text-sm">{option.label}</span>
                      <span className="text-xs text-sky-600">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reviewFrequency && <p className="text-sm text-sand-500">{errors.reviewFrequency}</p>}
            <p className="text-xs text-sky-500">
              How often this risk should be reviewed going forward. The next review date will be automatically calculated based on this frequency.
            </p>
          </div>

          {/* Impact Areas */}
          <div className="space-y-2">
            <Label className="text-stratosphere">Impact Areas</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {impactAreaOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={formData.impactArea.includes(option.value)}
                    onCheckedChange={(checked) => handleImpactAreaChange(option.value, !!checked)}
                  />
                  <Label
                    htmlFor={option.value}
                    className="text-sm text-stratosphere cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Initial Comment Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-sky-500" />
              <Label htmlFor="comment" className="text-stratosphere">Initial Comment</Label>
            </div>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              placeholder="Add an initial comment or note about this risk (optional)"
              rows={2}
              className="border-sky-200 focus:border-sky-500"
            />
            <p className="text-xs text-sky-500">
              This comment will be saved with your name and timestamp. You can add more comments after creating the risk.
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-sand-50 border border-sand-200 rounded-md">
              <p className="text-sm text-sand-700">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-sky-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-sky-200 text-sky-500 hover:bg-sky-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Risk'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRiskModal;