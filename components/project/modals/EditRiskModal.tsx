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
import { Loader2, User, MapPin, Info, MessageSquare, Send, Clock, Star, Filter, Calendar } from 'lucide-react'; // ✅ ADDED Calendar
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import types from @/types
import { UpdateRiskData, RiskItem, RiskComment } from '@/types';

// Import API functions
import {
  updateRiskItem,
  addRiskComment,
  toggleCommentKeyInsight,
  getRiskTypeOptions,
  getRiskSourceOptions,
  getRiskSourceDisplayName,
  getProbabilityOptions,
  getConsequencesOptions,
  getImpactAreaOptions,
  getRiskStatusOptions,
  getReviewFrequencyOptions // ✅ ADDED
} from '@/lib/api/riskManagement';

interface EditRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  risk: RiskItem | null;
  userRole: 'manager' | 'projectCreator' | 'organiser' | 'reviewer';
  onRiskUpdated?: () => void;
  projectSites?: Array<{ _id: string; name: string; }>;
  currentUser?: { _id: string; name: string; email: string; };
}

interface FormData {
  name: string;
  riskType: string;
  riskDescription: string;
  riskSource: string;
  sourceReference: string;
  probability: string;
  consequences: string;
  mitigationStrategy: string;
  category: string;
  impactArea: string[];
  reviewDate?: Date;
  reviewFrequency: 'quarterly' | 'half_yearly' | 'yearly'; // ✅ ADDED
  status: string;
  projectSiteId?: string;
}

const EditRiskModal = ({
  isOpen,
  onClose,
  risk,
  userRole,
  onRiskUpdated,
  projectSites = [],
  currentUser
}: EditRiskModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    riskType: '',
    riskDescription: '',
    riskSource: 'manual',
    sourceReference: '',
    probability: '',
    consequences: '',
    mitigationStrategy: '',
    category: 'current',
    impactArea: [],
    status: 'open',
    reviewFrequency: 'quarterly', // ✅ ADDED
    projectSiteId: undefined
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Comment state
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [comments, setComments] = useState<RiskComment[]>([]);
  
  // Key insights filter and starring state
  const [showOnlyKeyInsights, setShowOnlyKeyInsights] = useState(false);
  const [starringCommentId, setStarringCommentId] = useState<string | null>(null);

  // Get allowed risk types based on user role
  const allowedRiskTypes = getRiskTypeOptions()[userRole] || [];
  const riskSourceOptions = getRiskSourceOptions();
  const probabilityOptions = getProbabilityOptions();
  const consequencesOptions = getConsequencesOptions();
  const impactAreaOptions = getImpactAreaOptions();
  const statusOptions = getRiskStatusOptions();
  const reviewFrequencyOptions = getReviewFrequencyOptions(); // ✅ ADDED

  // Risk category options with descriptive labels
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

  // ✅ ADDED: Get current review frequency label
  const getCurrentReviewFrequencyLabel = () => {
    const option = reviewFrequencyOptions.find(opt => opt.value === formData.reviewFrequency);
    return option?.label || formData.reviewFrequency;
  };

  // Filter comments based on key insights toggle
  const filteredComments = showOnlyKeyInsights 
    ? comments.filter(c => c.isKeyInsight)
    : comments;

  // Count key insights
  const keyInsightCount = comments.filter(c => c.isKeyInsight).length;

  // Populate form when risk or modal opens
  useEffect(() => {
    if (isOpen && risk) {
      setFormData({
        name: risk.name || '',
        riskType: risk.riskType || '',
        riskDescription: risk.riskDescription || '',
        riskSource: risk.riskSource || 'manual',
        sourceReference: risk.sourceReference || '',
        probability: risk.probability || '',
        consequences: risk.consequences || '',
        mitigationStrategy: risk.mitigationStrategy || '',
        category: risk.category || 'current',
        impactArea: risk.impactArea || [],
        status: risk.status || 'open',
        reviewDate: risk.reviewDate ? new Date(risk.reviewDate) : undefined,
        reviewFrequency: risk.reviewFrequency || 'quarterly', // ✅ ADDED
        projectSiteId: risk.projectSite?._id || undefined
      });
      setComments(risk.comments || []);
      setNewComment('');
      setShowOnlyKeyInsights(false);
      setErrors({});
    } else if (!isOpen) {
      setFormData({
        name: '',
        riskType: '',
        riskDescription: '',
        riskSource: 'manual',
        sourceReference: '',
        probability: '',
        consequences: '',
        mitigationStrategy: '',
        category: 'current',
        impactArea: [],
        status: 'open',
        reviewFrequency: 'quarterly', // ✅ ADDED
        projectSiteId: undefined
      });
      setComments([]);
      setNewComment('');
      setShowOnlyKeyInsights(false);
      setErrors({});
    }
  }, [isOpen, risk]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Risk name is required';
    if (!formData.riskType) newErrors.riskType = 'Risk type is required';
    if (!formData.riskDescription.trim()) newErrors.riskDescription = 'Risk description is required';
    if (!formData.probability) newErrors.probability = 'Probability is required';
    if (!formData.consequences) newErrors.consequences = 'Consequences are required';
    if (!formData.mitigationStrategy.trim()) newErrors.mitigationStrategy = 'Mitigation strategy is required';
    if (!formData.reviewDate) newErrors.reviewDate = 'Review date is required';
    if (!formData.reviewFrequency) newErrors.reviewFrequency = 'Review frequency is required'; // ✅ ADDED

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle comment submission
  const handleAddComment = async () => {
    if (!risk || !newComment.trim()) return;

    try {
      setCommentSubmitting(true);
      const addedComment = await addRiskComment(risk._id, newComment.trim());
      
      const commentWithAuthor: RiskComment = {
        ...addedComment,
        author: {
          _id: currentUser?._id || '',
          name: currentUser?.name || 'You',
          email: currentUser?.email
        },
        isKeyInsight: false
      };
      
      setComments(prev => [...prev, commentWithAuthor]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      setErrors({ comment: error instanceof Error ? error.message : 'Failed to add comment' });
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Handle star toggle
  const handleToggleStar = async (commentId: string) => {
    if (!risk) return;

    try {
      setStarringCommentId(commentId);
      const result = await toggleCommentKeyInsight(risk._id, commentId);
      
      // Update the comment in the local state
      setComments(prev => prev.map(c => 
        c._id === commentId 
          ? {
              ...c,
              isKeyInsight: result.isKeyInsight,
              starredBy: result.isKeyInsight ? {
                _id: currentUser?._id || '',
                name: currentUser?.name || 'You',
                email: currentUser?.email
              } : undefined,
              starredAt: result.isKeyInsight ? new Date().toISOString() : undefined
            }
          : c
      ));
    } catch (error) {
      console.error('Failed to toggle star:', error);
      setErrors({ star: error instanceof Error ? error.message : 'Failed to update comment' });
    } finally {
      setStarringCommentId(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!risk || !validateForm()) return;

    try {
      setLoading(true);

      const updateData: UpdateRiskData = {
        name: formData.name.trim(),
        riskType: formData.riskType,
        riskDescription: formData.riskDescription.trim(),
        riskSource: formData.riskSource,
        sourceReference: formData.sourceReference?.trim() || undefined,
        probability: formData.probability,
        consequences: formData.consequences,
        mitigationStrategy: formData.mitigationStrategy.trim(),
        category: formData.category,
        impactArea: formData.impactArea,
        status: formData.status,
        reviewDate: formData.reviewDate?.toISOString(),
        reviewFrequency: formData.reviewFrequency // ✅ ADDED
      };

      await updateRiskItem(risk._id, updateData);
      
      onClose();
      if (onRiskUpdated) onRiskUpdated();
    } catch (error) {
      console.error('Failed to update risk:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update risk' });
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

  // Check if user can edit
  const canEdit = userRole === 'manager' || userRole === 'projectCreator' || 
                  (risk?.owner?._id === currentUser?._id);

  if (!risk) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-sky-200">
        <DialogHeader>
          <DialogTitle className="text-xl text-stratosphere">Edit Risk</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Risk Source Display */}
          {risk.riskSource && risk.riskSource !== 'manual' && (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-md">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-sky-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-stratosphere">Risk Source</p>
                  <Badge variant="outline" className="text-sky-500 border-sky-200 mt-1">
                    {getRiskSourceDisplayName(risk.riskSource)}
                  </Badge>
                  {risk.sourceReference && (
                    <p className="text-xs text-sky-600 mt-2">
                      Context: {risk.sourceReference}
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
                disabled={!canEdit}
                className={cn(
                  "border-sky-200 focus:border-sky-500",
                  errors.name && "border-sand-500",
                  !canEdit && "bg-sky-50"
                )}
              />
              {errors.name && <p className="text-sm text-sand-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskType" className="text-stratosphere">Risk Type *</Label>
              <Select 
                value={formData.riskType} 
                onValueChange={(value) => handleInputChange('riskType', value)}
                disabled={!canEdit}
              >
                <SelectTrigger className={cn(
                  "border-sky-200 focus:border-sky-500",
                  errors.riskType && "border-sand-500",
                  !canEdit && "bg-sky-50"
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
          <div className="space-y-2">
            <Label htmlFor="riskSource" className="text-stratosphere">Risk Source</Label>
            <Select 
              value={formData.riskSource} 
              onValueChange={(value) => handleInputChange('riskSource', value)}
              disabled={!canEdit}
            >
              <SelectTrigger className={cn(
                "border-sky-200 focus:border-sky-500",
                !canEdit && "bg-sky-50"
              )}>
                <SelectValue placeholder="Select risk source" />
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
              Update if risk source classification needs correction
            </p>
          </div>

          {/* Source Reference */}
          <div className="space-y-2">
            <Label htmlFor="sourceReference" className="text-stratosphere">Source Context</Label>
            <Input
              id="sourceReference"
              value={formData.sourceReference}
              onChange={(e) => handleInputChange('sourceReference', e.target.value)}
              placeholder="Additional context about the source"
              disabled={!canEdit}
              className={cn(
                "border-sky-200 focus:border-sky-500",
                !canEdit && "bg-sky-50"
              )}
            />
            <p className="text-xs text-sky-500">
              Optional: Provide specific context about where this risk was identified
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-stratosphere">Risk Description *</Label>
            <Textarea
              id="description"
              value={formData.riskDescription}
              onChange={(e) => handleInputChange('riskDescription', e.target.value)}
              placeholder="Describe the risk in detail"
              rows={3}
              disabled={!canEdit}
              className={cn(
                "border-sky-200 focus:border-sky-500",
                errors.riskDescription && "border-sand-500",
                !canEdit && "bg-sky-50"
              )}
            />
            {errors.riskDescription && <p className="text-sm text-sand-500">{errors.riskDescription}</p>}
          </div>

          {/* Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="probability" className="text-stratosphere">Probability *</Label>
              <Select 
                value={formData.probability} 
                onValueChange={(value) => handleInputChange('probability', value)}
                disabled={!canEdit}
              >
                <SelectTrigger className={cn(
                  "border-sky-200 focus:border-sky-500",
                  errors.probability && "border-sand-500",
                  !canEdit && "bg-sky-50"
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
              <Select 
                value={formData.consequences} 
                onValueChange={(value) => handleInputChange('consequences', value)}
                disabled={!canEdit}
              >
                <SelectTrigger className={cn(
                  "border-sky-200 focus:border-sky-500",
                  errors.consequences && "border-sand-500",
                  !canEdit && "bg-sky-50"
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

          {/* Current Owner Display */}
          <div className="space-y-2">
            <Label className="text-stratosphere">Risk Owner</Label>
            <div className="flex items-center gap-2 p-3 bg-sky-50 border border-sky-200 rounded-md">
              <User className="h-4 w-4 text-sky-500" />
              <div>
                <p className="text-sm font-medium text-stratosphere">{risk.owner.name}</p>
                <p className="text-xs text-sky-500">{risk.owner.email}</p>
              </div>
            </div>
            <p className="text-xs text-sky-500">Contact an administrator to change the risk owner</p>
          </div>

          {/* Project Site */}
          {projectSites.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="projectSite" className="text-stratosphere">Project Site</Label>
              <Select 
                value={formData.projectSiteId || 'none'} 
                onValueChange={(value) => handleInputChange('projectSiteId', value === 'none' ? undefined : value)}
                disabled={!canEdit}
              >
                <SelectTrigger className={cn(
                  "border-sky-200 focus:border-sky-500",
                  !canEdit && "bg-sky-50"
                )}>
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

          {/* Mitigation Strategy */}
          <div className="space-y-2">
            <Label htmlFor="mitigation" className="text-stratosphere">Mitigation Strategy *</Label>
            <Textarea
              id="mitigation"
              value={formData.mitigationStrategy}
              onChange={(e) => handleInputChange('mitigationStrategy', e.target.value)}
              placeholder="Describe how this risk will be mitigated"
              rows={3}
              disabled={!canEdit}
              className={cn(
                "border-sky-200 focus:border-sky-500",
                errors.mitigationStrategy && "border-sand-500",
                !canEdit && "bg-sky-50"
              )}
            />
            {errors.mitigationStrategy && <p className="text-sm text-sand-500">{errors.mitigationStrategy}</p>}
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
                disabled={!canEdit}
              >
                <SelectTrigger className={cn(
                  "border-sky-200 focus:border-sky-500",
                  !canEdit && "bg-sky-50"
                )}>
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
              <Label htmlFor="status" className="text-stratosphere">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
                disabled={!canEdit}
              >
                <SelectTrigger className={cn(
                  "border-sky-200 focus:border-sky-500",
                  !canEdit && "bg-sky-50"
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                disabled={!canEdit}
                className={cn(
                  "border-sky-200 focus:border-sky-500",
                  errors.reviewDate && "border-sand-500",
                  !canEdit && "bg-sky-50"
                )}
              />
              {errors.reviewDate && <p className="text-sm text-sand-500">{errors.reviewDate}</p>}
            </div>
          </div>

          {/* ✅ NEW: Review Frequency Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-500" />
              <Label htmlFor="reviewFrequency" className="text-stratosphere">
                Review Frequency *
              </Label>
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
              onValueChange={(value: 'quarterly' | 'half_yearly' | 'yearly') => 
                handleInputChange('reviewFrequency', value)
              }
              disabled={!canEdit}
            >
              <SelectTrigger className={cn(
                "border-sky-200 focus:border-sky-500",
                errors.reviewFrequency && "border-sand-500",
                !canEdit && "bg-sky-50"
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
              How often this risk should be reviewed. Next review will be automatically 
              scheduled based on this frequency.
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
                    disabled={!canEdit}
                  />
                  <Label
                    htmlFor={option.value}
                    className={cn(
                      "text-sm cursor-pointer",
                      canEdit ? "text-stratosphere" : "text-sky-400"
                    )}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section with Star Functionality */}
          <div className="space-y-3 p-4 border border-sky-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-sky-500" />
                <Label className="text-base text-stratosphere">
                  Note here the actions recently taken to mitigate risk ({comments.length})
                  {keyInsightCount > 0 && (
                    <span className="ml-2 text-sm text-ochre-600">
                      • {keyInsightCount} Key Insight{keyInsightCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </Label>
              </div>
              
              {/* Filter toggle */}
              {keyInsightCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOnlyKeyInsights(!showOnlyKeyInsights)}
                  className={cn(
                    "text-xs",
                    showOnlyKeyInsights 
                      ? "bg-ochre-50 border-ochre-300 text-ochre-700" 
                      : "border-sky-200 text-sky-600"
                  )}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  {showOnlyKeyInsights ? 'Show All' : 'Key Insights Only'}
                </Button>
              )}
            </div>
            
            {/* Display filtered comments */}
            {filteredComments.length > 0 ? (
              <ScrollArea className="h-48 w-full rounded-md border border-sky-100 p-3">
                <div className="space-y-3">
                  {filteredComments.map((comment, index) => (
                    <div 
                      key={comment._id || index} 
                      className={cn(
                        "p-3 rounded-md border",
                        comment.isKeyInsight 
                          ? "bg-ochre-50 border-ochre-200" 
                          : "bg-sky-50 border-sky-100"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <User className={cn(
                            "h-4 w-4",
                            comment.isKeyInsight ? "text-ochre-500" : "text-sky-500"
                          )} />
                          <span className="text-sm font-medium text-stratosphere">
                            {comment.author.name}
                          </span>
                          {comment.isKeyInsight && (
                            <Badge variant="outline" className="text-xs bg-ochre-100 border-ochre-300 text-ochre-700">
                              <Star className="h-3 w-3 mr-1 fill-ochre-500" />
                              Key Insight
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-sky-500">
                            <Clock className="h-3 w-3" />
                            {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                          </div>
                          
                          {/* Star button */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStar(comment._id!)}
                                  disabled={starringCommentId === comment._id}
                                  className={cn(
                                    "h-7 w-7 p-0",
                                    comment.isKeyInsight && "text-ochre-500 hover:text-ochre-600"
                                  )}
                                >
                                  {starringCommentId === comment._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Star className={cn(
                                      "h-4 w-4",
                                      comment.isKeyInsight && "fill-ochre-500"
                                    )} />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {comment.isKeyInsight 
                                    ? 'Remove from key insights' 
                                    : 'Mark as key insight'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      
                      <p className="text-sm text-stratosphere whitespace-pre-wrap">
                        {comment.text}
                      </p>
                      
                      {/* Show who starred and when */}
                      {comment.isKeyInsight && comment.starredBy && (
                        <p className="text-xs text-ochre-600 mt-2">
                          Starred by {comment.starredBy.name} on {format(new Date(comment.starredAt!), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : showOnlyKeyInsights ? (
              <div className="p-4 text-center text-sm text-ochre-500 bg-ochre-50 rounded-md border border-ochre-200">
                No key insights yet. Star important comments to mark them as key insights.
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-sky-500 bg-sky-50 rounded-md">
                No comments yet. Add the first comment below.
              </div>
            )}

            {/* Add new comment */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="flex-1 border-sky-200 focus:border-sky-500"
                />
                <Button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || commentSubmitting}
                  className="bg-sky-500 hover:bg-sky-600 text-white self-end"
                >
                  {commentSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.comment && (
                <p className="text-sm text-sand-500">{errors.comment}</p>
              )}
              {errors.star && (
                <p className="text-sm text-sand-500">{errors.star}</p>
              )}
              <p className="text-xs text-sky-500">
                Your comment will be saved with your name and timestamp. Click the star icon to mark important comments as key insights.
              </p>
            </div>
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
              {canEdit ? 'Cancel' : 'Close'}
            </Button>
            {canEdit && (
              <Button
                type="submit"
                disabled={loading}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Risk'
                )}
              </Button>
            )}
          </div>

          {!canEdit && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-md">
              <p className="text-sm text-sky-600">
                You can view and comment on this risk. Contact a project manager to make other changes.
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRiskModal;