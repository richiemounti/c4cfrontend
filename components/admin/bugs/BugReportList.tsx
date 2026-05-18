// components/admin/bugs/BugReportList.tsx
import { FC } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  HelpCircle, 
  XCircle,
  Bug,
  Heart,
  Star,
  Lightbulb,
  MessageSquare,
  FileText,
  Users,
  Calendar,
  User,
  Flag,
  Tag,
  BarChart3,
  Eye,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface SystemInfo {
    url: string;
    pathname: string;
    userAgent: string;
    platform: string;
    screenSize: string;
    timestamp: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    connectionSpeed?: string;
    browserVersion?: string;
    osVersion?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
}

interface UserExperienceRating {
  overallSatisfaction: number;
  easeOfUse?: number;
  speed?: number;
  visualAppeal?: number;
  functionalityClarity?: number;
}

interface FeatureSuggestion {
  description: string;
  businessValue: 'low' | 'medium' | 'high';
  userImpact: 'low' | 'medium' | 'high';
  suggestedPriority: 'low' | 'medium' | 'high';
}

// Updated Interface Types for Admin Components
// Use this in all your admin bug report files

interface BugReport {
  _id: string;
  feedbackType: 'bug_report' | 'user_experience' | 'thematic_feedback' | 'feature_suggestion' | 'general_feedback';
  title: string;
  
  // UPDATED: New status options with 'verified'
  status: 'new' | 'triaged' | 'resolved' | 'verified' | 'cannot-reproduce' | 'duplicate' | 'deferred';
  
  priority: 'p0' | 'p1' | 'p2' | 'p3' | 'p4';
  
  // UPDATED: New urgency levels with timeframes
  urgencyLevel: 'fix_24_hours' | 'fix_1_3_days' | 'fix_this_week' | 'fix_2_weeks' | 'fix_next_month' | 'later';
  
  category: string;
  subCategory?: string;
  
  // NEW FIELDS
  assignedToTeamMember?: 'kate' | 'sam' | 'belinda';
  sourceOfFeedback?: {
    source: string;
    contactPerson?: string;
  };
  
  systemInfo: SystemInfo;
  createdAt: string;
  description: string;
  steps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  userExperienceRating?: UserExperienceRating;
  featureSuggestion?: FeatureSuggestion;
  thematicFeedback?: {
    lookAndFeelRating?: number;
    colorSchemeAppropriate?: boolean;
    fontReadability?: number;
    layoutIntuitive?: number;
    brandConsistency?: number;
    specificThematicComments?: string;
  };
  businessImpact?: {
    affectedUsers?: 'few' | 'some' | 'many' | 'most' | 'all';
    functionalityBlocked?: boolean;
    workaroundAvailable?: boolean;
    revenueImpact?: boolean;
    complianceImpact?: boolean;
  };
  
  // UPDATED: New type field instead of estimated effort
  bugType?: 'fix' | 'food_for_thought' | 'pipeline';
  
  screenshot?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    type: 'screenshot' | 'video' | 'document' | 'log_file' | 'other';
    uploadedAt: string;
  }>;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: {
    _id: string;
    name: string;
  };
  resolution?: string;
  assignedTo?: {
    _id: string;
    name: string;
  };
  reporter?: {
    _id: string;
    name: string;
  };
  tags: string[];
  requiresFollowUp: boolean;
  followUpDate?: string;
  verifiedByReporter: boolean;
  updatedAt: string;
  overallScore: number;
  metrics: {
    viewCount: number;
    commentCount: number;
    timeToFirstResponse?: number;
    timeToResolution?: number;
    reopenCount: number;
  };
}


interface BugReportListProps {
  bugReports: BugReport[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onSelectReport: (report: BugReport) => void;
  selectedReportId?: string;
}

const BugReportList: FC<BugReportListProps> = ({
  bugReports,
  pagination,
  onPageChange,
  onSelectReport,
  selectedReportId
}) => {
  // Get feedback type icon
  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'bug_report': return <Bug className="h-4 w-4" />;
      case 'user_experience': return <Heart className="h-4 w-4" />;
      case 'thematic_feedback': return <Star className="h-4 w-4" />;
      case 'feature_suggestion': return <Lightbulb className="h-4 w-4" />;
      case 'general_feedback': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Get feedback type color
  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case 'bug_report': return 'bg-coral-50 text-coral-500 border-coral-500/20';
      case 'user_experience': return 'bg-ochre-50 text-ochre-500 border-ochre-500/20';
      case 'thematic_feedback': return 'bg-sand-50 text-sand-500 border-sand-500/20';
      case 'feature_suggestion': return 'bg-forest-50 text-forest-500 border-forest-500/20';
      case 'general_feedback': return 'bg-sky-50 text-sky-500 border-sky-500/20';
      default: return 'bg-concrete-50 text-concrete-500 border-concrete-500/20';
    }
  };

  // Status badge component with custom theming
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'new': return 'bg-coral-50 text-coral-600 border-coral-500/20';
        case 'triaged': return 'bg-ochre-50 text-ochre-600 border-ochre-500/20';
        case 'resolved': return 'bg-grass-50 text-grass-600 border-grass-500/20';
        case 'verified': return 'bg-emerald-50 text-emerald-600 border-emerald-500/20'; // NEW
        case 'cannot-reproduce': return 'bg-concrete-50 text-concrete-600 border-concrete-500/20';
        case 'duplicate': return 'bg-sand-50 text-sand-600 border-sand-500/20';
        case 'deferred': return 'bg-stratosphere-50 text-stratosphere-600 border-stratosphere-500/20';
        default: return 'bg-concrete-50 text-concrete-600 border-concrete-500/20';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'new': return <AlertCircle className="h-3 w-3" />;
        case 'triaged': return <Flag className="h-3 w-3" />;
        case 'resolved': return <CheckCircle className="h-3 w-3" />;
        case 'verified': return <CheckCircle className="h-3 w-3" />; // NEW
        case 'cannot-reproduce': return <HelpCircle className="h-3 w-3" />;
        case 'duplicate': return <XCircle className="h-3 w-3" />;
        case 'deferred': return <Clock className="h-3 w-3" />;
        default: return <Clock className="h-3 w-3" />;
      }
    };

    return (
      <Badge className={`${getStatusColor(status)} border flex items-center gap-1`}>
        {getStatusIcon(status)}
        {status.replace(/-/g, ' ')}
      </Badge>
    );
  };

  const getUrgencyDisplay = (urgencyLevel: string) => {
    const urgencyLabels = {
      'fix_24_hours': '🚨 24H',
      'fix_1_3_days': '⚠️ 1-3D',
      'fix_this_week': '📅 1W',
      'fix_2_weeks': '📆 2W',
      'fix_next_month': '🗓️ 1M',
      'later': '⏰ Later'
    };
    return urgencyLabels[urgencyLevel as keyof typeof urgencyLabels] || urgencyLevel;
  };

  const getTypeDisplay = (type: string) => {
    const typeLabels = {
      'fix': '🔧 Fix',
      'food_for_thought': '💭 Idea',
      'pipeline': '🚀 Pipeline'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
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
      <Badge className={`${getPriorityColor(priority)} border font-semibold`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {bugReports.length === 0 ? (
        <div className="text-center py-12">
          <Bug className="h-12 w-12 text-concrete-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stratosphere-900 mb-2">No Reports Found</h3>
          <p className="text-sky-500">No bug reports match your current filters.</p>
        </div>
      ) : (
        <>
          {/* Reports Grid */}
          <div className="space-y-4">
            {bugReports.map((report) => (
              <Card 
                key={report._id}
                className={`border transition-all cursor-pointer hover:shadow-md ${
                  selectedReportId === report._id
                    ? 'border-coral-500 bg-coral-50/30 shadow-sm'
                    : 'border-concrete-500/20 hover:border-coral-500/50 hover:bg-stratosphere-50/30'
                }`}
                onClick={() => onSelectReport(report)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header with badges */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          {getFeedbackTypeIcon(report.feedbackType)}
                          <Badge className={`text-xs ${getFeedbackTypeColor(report.feedbackType)}`}>
                            {report.feedbackType.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <PriorityBadge priority={report.priority} />
                        <StatusBadge status={report.status} />
                        
                        {report.urgencyLevel !== 'fix_this_week' && (
                          <Badge className="text-xs bg-ochre-50 text-ochre-600 border-ochre-500/20">
                            {getUrgencyDisplay(report.urgencyLevel)}
                          </Badge>
                        )}
                        
                        {report.assignedToTeamMember && (
                          <Badge className="text-xs bg-purple-50 text-purple-600 border-purple-500/20">
                            {report.assignedToTeamMember.charAt(0).toUpperCase() + report.assignedToTeamMember.slice(1)}
                          </Badge>
                        )}
                        
                        {report.requiresFollowUp && (
                          <Badge className="text-xs bg-coral-50 text-coral-600 border-coral-500/20">
                            Follow-up
                          </Badge>
                        )}
                      </div>
                      
                      {/* Title and description */}
                      <h4 className="font-semibold text-stratosphere-900 mb-2 leading-relaxed text-lg">
                        {report.title}
                      </h4>
                      
                      <p className="text-sm text-sky-500 mb-4 line-clamp-2">
                        {report.description}
                      </p>
                      
                      {/* Metadata row */}
                      <div className="flex items-center gap-6 text-xs text-sky-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                        </div>
                        
                        {report.reporter && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {report.reporter.name}
                          </div>
                        )}
                        
                        {report.sourceOfFeedback && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Source: {report.sourceOfFeedback.source}
                          </div>
                        )}
                        
                        {report.businessImpact?.affectedUsers && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {report.businessImpact.affectedUsers} users affected
                          </div>
                        )}
                        
                        {report.bugType && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTypeDisplay(report.bugType)}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          Score: {report.overallScore}
                        </div>
                      </div>
                      
                      {/* Additional info based on feedback type */}
                      {report.feedbackType === 'user_experience' && report.userExperienceRating && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-sky-500">Overall Satisfaction:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= report.userExperienceRating!.overallSatisfaction 
                                    ? 'text-ochre-500 fill-ochre-500' 
                                    : 'text-concrete-500'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-stratosphere-900 font-medium">
                            {report.userExperienceRating.overallSatisfaction}/5
                          </span>
                        </div>
                      )}

                      {/* Feature suggestion info */}         
                      {report.feedbackType === 'feature_suggestion' && report.featureSuggestion && (
                        <div className="flex items-center gap-4 mb-3 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-sky-500">Business Value:</span>
                            <Badge className="bg-forest-50 text-forest-600 border-forest-500/20 text-xs">
                              {report.featureSuggestion.businessValue}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sky-500">User Impact:</span>
                            <Badge className="bg-ochre-50 text-ochre-600 border-ochre-500/20 text-xs">
                              {report.featureSuggestion.userImpact}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Source of feedback info */}
                      {report.sourceOfFeedback && (
                        <div className="flex items-center gap-2 mb-3 text-xs">
                          <span className="text-sky-500">Source:</span>
                          <Badge className="bg-blue-50 text-blue-600 border-blue-500/20 text-xs">
                            {report.sourceOfFeedback.source}
                          </Badge>
                          {report.sourceOfFeedback.contactPerson && (
                            <>
                              <span className="text-sky-500">Contact:</span>
                              <span className="text-stratosphere-900 font-medium">
                                {report.sourceOfFeedback.contactPerson}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {/* Tags */}
                      {report.tags && report.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="h-3 w-3 text-sky-500" />
                          <div className="flex flex-wrap gap-1">
                            {report.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-concrete-500/30 text-stratosphere-900">
                                {tag}
                              </Badge>
                            ))}
                            {report.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs border-coral-500/30 text-coral-500">
                                +{report.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Business impact indicators */}
                      {report.businessImpact && (
                        <div className="flex items-center gap-3 text-xs">
                          {report.businessImpact.functionalityBlocked && (
                            <Badge className="bg-coral-50 text-coral-600 border-coral-500/20">
                              Functionality Blocked
                            </Badge>
                          )}
                          {report.businessImpact.revenueImpact && (
                            <Badge className="bg-sand-50 text-sand-600 border-sand-500/20">
                              Revenue Impact
                            </Badge>
                          )}
                          {report.businessImpact.complianceImpact && (
                            <Badge className="bg-ochre-50 text-ochre-600 border-ochre-500/20">
                              Compliance Impact
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Right side indicators */}
                    <div className="flex flex-col items-end gap-2 ml-6">
                      {report.attachments && report.attachments.length > 0 && (
                        <div className="text-xs text-sky-500 flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {report.attachments.length}
                        </div>
                      )}
                      
                      {report.metrics?.commentCount > 0 && (
                        <div className="text-xs text-sky-500 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {report.metrics.commentCount}
                        </div>
                      )}
                      
                      {report.metrics?.viewCount > 0 && (
                        <div className="text-xs text-sky-500 flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {report.metrics.viewCount}
                        </div>
                      )}
                      
                      <ChevronRightIcon className="h-5 w-5 text-concrete-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enhanced Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-lg border border-concrete-500/20 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-sky-500">
                  Showing {bugReports.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  <span className="font-semibold text-stratosphere-900">{pagination.total}</span> reports
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="border-coral-500/30 text-coral-500 hover:bg-coral-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  {/* Page numbers for smaller total pages */}
                  {pagination.totalPages <= 7 && (
                    <div className="flex gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={pagination.page === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => onPageChange(page)}
                          className={
                            pagination.page === page
                              ? 'bg-coral-500 hover:bg-coral-600 text-white'
                              : 'border-coral-500/30 text-coral-500 hover:bg-coral-50'
                          }
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Simplified pagination for larger total pages */}
                  {pagination.totalPages > 7 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-sky-500">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={!pagination.hasMore}
                    className="border-coral-500/30 text-coral-500 hover:bg-coral-50 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BugReportList;