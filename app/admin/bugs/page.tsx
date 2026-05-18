// app/admin/bugs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  X, 
  Bug,
  Star,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  Filter,
  Search,
  Eye,
  ChevronRight,
  Flag,
  Calendar,
  User,
  Tag,
  BarChart3,
  Zap,
  Heart,
  Lightbulb,
  MessageSquare,
  FileText,
  Target
} from 'lucide-react';

import BugReportList from '@/components/admin/bugs/BugReportList';
import BugReportFilters from '@/components/admin/bugs/BugReportFilters';
import BugReportDetail from '@/components/admin/bugs/BugReportDetail';
import { getBugReports, getBugReport, updateBugReport } from '@/lib/api/bugReport';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Enhanced Types based on the model
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

export interface BugReport {
  _id: string;
  feedbackType: 'bug_report' | 'user_experience' | 'thematic_feedback' | 'feature_suggestion' | 'general_feedback';
  title: string;
  
  // UPDATED: New status options with 'verified'
  status: 'new' | 'triaged' | 'resolved' | 'cannot-reproduce' | 'duplicate' | 'deferred';  
  
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
  // NEW: Verification fields (separate from resolution)
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: {
    _id: string;
    name: string;
  };
  verificationDetails?: string;
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
    timeToVerification?: number; // NEW
    reopenCount: number;
  };
}



interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface Filters {
  search: string;
  feedbackType: string;
  status: string;
  priority: string;
  urgencyLevel: string;
  category: string;
  bugType: string;
  affectedUsers: string;
  assignedToTeamMember: string; // NEW
  verificationStatus: string; // NEW
}

const BugReportsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  const [filters, setFilters] = useState<Filters>({
    search: '',
    feedbackType: 'all',
    status: 'all',
    priority: 'all',
    urgencyLevel: 'all',
    category: 'all',
    bugType: 'all',
    affectedUsers: 'all',
    assignedToTeamMember: 'all', // NEW
    verificationStatus: 'all' // NEW
  });

  // Load bug reports on initial page load and when filters change
  useEffect(() => {
    const fetchBugReports = async () => {
      setLoading(true);
      try {
        const queryParams = {
          page: pagination.page,
          limit: pagination.limit,
          search: filters.search || undefined,
          feedbackType: filters.feedbackType === 'all' ? undefined : filters.feedbackType,
          status: filters.status === 'all' ? undefined : filters.status,
          priority: filters.priority === 'all' ? undefined : filters.priority,
          urgencyLevel: filters.urgencyLevel === 'all' ? undefined : filters.urgencyLevel,
          category: filters.category === 'all' ? undefined : filters.category,
          bugType: filters.bugType === 'all' ? undefined : filters.bugType,
          affectedUsers: filters.affectedUsers === 'all' ? undefined : filters.affectedUsers,
          assignedToTeamMember: filters.assignedToTeamMember === 'all' ? undefined : filters.assignedToTeamMember, // NEW
          verificationStatus: filters.verificationStatus === 'all' ? undefined : filters.verificationStatus, // NEW
          sortBy: 'createdAt',
          sortOrder: 'desc' as const
        };
        
        const result = await getBugReports(queryParams);
        
        setBugReports(result.data);
        setPagination(result.pagination);
      } catch (error) {
        console.error('Failed to fetch bug reports:', error);
        // Show an error toast here
      } finally {
        setLoading(false);
      }
    };

    fetchBugReports();
  }, [pagination.page, pagination.limit, filters]);

  // Load a specific bug report when selected
  const loadBugReport = async (id: string) => {
    setDetailLoading(true);
    try {
      const report = await getBugReport(id);
      setSelectedReport(report.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch bug report details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle report selection
  const handleSelectReport = (report: BugReport) => {
    loadBugReport(report._id);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when filters change
  };

  // Handle closing the detail panel
  const handleCloseDetail = () => {
    setSelectedReport(null);
    setIsModalOpen(false);
  };

  // Handle bug report update
  const handleBugReportUpdate = async (updatedReport: BugReport) => {
    // Refresh the list after update
    const queryParams = {
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search || undefined,
      feedbackType: filters.feedbackType === 'all' ? undefined : filters.feedbackType,
      status: filters.status === 'all' ? undefined : filters.status,
      priority: filters.priority === 'all' ? undefined : filters.priority,
      urgencyLevel: filters.urgencyLevel === 'all' ? undefined : filters.urgencyLevel,
      category: filters.category === 'all' ? undefined : filters.category,
      bugType: filters.bugType === 'all' ? undefined : filters.bugType,
      affectedUsers: filters.affectedUsers === 'all' ? undefined : filters.affectedUsers,
      assignedToTeamMember: filters.assignedToTeamMember === 'all' ? undefined : filters.assignedToTeamMember, // NEW
      verificationStatus: filters.verificationStatus === 'all' ? undefined : filters.verificationStatus, // NEW
      sortBy: 'createdAt',
      sortOrder: 'desc' as const
    };
    
    const result = await getBugReports(queryParams);
    setBugReports(result.data);
    
    // Update the selected report if it's still selected
    if (selectedReport && selectedReport._id === updatedReport._id) {
      setSelectedReport(updatedReport);
    }
  };

  // Helper functions for styling
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
    <div className="min-h-screen bg-stratosphere-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-concrete-500/20 shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-stratosphere-900 flex items-center gap-3">
                <Bug className="h-6 w-6 text-coral-500" />
                Bug Reports & Feedback
              </h1>
              <p className="text-sm text-sky-500 mt-1">
                Manage bug reports, user feedback, and feature suggestions
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-sky-500">
                {pagination.total} total reports
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-lg border border-concrete-500/20 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
              <Input
                placeholder="Search reports..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 border-concrete-500/30 focus:border-coral-500 focus:ring-coral-500/20"
              />
            </div>
            
            <Select value={filters.feedbackType} onValueChange={(value) => handleFilterChange('feedbackType', value)}>
              <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
                <SelectValue placeholder="Feedback Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bug_report">Bug Reports</SelectItem>
                <SelectItem value="user_experience">User Experience</SelectItem>
                <SelectItem value="thematic_feedback">Thematic Feedback</SelectItem>
                <SelectItem value="feature_suggestion">Feature Suggestions</SelectItem>
                <SelectItem value="general_feedback">General Feedback</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="triaged">Triaged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="cannot-reproduce">Cannot Reproduce</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
                <SelectItem value="deferred">Deferred</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
              <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="p0">P0 - Critical</SelectItem>
                <SelectItem value="p1">P1 - High</SelectItem>
                <SelectItem value="p2">P2 - Medium</SelectItem>
                <SelectItem value="p3">P3 - Low</SelectItem>
                <SelectItem value="p4">P4 - Backlog</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={filters.urgencyLevel} onValueChange={(value) => handleFilterChange('urgencyLevel', value)}>
              <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
                <SelectValue placeholder="Turnaround Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Turnaround Times</SelectItem>
                <SelectItem value="fix_24_hours">Fix within 24 hours</SelectItem>
                <SelectItem value="fix_1_3_days">Fix within 1-3 days</SelectItem>
                <SelectItem value="fix_this_week">Fix within this week</SelectItem>
                <SelectItem value="fix_2_weeks">Fix within 2 weeks</SelectItem>
                <SelectItem value="fix_next_month">Fix within next month</SelectItem>
                <SelectItem value="later">Later</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.bugType} onValueChange={(value) => handleFilterChange('bugType', value)}>
              <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fix">Fix</SelectItem>
                <SelectItem value="food_for_thought">Food for Thought</SelectItem>
                <SelectItem value="pipeline">Pipeline</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.affectedUsers} onValueChange={(value) => handleFilterChange('affectedUsers', value)}>
              <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
                <SelectValue placeholder="Affected Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All User Groups</SelectItem>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="most">Most Users</SelectItem>
                <SelectItem value="many">Many Users</SelectItem>
                <SelectItem value="some">Some Users</SelectItem>
                <SelectItem value="few">Few Users</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.assignedToTeamMember} onValueChange={(value) => handleFilterChange('assignedToTeamMember', value)}>
              <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
                <SelectValue placeholder="Team Member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Team Members</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>  {/* CHANGED TO NON-EMPTY STRING */}
                <SelectItem value="kate">Kate</SelectItem>
                <SelectItem value="sam">Sam</SelectItem>
                <SelectItem value="belinda">Belinda</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.verificationStatus} onValueChange={(value) => handleFilterChange('verificationStatus', value)}>
              <SelectTrigger className="border-concrete-500/30 focus:border-coral-500">
                <SelectValue placeholder="Verification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification States</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved_unverified">Resolved - Awaiting Verification</SelectItem>
                <SelectItem value="resolved_verified">Resolved & Verified</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setFilters({
                search: '',
                feedbackType: 'all',
                status: 'all',
                priority: 'all',
                urgencyLevel: 'all',
                category: 'all',
                bugType: 'all',
                affectedUsers: 'all',
                assignedToTeamMember: 'all', // NEW
                verificationStatus: 'all' // NEW
              })}
              className="border-coral-500/30 text-coral-500 hover:bg-coral-50"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg border border-concrete-500/20 shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-coral-500 animate-spin" />
              <span className="ml-3 text-stratosphere-900 font-medium">Loading reports...</span>
            </div>
          ) : bugReports.length === 0 ? (
            <div className="text-center py-12">
              <Bug className="h-12 w-12 text-concrete-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stratosphere-900 mb-2">No Reports Found</h3>
              <p className="text-sky-500 mb-4">
                No bug reports match your current filters
              </p>
              <Button
                onClick={() => setFilters({
                  search: '',
                  feedbackType: 'all',
                  status: 'all',
                  priority: 'all',
                  urgencyLevel: 'all',
                  category: 'all',
                  bugType: 'all',
                  affectedUsers: 'all',
                  assignedToTeamMember: 'all', // NEW
                  verificationStatus: 'all' // NEW
                })}
                className="bg-coral-500 hover:bg-coral-600 text-white"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {bugReports.map((report) => (
                  <Card 
                    key={report._id}
                    className="border border-concrete-500/20 hover:border-coral-500/50 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleSelectReport(report)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {getFeedbackTypeIcon(report.feedbackType)}
                              <Badge className={`text-xs ${getFeedbackTypeColor(report.feedbackType)}`}>
                                {report.feedbackType.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            
                            <Badge className={`text-xs ${getPriorityColor(report.priority)}`}>
                              {report.priority.toUpperCase()}
                            </Badge>
                            
                            <Badge className={`text-xs ${getStatusColor(report.status)}`}>
                              {report.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                            
                            {report.requiresFollowUp && (
                              <Badge className="text-xs bg-ochre-50 text-ochre-600 border-ochre-500/20">
                                Follow-up Required
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-stratosphere-900 mb-2 leading-relaxed">
                            {report.title}
                          </h4>
                          
                          <p className="text-sm text-sky-500 mb-3 line-clamp-2">
                            {report.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-sky-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                            
                            {report.reporter && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {report.reporter.name}
                              </div>
                            )}
                            
                            {report.businessImpact?.affectedUsers && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {report.businessImpact.affectedUsers} users
                              </div>
                            )}
                            
                            {report.bugType && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {report.bugType} type
                              </div>
                            )}
                            
                            {report.overallScore && (
                              <div className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                Score: {report.overallScore}
                              </div>
                            )}
                          </div>
                          
                          {report.tags && report.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-3">
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
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
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
                          
                          <ChevronRight className="h-4 w-4 text-concrete-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-concrete-500/20">
                  <div className="text-sm text-sky-500">
                    Page {pagination.page} of {pagination.totalPages} • {pagination.total} total reports
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="border-coral-500/30 text-coral-500 hover:bg-coral-50 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasMore}
                      className="border-coral-500/30 text-coral-500 hover:bg-coral-50 disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stratosphere-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Modal Content */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-concrete-500/20">
              <div className="flex items-center gap-3">
                {selectedReport && getFeedbackTypeIcon(selectedReport.feedbackType)}
                <h2 className="text-xl font-semibold text-stratosphere-900">
                  {selectedReport?.feedbackType.replace('_', ' ').toUpperCase()} Details
                </h2>
                {selectedReport && (
                  <Badge className={`${getFeedbackTypeColor(selectedReport.feedbackType)}`}>
                    {selectedReport.feedbackType.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDetail}
                className="text-sky-500 hover:text-stratosphere-900 hover:bg-stratosphere-50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {detailLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 text-coral-500 animate-spin" />
                  <span className="ml-3 text-stratosphere-900 font-medium">Loading details...</span>
                </div>
              ) : selectedReport ? (
                <BugReportDetail 
                  report={selectedReport}
                  onClose={handleCloseDetail}
                  onUpdate={handleBugReportUpdate}
                />
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sky-500">No report selected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BugReportsPage;