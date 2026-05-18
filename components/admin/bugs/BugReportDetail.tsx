// components/admin/bugs/BugReportDetail.tsx
import { FC, useState } from 'react';
import { 
  X, 
  Monitor, 
  Globe, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  User, 
  Check,
  Bug,
  Heart,
  Star,
  Lightbulb,
  MessageSquare,
  FileText,
  Users,
  Flag,
  Tag,
  BarChart3,
  AlertTriangle,
  Eye,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { updateBugReport } from '@/lib/api/bugReport';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BugReport } from '@/app/admin/bugs/page';

interface User {
  _id: string;
  name: string;
}



interface BugReportDetailProps {
  report: BugReport;
  onClose: () => void;
  onUpdate: (updatedReport: any) => void;
}


// NEW: Image/Attachment Modal Component
const AttachmentModal: FC<{
  attachment: any;
  isOpen: boolean;
  onClose: () => void;
}> = ({ attachment, isOpen, onClose }) => {
  if (!isOpen) return null;

  const isImage = attachment.type === 'screenshot' || attachment.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className="fixed inset-0 bg-stratosphere-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-concrete-500/20">
          <h3 className="text-lg font-semibold text-stratosphere-900">{attachment.filename}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-sky-500 hover:text-stratosphere-900"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 max-h-[calc(90vh-100px)] overflow-auto">
          {isImage ? (
            <img 
              src={attachment.url} 
              alt={attachment.filename}
              className="w-full h-auto object-contain max-h-[70vh]"
            />
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-concrete-500 mx-auto mb-4" />
              <p className="text-stratosphere-900 mb-4">Cannot preview this file type</p>
              <Button
                onClick={() => window.open(attachment.url, '_blank')}
                className="bg-coral-500 hover:bg-coral-600 text-white"
              >
                Download File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BugReportDetail: FC<BugReportDetailProps> = ({ report, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [formData, setFormData] = useState({
    status: report.status,
    priority: report.priority,
    urgencyLevel: report.urgencyLevel,
    bugType: report.bugType || '', // Now represents "type"
    assignedTo: report.assignedTo?._id || '',
    assignedToTeamMember: report.assignedToTeamMember || '', // NEW
    resolved: report.resolved,
    resolution: report.resolution || '',
    requiresFollowUp: report.requiresFollowUp,
    // NEW: Verification fields
    verified: report.verified || false,
    verificationDetails: report.verificationDetails || '',
    tags: report.tags.join(', ')
  });

  // Enhanced status options
  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'triaged', label: 'Triaged' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'cannot-reproduce', label: 'Cannot Reproduce' },
    { value: 'duplicate', label: 'Duplicate' },
    { value: 'deferred', label: 'Deferred' },
  ];

  // Enhanced priority options
  const priorityOptions = [
    { value: 'p0', label: 'P0 - Critical' },
    { value: 'p1', label: 'P1 - High' },
    { value: 'p2', label: 'P2 - Medium' },
    { value: 'p3', label: 'P3 - Low' },
    { value: 'p4', label: 'P4 - Backlog' },
  ];

  // Urgency level options
  const urgencyOptions = [
    { value: 'fix_24_hours', label: 'Fix within 24 hours' },
    { value: 'fix_1_3_days', label: 'Fix within 1-3 days' },
    { value: 'fix_this_week', label: 'Fix within this week' },
    { value: 'fix_2_weeks', label: 'Fix within 2 weeks' },
    { value: 'fix_next_month', label: 'Fix within next month' },
    { value: 'later', label: 'Later' },
  ];

  // Effort options
  const typeOptions = [
    { value: 'fix', label: 'Fix' },
    { value: 'food_for_thought', label: 'Food for Thought' },
    { value: 'pipeline', label: 'Pipeline' },
  ];

  // 4. ADD NEW TEAM MEMBER OPTIONS
  // 4. ADD NEW TEAM MEMBER OPTIONS
  const teamMemberOptions = [
    { value: 'unassigned', label: 'Unassigned' },  // CHANGED TO NON-EMPTY STRING
    { value: 'kate', label: 'Kate' },
    { value: 'sam', label: 'Sam' },
    { value: 'belinda', label: 'Belinda' },
  ];

  // Format dates
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get feedback type icon
  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'bug_report': return <Bug className="h-5 w-5" />;
      case 'user_experience': return <Heart className="h-5 w-5" />;
      case 'thematic_feedback': return <Star className="h-5 w-5" />;
      case 'feature_suggestion': return <Lightbulb className="h-5 w-5" />;
      case 'general_feedback': return <MessageSquare className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  // Status badge with custom theming
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'new': return 'bg-coral-50 text-coral-600 border-coral-500/20';
        case 'triaged': return 'bg-ochre-50 text-ochre-600 border-ochre-500/20';
        case 'resolved': return 'bg-grass-50 text-grass-600 border-grass-500/20';
        case 'cannot-reproduce': return 'bg-concrete-50 text-concrete-600 border-concrete-500/20';
        case 'duplicate': return 'bg-sand-50 text-sand-600 border-sand-500/20';
        case 'deferred': return 'bg-stratosphere-50 text-stratosphere-600 border-stratosphere-500/20';
        default: return 'bg-concrete-50 text-concrete-600 border-concrete-500/20';
      }
    };

    return (
      <Badge className={`${getStatusColor(status)} border`}>
        {status.replace(/-/g, ' ')}
      </Badge>
    );
  };

  // Priority badge with custom theming
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'p0': return 'bg-coral-100 text-coral-700 border-coral-500/30';
        case 'p1': return 'bg-sand-100 text-sand-700 border-sand-500/30';
        case 'p2': return 'bg-ochre-100 text-ochre-700 border-ochre-500/30';
        case 'p3': return 'bg-sky-100 text-sky-700 border-sky-500/30';
        case 'p4': return 'bg-concrete-100 text-concrete-700 border-concrete-500/30';
        default: return 'bg-concrete-100 text-concrete-700 border-concrete-500/30';
      }
    };

    return (
      <Badge className={`${getPriorityColor(priority)} border`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getUrgencyDisplay = (urgencyLevel: string) => {
    const urgencyLabels = {
      'fix_24_hours': '🚨 Fix within 24 hours',
      'fix_1_3_days': '⚠️ Fix within 1-3 days',
      'fix_this_week': '📅 Fix within this week',
      'fix_2_weeks': '📆 Fix within 2 weeks',
      'fix_next_month': '🗓️ Fix within next month',
      'later': '⏰ Fix later'
    };
    return urgencyLabels[urgencyLevel as keyof typeof urgencyLabels] || urgencyLevel;
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });

    // If marking as resolved, ensure status is also set to resolved
    if (field === 'resolved' && value === true) {
      setFormData(prev => ({ ...prev, status: 'resolved' }));
    }
    
    // If changing status to resolved or verified, also set resolved to true
    // If changing status to resolved, also set resolved to true
    if (field === 'status' && value === 'resolved') {
      setFormData(prev => ({ ...prev, resolved: true }));
    } else if (field === 'status' && value !== 'resolved') {
      setFormData(prev => ({ ...prev, resolved: false, verified: false }));
    }

    // NEW: Verification logic
    if (field === 'verified' && value === true && !formData.resolved) {
      setFormData(prev => ({ ...prev, resolved: true, status: 'resolved' }));
    }

    if (field === 'resolved' && value === false) {
      setFormData(prev => ({ ...prev, verified: false }));
    }
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updateData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };
      
      const updatedReport = await updateBugReport(report._id, updateData);
      onUpdate(updatedReport.data);
      setShowUpdateForm(false);
    } catch (error) {
      console.error('Failed to update bug report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render rating stars
  const renderRating = (rating: number, label: string) => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-sky-500">{label}:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-ochre-500 fill-ochre-500' : 'text-concrete-500'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-stratosphere-900 font-medium">{rating}/5</span>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          {getFeedbackTypeIcon(report.feedbackType)}
          <h2 className="text-xl font-semibold text-stratosphere-900">{report.title}</h2>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-sky-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Reported {formatDate(report.createdAt)}
          </div>
          {report.reporter && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {report.reporter.name}
            </div>
          )}
          <div className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Score: {report.overallScore}
          </div>
        </div>

        {/* Status and priority badges */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <StatusBadge status={report.status} />
          <PriorityBadge priority={report.priority} />

          {report.assignedToTeamMember && (
            <Badge className="bg-purple-50 text-purple-600 border-purple-500/20">
              Assigned to {report.assignedToTeamMember.charAt(0).toUpperCase() + report.assignedToTeamMember.slice(1)}
            </Badge>
          )}

          
          <Badge className="bg-ochre-50 text-ochre-600 border-ochre-500/20">
            {getUrgencyDisplay(report.urgencyLevel)}
          </Badge>
          
          {report.bugType && (
            <Badge className="bg-forest-50 text-forest-600 border-forest-500/20">
              {report.bugType} effort
            </Badge>
          )}
          
          {report.requiresFollowUp && (
            <Badge className="bg-coral-50 text-coral-600 border-coral-500/20">
              Follow-up Required
            </Badge>
          )}
        </div>

        

        {/* Tags */}
        {report.tags && report.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-sky-500" />
            <div className="flex flex-wrap gap-1">
              {report.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs border-concrete-500/30 text-stratosphere-900">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={() => setShowUpdateForm(!showUpdateForm)}
          className="bg-coral-500 hover:bg-coral-600 text-white"
        >
          {showUpdateForm ? 'Cancel Update' : 'Update Report'}
        </Button>
      </div>

      {/* Update form */}
      {showUpdateForm && (
        <Card className="mb-6 border-coral-500/20">
          <CardHeader>
            <CardTitle className="text-lg text-stratosphere-900">Update Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stratosphere-900 mb-2">
                    Status
                  </label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
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
                
                <div>
                  <label className="block text-sm font-medium text-stratosphere-900 mb-2">
                    Priority
                  </label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stratosphere-900 mb-2">
                    Urgency Level
                  </label>
                  <Select value={formData.urgencyLevel} onValueChange={(value) => handleInputChange('urgencyLevel', value)}>
                    <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stratosphere-900 mb-2">
                    Type
                  </label>
                  <Select value={formData.bugType} onValueChange={(value) => handleInputChange('bugType', value)}>
                    <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stratosphere-900 mb-2">
                  Assign to Team Member
                </label>
                <Select value={formData.assignedToTeamMember} onValueChange={(value) => handleInputChange('assignedToTeamMember', value)}>
                  <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMemberOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stratosphere-900 mb-2">
                  Tags (comma-separated)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="bug, ui, performance"
                  className="border-concrete-500/30 focus:border-coral-500"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.resolved}
                    onCheckedChange={(checked) => handleInputChange('resolved', checked)}
                    className="border-coral-500 data-[state=checked]:bg-coral-500"
                  />
                  <span className="text-sm text-stratosphere-900">Mark as resolved</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.requiresFollowUp}
                    onCheckedChange={(checked) => handleInputChange('requiresFollowUp', checked)}
                    className="border-coral-500 data-[state=checked]:bg-coral-500"
                  />
                  <span className="text-sm text-stratosphere-900">Requires follow-up</span>
                </label>
              </div>
              
              {formData.resolved && (
                <div>
                  <label className="block text-sm font-medium text-stratosphere-900 mb-2">
                    Resolution Details
                  </label>
                  <Textarea
                    value={formData.resolution}
                    onChange={(e) => handleInputChange('resolution', e.target.value)}
                    placeholder="Explain how this issue was resolved..."
                    className="border-concrete-500/30 focus:border-coral-500"
                    required={formData.resolved}
                  />
                </div>
              )}
              {formData.resolved && (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.verified}
                      onCheckedChange={(checked) => handleInputChange('verified', checked)}
                      className="border-coral-500 data-[state=checked]:bg-coral-500"
                    />
                    <span className="text-sm text-stratosphere-900">Mark as verified</span>
                  </label>
                </div>
              )}

              {formData.verified && (
                <div>
                  <label className="block text-sm font-medium text-stratosphere-900 mb-2">
                    Verification Details
                  </label>
                  <Textarea
                    value={formData.verificationDetails}
                    onChange={(e) => handleInputChange('verificationDetails', e.target.value)}
                    placeholder="Explain how this resolution was verified..."
                    className="border-concrete-500/30 focus:border-coral-500"
                    required={formData.verified}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUpdateForm(false)}
                  className="border-concrete-500/30 text-stratosphere-900 hover:bg-stratosphere-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || (formData.resolved && !formData.resolution)}
                  className="bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Report content sections */}
      <div className="space-y-6">
        {/* Description */}
        <Card className="border-concrete-500/20">
          <CardHeader>
            <CardTitle className="text-lg text-stratosphere-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-coral-500" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-stratosphere-900 whitespace-pre-line">{report.description}</p>
          </CardContent>
        </Card>

        {/* Feedback-type specific content */}
        {report.feedbackType === 'bug_report' && (
          <>
            {/* Steps to reproduce */}
            {report.steps && (
              <Card className="border-concrete-500/20">
                <CardHeader>
                  <CardTitle className="text-lg text-stratosphere-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-coral-500" />
                    Steps to Reproduce
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-stratosphere-900 whitespace-pre-line">{report.steps}</p>
                </CardContent>
              </Card>
            )}

            {/* Expected vs Actual behavior */}
            {(report.expectedBehavior || report.actualBehavior) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.expectedBehavior && (
                  <Card className="border-concrete-500/20">
                    <CardHeader>
                      <CardTitle className="text-lg text-stratosphere-900">Expected Behavior</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-stratosphere-900 whitespace-pre-line">{report.expectedBehavior}</p>
                    </CardContent>
                  </Card>
                )}
                
                {report.actualBehavior && (
                  <Card className="border-concrete-500/20">
                    <CardHeader>
                      <CardTitle className="text-lg text-stratosphere-900">Actual Behavior</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-stratosphere-900 whitespace-pre-line">{report.actualBehavior}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        {/* User Experience Rating */}
        {report.userExperienceRating && (
          <Card className="border-concrete-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-stratosphere-900 flex items-center gap-2">
                <Heart className="h-5 w-5 text-coral-500" />
                User Experience Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {renderRating(report.userExperienceRating.overallSatisfaction, 'Overall Satisfaction')}
                {report.userExperienceRating.easeOfUse && renderRating(report.userExperienceRating.easeOfUse, 'Ease of Use')}
                {report.userExperienceRating.speed && renderRating(report.userExperienceRating.speed, 'Speed')}
                {report.userExperienceRating.visualAppeal && renderRating(report.userExperienceRating.visualAppeal, 'Visual Appeal')}
                {report.userExperienceRating.functionalityClarity && renderRating(report.userExperienceRating.functionalityClarity, 'Functionality Clarity')}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Suggestion */}
        {report.featureSuggestion && (
          <Card className="border-concrete-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-stratosphere-900 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-coral-500" />
                Feature Suggestion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stratosphere-900 mb-4">{report.featureSuggestion.description}</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-sky-500">Business Value:</span>
                  <Badge className="ml-2 bg-forest-50 text-forest-600 border-forest-500/20">
                    {report.featureSuggestion.businessValue}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-sky-500">User Impact:</span>
                  <Badge className="ml-2 bg-ochre-50 text-ochre-600 border-ochre-500/20">
                    {report.featureSuggestion.userImpact}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-sky-500">Suggested Priority:</span>
                  <Badge className="ml-2 bg-sand-50 text-sand-600 border-sand-500/20">
                    {report.featureSuggestion.suggestedPriority}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Thematic Feedback */}
        {report.thematicFeedback && (
          <Card className="border-concrete-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-stratosphere-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-coral-500" />
                Thematic Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.thematicFeedback.lookAndFeelRating && renderRating(report.thematicFeedback.lookAndFeelRating, 'Look & Feel')}
                {report.thematicFeedback.fontReadability && renderRating(report.thematicFeedback.fontReadability, 'Font Readability')}
                {report.thematicFeedback.layoutIntuitive && renderRating(report.thematicFeedback.layoutIntuitive, 'Layout Intuitive')}
                {report.thematicFeedback.brandConsistency && renderRating(report.thematicFeedback.brandConsistency, 'Brand Consistency')}
                
                {report.thematicFeedback.colorSchemeAppropriate !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-sky-500">Color Scheme Appropriate:</span>
                    <Badge className={report.thematicFeedback.colorSchemeAppropriate ? 'bg-grass-50 text-grass-600' : 'bg-coral-50 text-coral-600'}>
                      {report.thematicFeedback.colorSchemeAppropriate ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                )}
                
                {report.thematicFeedback.specificThematicComments && (
                  <div className="mt-4">
                    <span className="text-sm text-sky-500 block mb-2">Additional Comments:</span>
                    <p className="text-stratosphere-900 bg-stratosphere-50 p-3 rounded-md">
                      {report.thematicFeedback.specificThematicComments}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Impact */}
        {report.businessImpact && (
          <Card className="border-concrete-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-stratosphere-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-coral-500" />
                Business Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.businessImpact.affectedUsers && (
                  <div>
                    <span className="text-sm text-sky-500 block">Affected Users:</span>
                    <Badge className="mt-1 bg-sky-50 text-sky-600 border-sky-500/20">
                      {report.businessImpact.affectedUsers}
                    </Badge>
                  </div>
                )}
                
                <div>
                  <span className="text-sm text-sky-500 block">Functionality Blocked:</span>
                  <Badge className={`mt-1 ${report.businessImpact.functionalityBlocked ? 'bg-coral-50 text-coral-600' : 'bg-grass-50 text-grass-600'}`}>
                    {report.businessImpact.functionalityBlocked ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div>
                  <span className="text-sm text-sky-500 block">Workaround Available:</span>
                  <Badge className={`mt-1 ${report.businessImpact.workaroundAvailable ? 'bg-grass-50 text-grass-600' : 'bg-coral-50 text-coral-600'}`}>
                    {report.businessImpact.workaroundAvailable ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div>
                  <span className="text-sm text-sky-500 block">Revenue Impact:</span>
                  <Badge className={`mt-1 ${report.businessImpact.revenueImpact ? 'bg-coral-50 text-coral-600' : 'bg-grass-50 text-grass-600'}`}>
                    {report.businessImpact.revenueImpact ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div>
                  <span className="text-sm text-sky-500 block">Compliance Impact:</span>
                  <Badge className={`mt-1 ${report.businessImpact.complianceImpact ? 'bg-coral-50 text-coral-600' : 'bg-grass-50 text-grass-600'}`}>
                    {report.businessImpact.complianceImpact ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Source of Feedback */}
        {report.sourceOfFeedback && (
          <Card className="border-concrete-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-stratosphere-900 flex items-center gap-2">
                <User className="h-5 w-5 text-coral-500" />
                Source of Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-sky-500 block">Source:</span>
                  <p className="text-stratosphere-900">{report.sourceOfFeedback.source}</p>
                </div>
                {report.sourceOfFeedback.contactPerson && (
                  <div>
                    <span className="text-sm text-sky-500 block">Contact Person:</span>
                    <p className="text-stratosphere-900">{report.sourceOfFeedback.contactPerson}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attachments */}
        {report.attachments && report.attachments.length > 0 && (
          <Card className="border-concrete-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-stratosphere-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-coral-500" />
                Attachments ({report.attachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-stratosphere-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-sky-50 text-sky-600 border-sky-500/20">
                        {attachment.type}
                      </Badge>
                      <span className="text-sm text-stratosphere-900">{attachment.filename}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-sky-500">
                        {formatDate(attachment.uploadedAt)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-coral-500/30 text-coral-500 hover:bg-coral-50"
                        onClick={() => {
                          setSelectedAttachment(attachment);
                          setShowAttachmentModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Screenshot (legacy support) */}
        {report.screenshot && (
          <Card className="border-concrete-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-stratosphere-900 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-coral-500" />
                Screenshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-concrete-500/20 rounded-md overflow-hidden">
                <img 
                  src={report.screenshot} 
                  alt="Bug report screenshot" 
                  className="w-full h-auto object-contain max-h-96"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics */}
        {report.metrics && (
          <Card className="border-concrete-500/20">
            <CardHeader>
              <CardTitle className="text-lg text-stratosphere-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-coral-500" />
                Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-sky-500 block">Views:</span>
                  <span className="text-lg font-semibold text-stratosphere-900">{report.metrics.viewCount}</span>
                </div>
                <div>
                  <span className="text-sm text-sky-500 block">Comments:</span>
                  <span className="text-lg font-semibold text-stratosphere-900">{report.metrics.commentCount}</span>
                </div>
                {report.metrics.timeToFirstResponse && (
                  <div>
                    <span className="text-sm text-sky-500 block">First Response:</span>
                    <span className="text-lg font-semibold text-stratosphere-900">{report.metrics.timeToFirstResponse}h</span>
                  </div>
                )}
                {report.metrics.timeToResolution && (
                  <div>
                    <span className="text-sm text-sky-500 block">Time to Resolution:</span>
                    <span className="text-lg font-semibold text-stratosphere-900">{report.metrics.timeToResolution}h</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System information toggle */}
        <Card className="border-concrete-500/20">
          <CardHeader>
            <div 
              onClick={() => setShowSystemInfo(!showSystemInfo)}
              className="flex items-center justify-between cursor-pointer"
            >
              <CardTitle className="text-lg text-stratosphere-900 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-coral-500" />
                System Information
              </CardTitle>
              {showSystemInfo ? (
                <ChevronUp className="h-5 w-5 text-sky-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-sky-500" />
              )}
            </div>
          </CardHeader>
          
          {showSystemInfo && (
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-sky-500 block mb-1">User Information:</span>
                    <div className="space-y-1 text-sm">
                      <div><strong>Name:</strong> {report.systemInfo.userName || 'Anonymous'}</div>
                      {report.systemInfo.userEmail && (
                        <div><strong>Email:</strong> {report.systemInfo.userEmail}</div>
                      )}
                      {report.systemInfo.userId && (
                        <div><strong>User ID:</strong> {report.systemInfo.userId}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-sky-500 block mb-1">Device Information:</span>
                    <div className="space-y-1 text-sm">
                      <div><strong>Platform:</strong> {report.systemInfo.platform}</div>
                      <div><strong>Screen Size:</strong> {report.systemInfo.screenSize}</div>
                      {report.systemInfo.deviceType && (
                        <div><strong>Device Type:</strong> {report.systemInfo.deviceType}</div>
                      )}
                      {report.systemInfo.connectionSpeed && (
                        <div><strong>Connection:</strong> {report.systemInfo.connectionSpeed}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-sky-500 block mb-1">Page Information:</span>
                  <div className="space-y-1 text-sm">
                    <div><strong>URL:</strong> <span className="break-all">{report.systemInfo.url}</span></div>
                    <div><strong>Pathname:</strong> {report.systemInfo.pathname}</div>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-sky-500 block mb-1">Browser Information:</span>
                  <div className="bg-stratosphere-50 p-3 rounded-md">
                    <div className="text-xs font-mono break-all">{report.systemInfo.userAgent}</div>
                  </div>
                  {report.systemInfo.browserVersion && (
                    <div className="mt-2 text-sm"><strong>Version:</strong> {report.systemInfo.browserVersion}</div>
                  )}
                  {report.systemInfo.osVersion && (
                    <div className="text-sm"><strong>OS Version:</strong> {report.systemInfo.osVersion}</div>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Resolution info if resolved */}
        {report.resolved && (
          <Card className="border-grass-500/20 bg-grass-50/30">
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <Check className="h-5 w-5 text-grass-600 mr-2" />
                <h3 className="text-lg font-medium text-grass-800">Resolved</h3>
              </div>
              
              {report.resolvedAt && (
                <div className="text-sm text-grass-700 mb-3">
                  Resolved on {formatDate(report.resolvedAt)}
                  {report.resolvedBy && ` by ${report.resolvedBy.name}`}
                </div>
              )}
              
              {report.resolution && (
                <div>
                  <h4 className="text-sm font-medium text-grass-800 mb-2">Resolution Details</h4>
                  <p className="text-sm text-grass-700 whitespace-pre-line bg-white p-3 rounded-md border border-grass-500/20">
                    {report.resolution}
                  </p>
                </div>
              )}
              
              {!report.verifiedByReporter && (
                <div className="mt-3 p-3 bg-ochre-50 border border-ochre-500/20 rounded-md">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-ochre-600 mr-2" />
                    <span className="text-sm text-ochre-700">Pending verification by reporter</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* NEW: Verification info if verified */}
        {report.verified && report.verificationDetails && (
          <Card className="border-emerald-500/20 bg-emerald-50/30">
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <Check className="h-5 w-5 text-emerald-600 mr-2" />
                <Check className="h-5 w-5 text-emerald-600 mr-2" />
                <h3 className="text-lg font-medium text-emerald-800">Verified</h3>
              </div>
              
              {report.verifiedAt && (
                <div className="text-sm text-emerald-700 mb-3">
                  Verified on {formatDate(report.verifiedAt)}
                  {report.verifiedBy && ` by ${report.verifiedBy.name}`}
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-emerald-800 mb-2">Verification Details</h4>
                <p className="text-sm text-emerald-700 whitespace-pre-line bg-white p-3 rounded-md border border-emerald-500/20">
                  {report.verificationDetails}
                </p>
              </div>
              
              <div className="mt-3 p-3 bg-emerald-100 border border-emerald-500/20 rounded-md">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-emerald-600 mr-2" />
                  <span className="text-sm text-emerald-700">This bug has been successfully resolved and verified.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* NEW: Attachment Modal */}
      {selectedAttachment && (
        <AttachmentModal
          attachment={selectedAttachment}
          isOpen={showAttachmentModal}
          onClose={() => {
            setShowAttachmentModal(false);
            setSelectedAttachment(null);
          }}
        />
      )}
    </div>
  );
};

export default BugReportDetail;