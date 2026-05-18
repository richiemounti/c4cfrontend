// Updated survey details page
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Copy, 
  Share2, 
  Play, 
  Pause, 
  Eye, 
  Download, 
  BarChart3, 
  Users, 
  Clock, 
  FileText, 
  Settings,
  CheckCircle,
  XCircle,
  PauseCircle,
  GitBranch,
  Calendar,
  MapPin,
  Target,
  TrendingUp,
  Activity,
  AlertCircle,
  FileCheck,
  Plus,
  Languages
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { SurveyPreviewModal } from '@/components/survey/SurveyPreviewModal';
import { SurveyShareModal } from '@/components/survey/SurveyShareModal';
import { SamplingCalculator } from '@/components/survey/SamplingCalculator';
import { useSurvey, useSurveyResponse, useSurveyStructure } from '@/hooks/useSurvey';
import * as surveyApi from '@/lib/api/survey';
import { getReviewsByModuleItem } from '@/lib/api/reviews';
import ReviewDetailModal from '@/components/reviews/modals/ReviewDetailModal';
import { useToast } from "@/hooks/use-toast";

interface PageParams {
  id: string;
  surveyId: string;
}

const SurveyDetailsPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { id: projectId, surveyId } = params;
  
  const { survey, loading, error, fetchSurvey } = useSurvey(surveyId);
  const { structure, loading: structureLoading, fetchStructure } = useSurveyStructure(surveyId);
  const { responses, statistics, fetchResponses, fetchStatistics } = useSurveyResponse(surveyId);
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Review state
  const [surveyReview, setSurveyReview] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (surveyId) {
      fetchSurvey();
      fetchStructure();
      fetchResponses();
      fetchStatistics();
      fetchSurveyReview();
    }
  }, [surveyId]);

  const fetchSurveyReview = async () => {
    setReviewLoading(true);
    try {
      const response = await getReviewsByModuleItem('survey', surveyId);
      if (response.success && response.data && response.data.length > 0) {
        setSurveyReview(response.data[0]);
      }
    } catch (err) {
      // Non-fatal
    } finally {
      setReviewLoading(false);
    }
  };

  // All your existing helper functions remain the same...
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-5 w-5 text-coral-500" />;
      case 'draft': return <PauseCircle className="h-5 w-5 text-ochre-500" />;
      case 'closed': return <XCircle className="h-5 w-5 text-concrete-500" />;
      default: return <Clock className="h-5 w-5 text-sky-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-coral-50 text-coral-500 border-coral-500/20';
      case 'draft': return 'bg-ochre-50 text-ochre-500 border-ochre-500/20';
      case 'closed': return 'bg-concrete-50 text-concrete-500 border-concrete-500/20';
      default: return 'bg-sky-50 text-sky-500 border-sky-500/20';
    }
  };

  const handlePublishSurvey = async () => {
    if (!survey) return;
    
    // Check if survey has questions
    const totalQuestions = getTotalQuestions();
    if (totalQuestions === 0) {
      toast({
        title: 'Cannot publish',
        description: 'Add at least one question before publishing',
        variant: 'destructive',
      });
      return;
    }
    
    setActionLoading('publish');
    try {
      await surveyApi.publishSurvey(surveyId);
      await fetchSurvey();
      toast({
        title: 'Success',
        description: 'Survey published successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish survey',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseSurvey = async () => {
    if (!survey) return;
    
    setActionLoading('close');
    try {
      await surveyApi.closeSurvey(surveyId);
      await fetchSurvey();
      toast({
        title: 'Success',
        description: 'Survey closed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to close survey',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloneSurvey = async () => {
    if (!survey) return;
    
    setActionLoading('clone');
    try {
      const response = await surveyApi.cloneSurvey(surveyId, {
        title: `${survey.title} (Copy)`
      });
      toast({
        title: 'Success',
        description: 'Survey cloned successfully',
      });
      router.push(`/dashboard/project/${projectId}/surveys/${response.data._id}/edit`);
    } catch (error) {
      console.error('Clone error:', error);
      toast({
        title: 'Error',
        description: 'Failed to clone survey',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getTotalQuestions = () => {
    if (!structure) return survey?.totalQuestions || 0;
    
    const sectionQuestions = structure.sections?.reduce((total: number, section: any) => {
      return total + (section.questions?.length || 0);
    }, 0) || 0;
    
    const noSectionQuestions = structure.noSectionQuestions?.length || 0;
    return sectionQuestions + noSectionQuestions;
  };

  const getEstimatedDuration = () => {
    const questionCount = getTotalQuestions();
    const estimatedPerQuestion = 1.5;
    return Math.ceil(questionCount * estimatedPerQuestion);
  };

  // Your existing helper functions...
  const getStakeholderName = (stakeholderGroup: any): string => {
    if (!stakeholderGroup) return 'Unknown';
    if (typeof stakeholderGroup === 'string') return 'Stakeholder Group';
    return stakeholderGroup.name || 'Unknown';
  };

  const getStageNumber = (theoryOfChangeStage: any): number => {
    if (!theoryOfChangeStage) return 0;
    if (typeof theoryOfChangeStage === 'string') return 0;
    return theoryOfChangeStage.stageNumber || 0;
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProjectName = (project: any): string => {
    if (!project) return 'Project';
    if (typeof project === 'string') return 'Project';
    return project.name || 'Project';
  };

  const REVIEW_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
    pending:   { label: 'Pending Review', bg: 'bg-ochre-50',       text: 'text-ochre-500',       border: 'border-ochre-500/30' },
    in_review: { label: 'In Review',      bg: 'bg-sky-50',         text: 'text-sky-500',         border: 'border-sky-500/30' },
    approved:  { label: 'Approved',       bg: 'bg-grass-50',       text: 'text-grass-500',       border: 'border-grass-500/30' },
    escalated: { label: 'Escalated',      bg: 'bg-sand-50',        text: 'text-sand-500',        border: 'border-sand-500/30' },
    resolved:  { label: 'Resolved',       bg: 'bg-concrete-50',    text: 'text-concrete-500',    border: 'border-concrete-500/30' },
  };

  const REVIEW_PRIORITY_CONFIG: Record<string, { label: string; text: string }> = {
    low:      { label: 'Low',      text: 'text-concrete-500' },
    medium:   { label: 'Medium',   text: 'text-sky-500' },
    high:     { label: 'High',     text: 'text-ochre-500' },
    critical: { label: 'Critical', text: 'text-coral-500' },
  };

  if (loading || structureLoading) {
    return (
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName="Loading..."
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          <p className="text-stratosphere-900 font-medium ml-4">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName="Project"
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-ochre-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stratosphere-900 mb-2">Survey Not Found</h2>
            <p className="text-sky-500 mb-4">{error || 'The survey you\'re looking for doesn\'t exist'}</p>
            <Link href={`/dashboard/project/${projectId}/surveys`}>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                Back to Surveys
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stratosphere-50">
      {/* Sidebar */}
      <ProjectSidebar 
        projectId={projectId}
        projectName={getProjectName(survey.project)}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-concrete-500/20">
          <Link 
            href={`/dashboard/project/${projectId}/surveys`}
            className="flex items-center text-sky-500 hover:text-stratosphere-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Surveys
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-stratosphere-900">{survey.title}</h1>
                <div className="flex items-center gap-2">
                  {getStatusIcon(survey.status)}
                  <Badge className={`capitalize border ${getStatusBadgeColor(survey.status)}`}>
                    {survey.status}
                  </Badge>
                </div>
              </div>
              
              {survey.description && (
                <p className="text-sky-500 mb-3">{survey.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-sky-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {getStakeholderName(survey.stakeholderGroup)}
                </div>
                {getStageNumber(survey.theoryOfChangeStage) > 0 && (
                  <div className="flex items-center gap-1">
                    <GitBranch className="h-4 w-4" />
                    Stage {getStageNumber(survey.theoryOfChangeStage)}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {getTotalQuestions()} questions
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  ~{getEstimatedDuration()} min
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/project/${projectId}/surveys/${surveyId}/edit`}>
                <Button
                  variant="outline"
                  className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>

              {survey.status === 'draft' && (
                <Button
                  onClick={handlePublishSurvey}
                  disabled={actionLoading === 'publish'}
                  className="bg-coral-500 hover:bg-coral-600 text-white"
                >
                  {actionLoading === 'publish' ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Publish Survey
                    </>
                  )}
                </Button>
              )}

              {survey.status === 'published' && (
                <Button
                  onClick={handleCloseSurvey}
                  disabled={actionLoading === 'close'}
                  variant="outline"
                  className="border-ochre-500/30 text-ochre-500 hover:bg-ochre-50"
                >
                  {actionLoading === 'close' ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-ochre-500 border-t-transparent" />
                      Closing...
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Close Survey
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
  {/* Statistics Overview */}
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-stratosphere-900 mb-1">Performance Metrics</h2>
    <p className="text-sm text-sky-500">Real-time survey response analytics</p>
  </div>
  {/* Statistics Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <Card className="bg-white border-concrete-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-sky-500 flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          Total Responses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-stratosphere-900">
          {statistics?.totalResponses || 0}
        </div>
        <p className="text-xs text-sky-500 mt-1">
          {statistics?.responsesByStatus?.completed || 0} completed
        </p>
      </CardContent>
    </Card>
    
    <Card className="bg-white border-concrete-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-sky-500 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          Completion Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-coral-500">
          {statistics?.completionRate ? `${Math.round(statistics.completionRate)}%` : '0%'}
        </div>
        <Progress 
          value={statistics?.completionRate || 0} 
          className="mt-2 h-2" 
        />
      </CardContent>
    </Card>
    
    <Card className="bg-white border-concrete-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-sky-500 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Avg. Duration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-stratosphere-900">
          {statistics?.timeStatistics?.averageTimeSeconds 
            ? `${Math.round(statistics.timeStatistics.averageTimeSeconds / 60)}m` 
            : 'N/A'}
        </div>
        <p className="text-xs text-sky-500 mt-1">
          Est. {getEstimatedDuration()}m
        </p>
      </CardContent>
    </Card>
    
    <Card className="bg-white border-concrete-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-sky-500 flex items-center">
          <Target className="h-4 w-4 mr-2" />
          Response Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-ochre-500">
          {survey.settings?.maxResponses || 'Unlimited'}
        </div>
        {survey.settings?.maxResponses && (
          <Progress 
            value={((statistics?.totalResponses || 0) / survey.settings.maxResponses) * 100} 
            className="mt-2 h-2" 
          />
        )}
      </CardContent>
    </Card>
  </div>

          {structure && getTotalQuestions() === 0 && (
            <Card className="bg-ochre-50 border-ochre-500/20 mb-8">
              <CardContent className="py-8">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-ochre-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-stratosphere-900 mb-2">
                    No Questions Added
                  </h3>
                  <p className="text-sky-500 mb-4">
                    Add questions to your survey before publishing
                  </p>
                  <Link href={`/dashboard/project/${projectId}/surveys/${surveyId}/edit`}>
                    <Button className="bg-clay-500 hover:bg-clay-600 text-white">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Survey
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Survey Structure Preview */}
          {structure && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-stratosphere-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-clay-500" />
                Survey Overview
              </h2>
                <Card className="bg-white border-concrete-500/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-stratosphere-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Survey Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {structure.sections && structure.sections.length > 0 && (
                      <div>
                        <h4 className="font-medium text-stratosphere-900 mb-3">Sections ({structure.sections.length})</h4>
                        <div className="space-y-2">
                          {structure.sections.map((section: any, index: number) => (
                            <div key={section._id} className="flex items-center justify-between p-3 bg-stratosphere-50 rounded-lg">
                              <div>
                                <p className="font-medium text-stratosphere-900">{section.title}</p>
                                {section.description && (
                                  <p className="text-sm text-sky-500">{section.description}</p>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {section.questions?.length || 0} questions
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {structure.noSectionQuestions && structure.noSectionQuestions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-stratosphere-900 mb-2">
                          Unorganized Questions ({structure.noSectionQuestions.length})
                        </h4>
                        <p className="text-sm text-sky-500">
                          Questions that haven't been assigned to any section
                        </p>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-concrete-500/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-sky-500">Total Questions:</span>
                        <span className="font-medium text-stratosphere-900">{getTotalQuestions()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-sky-500">Total Sections:</span>
                        <span className="font-medium text-stratosphere-900">{structure.sections?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sampling Calculator */}
          <div className="mb-8">
            <SamplingCalculator surveyId={surveyId} />
          </div>

          {/* Configuration & Actions */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-stratosphere-900 mb-1">Configuration & Details</h2>
            <p className="text-sm text-sky-500">Survey settings and management options</p>
          </div>

          {/* Survey Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Survey Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Survey Configuration */}
              <Card className="bg-white border-concrete-500/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-stratosphere-900 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Survey Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-sky-500">Category</label>
                      <p className="text-stratosphere-900 capitalize">
                        {survey.category === 'custom' ? survey.customCategoryName : survey.category?.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-sky-500">Sequence Number</label>
                      <p className="text-stratosphere-900">#{survey.sequenceNumber || 1}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-sky-500">Access Type</label>
                      <p className="text-stratosphere-900">
                        {survey.settings?.isPublic ? 'Public' : 'Private'}
                        {survey.settings?.allowAnonymous && ' (Anonymous)'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-sky-500">Multiple Responses</label>
                      <p className="text-stratosphere-900">
                        {survey.settings?.allowMultipleResponses ? 'Allowed' : 'Not Allowed'}
                      </p>
                    </div>
                  </div>
                  
                  {(survey.settings?.startDate || survey.settings?.endDate) && (
                    <div className="pt-4 border-t border-concrete-500/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {survey.settings?.startDate && (
                          <div>
                            <label className="text-sm font-medium text-sky-500">Start Date</label>
                            <p className="text-stratosphere-900">{formatDate(survey.settings.startDate)}</p>
                          </div>
                        )}
                        {survey.settings?.endDate && (
                          <div>
                            <label className="text-sm font-medium text-sky-500">End Date</label>
                            <p className="text-stratosphere-900">{formatDate(survey.settings.endDate)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Consent Form Management */}
              <Card className="bg-white border-concrete-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-stratosphere-900 flex items-center">
                      <FileCheck className="h-5 w-5 mr-2" />
                      Consent Form
                    </CardTitle>
                    {!survey.consentForm && (
                      <Link href={`/dashboard/project/${projectId}/surveys/${surveyId}/consent`}>
                        <Button 
                          size="sm"
                          className="bg-clay-500 hover:bg-clay-600 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Consent
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {survey.consentForm ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-stratosphere-50 rounded-lg border border-concrete-500/20">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-stratosphere-900 mb-1">
                              {typeof survey.consentForm === 'object' && survey.consentForm?.name 
                                ? survey.consentForm.name 
                                : 'Consent Form Attached'}
                            </h4>
                            {typeof survey.consentForm === 'object' && survey.consentForm?.description && (
                              <p className="text-sm text-sky-500 line-clamp-2">
                                {survey.consentForm.description}
                              </p>
                            )}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={survey.consentRequired 
                              ? "bg-coral-50 text-coral-500 border-coral-500/20" 
                              : "bg-sky-50 text-sky-500 border-sky-500/20"
                            }
                          >
                            {survey.consentRequired ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                        
                        {typeof survey.consentForm === 'object' && (
                          <div className="flex items-center gap-4 text-xs text-sky-500 mt-3">
                            {survey.consentForm?.version && (
                              <span>Version {survey.consentForm.version}</span>
                            )}
                            {survey.consentForm?.defaultLanguage && (
                              <span className="uppercase">{survey.consentForm.defaultLanguage}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link 
                          href={`/dashboard/project/${projectId}/surveys/${surveyId}/consent`}
                          className="flex-1"
                        >
                          <Button 
                            variant="outline" 
                            className="w-full border-sky-500/30 text-sky-500 hover:bg-sky-50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Manage Consent
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileCheck className="h-12 w-12 text-concrete-500/50 mx-auto mb-3" />
                      <p className="text-sky-500 mb-4">
                        No consent form attached to this survey
                      </p>
                      <Link href={`/dashboard/project/${projectId}/surveys/${surveyId}/consent`}>
                        <Button 
                          variant="outline"
                          className="border-clay-500/30 text-clay-500 hover:bg-clay-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Consent Form
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white border-concrete-500/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-stratosphere-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                    {/* Always visible */}
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2 border-clay-500/30 hover:bg-clay-50 hover:border-clay-500"
                      onClick={() => setShowPreviewModal(true)}
                      disabled={!structure || getTotalQuestions() === 0}
                    >
                      <Eye className="h-5 w-5 text-clay-500" />
                      <span className="text-sm font-medium text-stratosphere-900">Preview Survey</span>
                    </Button>

                    <Link href={`/dashboard/project/${projectId}/surveys/${surveyId}/translations`} className="w-full">
                      <Button 
                        variant="outline" 
                        className="w-full h-auto py-4 flex-col gap-2 border-clay-500/30 hover:bg-clay-50 hover:border-clay-500"
                      >
                        <Languages className="h-5 w-5 text-clay-500" />
                        <span className="text-sm font-medium text-stratosphere-900">Translations</span>
                      </Button>
                    </Link>

                    {/* Published-only actions */}
                    {survey.status === 'published' && (
                      <>
                        <Link href={`/dashboard/project/${projectId}/surveys/${surveyId}/responses`} className="w-full">
                          <Button 
                            variant="outline" 
                            className="w-full h-auto py-4 flex-col gap-2 border-clay-500/30 hover:bg-clay-50 hover:border-clay-500"
                          >
                            <BarChart3 className="h-5 w-5 text-clay-500" />
                            <span className="text-sm font-medium text-stratosphere-900">View Analytics</span>
                          </Button>
                        </Link>

                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex-col gap-2 border-clay-500/30 hover:bg-clay-50 hover:border-clay-500"
                          onClick={() => setShowShareModal(true)}
                        >
                          <Share2 className="h-5 w-5 text-clay-500" />
                          <span className="text-sm font-medium text-stratosphere-900">Share Survey</span>
                        </Button>

                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex-col gap-2 border-clay-500/30 hover:bg-clay-50 hover:border-clay-500"
                        >
                          <Download className="h-5 w-5 text-clay-500" />
                          <span className="text-sm font-medium text-stratosphere-900">Export Data</span>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Metadata */}
            <div className="space-y-6">
              {/* Survey Details */}
              <Card className="bg-white border-concrete-500/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-stratosphere-900">Survey Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-sky-500">Created</label>
                    <p className="text-stratosphere-900">{formatDate(survey.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-sky-500">Last Updated</label>
                    <p className="text-stratosphere-900">{formatDate(survey.updatedAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-sky-500">Creator</label>
                    <p className="text-stratosphere-900">
                      {typeof survey.creator === 'object' && survey.creator?.name ? survey.creator.name : 'Unknown'}
                    </p>
                  </div>
                  {survey.projectSite && (
                    <div>
                      <label className="text-sm font-medium text-sky-500">Project Site</label>
                      <p className="text-stratosphere-900">
                        {typeof survey.projectSite === 'object' ? survey.projectSite?.name : 'Site'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Status */}
              <Card className="bg-white border-concrete-500/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-stratosphere-900 flex items-center">
                    <FileCheck className="h-5 w-5 mr-2" />
                    Review Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviewLoading ? (
                    <div className="flex items-center gap-2 text-sm text-sky-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                      Loading review...
                    </div>
                  ) : surveyReview ? (
                    <div className="space-y-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${REVIEW_STATUS_CONFIG[surveyReview.status]?.bg} ${REVIEW_STATUS_CONFIG[surveyReview.status]?.text} ${REVIEW_STATUS_CONFIG[surveyReview.status]?.border}`}>
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                        {REVIEW_STATUS_CONFIG[surveyReview.status]?.label ?? surveyReview.status}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-sky-500">Priority</span>
                        <span className={`font-medium capitalize ${REVIEW_PRIORITY_CONFIG[surveyReview.priority]?.text}`}>
                          {REVIEW_PRIORITY_CONFIG[surveyReview.priority]?.label ?? surveyReview.priority}
                        </span>
                      </div>
                      {surveyReview.issues?.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-sky-500">Open Issues</span>
                          <span className="font-medium text-ochre-500">
                            {surveyReview.issues.filter((i: any) => !i.resolvedAt).length}
                          </span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-sky-500/30 text-sky-500 hover:bg-sky-50 mt-1"
                        onClick={() => setShowReviewModal(true)}
                      >
                        View Review
                      </Button>
                    </div>
                  ) : survey.status === 'published' ? (
                    <div className="text-center py-2">
                      <p className="text-sm text-sky-500">Review pending creation</p>
                    </div>
                  ) : (
                    <p className="text-sm text-sky-500">
                      A review will be created automatically when this survey is published.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Response Summary */}
              {statistics && (
                <Card className="bg-white border-concrete-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-stratosphere-900">Response Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-sky-500">Started</span>
                      <span className="text-sm font-medium text-stratosphere-900">
                        {statistics.responsesByStatus?.started || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-sky-500">In Progress</span>
                      <span className="text-sm font-medium text-stratosphere-900">
                        {statistics.responsesByStatus?.in_progress || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-sky-500">Completed</span>
                      <span className="text-sm font-medium text-coral-500">
                        {statistics.responsesByStatus?.completed || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-sky-500">Abandoned</span>
                      <span className="text-sm font-medium text-ochre-500">
                        {statistics.responsesByStatus?.abandoned || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {structure && (
        <SurveyPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          structure={structure}
        />
      )}

      

      <SurveyShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectId={projectId}
        surveyId={surveyId}
        surveyTitle={survey.title}
        surveyStatus={survey.status}
      />

      {showReviewModal && surveyReview && (
        <ReviewDetailModal
          reviewId={surveyReview._id}
          onClose={() => {
            setShowReviewModal(false);
            fetchSurveyReview();
          }}
        />
      )}
    </div>
  );
};

export default SurveyDetailsPage;