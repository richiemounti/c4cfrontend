// app/dashboard/project/[id]/surveys/page.tsx - Enhanced with better design
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Users, 
  BarChart3, 
  FileText, 
  Clock, 
  CheckCircle,
  XCircle,
  PauseCircle,
  GitBranch,
  Eye,
  Edit,
  Copy,
  Trash2,
  ArrowLeft,
  HelpCircle,
  Filter,
  Download,
  TrendingUp,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { getProject } from '@/lib/api/project';
import { useToast } from "@/hooks/use-toast";
import * as surveyApi from '@/lib/api/survey';

interface SurveyData {
  _id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  category: string;
  stakeholderGroup?: {
    _id: string;
    name: string;
  };
  theoryOfChangeStage?: {
    stageNumber: number;
  };
  totalQuestions?: number;
  estimatedDuration?: number;
  createdAt: string;
  updatedAt: string;
}

interface SurveyWithRealCount extends SurveyData {
  actualQuestionCount: number;
}

interface PageParams {
  id: string;
}

const SurveyOverviewPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { id: projectId } = params;

  const [surveys, setSurveys] = useState<SurveyWithRealCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [project, setProject] = useState<any>(null);

  // Function to get real-time question count for a survey
  const getRealQuestionCount = async (surveyId: string): Promise<number> => {
    try {
      const response = await surveyApi.getSurveyQuestions(surveyId);
      return response.success ? response.count : 0;
    } catch (error) {
      console.error(`Failed to get question count for survey ${surveyId}:`, error);
      return 0;
    }
  };

  // Function to get real-time question counts for all surveys
  const updateSurveysWithRealCounts = async (surveysData: SurveyData[]): Promise<SurveyWithRealCount[]> => {
    const promises = surveysData.map(async (survey) => {
      const actualQuestionCount = await getRealQuestionCount(survey._id);
      return {
        ...survey,
        actualQuestionCount
      };
    });

    return Promise.all(promises);
  };

  // Fetch project and surveys
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const projectResponse = await getProject(projectId);
        setProject(projectResponse.data);
            
        const response = await surveyApi.getSurveysByProject(projectId, undefined, {
          page: 1,
          limit: 100
        });
        
        if (response.success) {
          const surveysData = response.data.surveys || [];
          const surveysWithRealCounts = await updateSurveysWithRealCounts(surveysData);
          setSurveys(surveysWithRealCounts);
        } else {
          setError('Failed to fetch surveys');
          setSurveys([]);
        }
      } catch (err) {
        console.error('Error fetching surveys:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch surveys');
        setSurveys([]);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4" />;
      case 'draft': return <PauseCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-coral-50 text-coral-500 border-coral-500/20';
      case 'draft': return 'bg-ochre-50 text-ochre-500 border-ochre-500/20';
      case 'closed': return 'bg-concrete-50 text-concrete-900 border-concrete-500/20';
      default: return 'bg-sky-50 text-sky-500 border-sky-500/20';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      baseline: 'bg-grass-50 text-grass-500 border-grass-500/20',
      monitoring: 'bg-sky-50 text-sky-500 border-sky-500/20',
      evaluation: 'bg-sand-50 text-sand-500 border-sand-500/20',
      impact_assessment: 'bg-forest-50 text-forest-500 border-forest-500/20',
      feedback: 'bg-clay-50 text-clay-500 border-clay-500/20',
    };
    return colors[category] || 'bg-concrete-50 text-concrete-900 border-concrete-500/20';
  };

  const handleArchiveSurvey = async (surveyId: string) => {
    try {
      await surveyApi.archiveSurvey(surveyId);
      setSurveys(prev => prev.filter(s => s._id !== surveyId));
      toast({
        title: 'Success',
        description: 'Survey archived successfully',
      });
    } catch (err) {
      console.error('Error archiving survey:', err);
      toast({
        title: 'Error',
        description: 'Failed to archive survey',
        variant: 'destructive',
      });
    }
  };

  const handleCloneSurvey = async (surveyId: string) => {
    try {
      const response = await surveyApi.cloneSurvey(surveyId);
      if (response.success) {
        const actualQuestionCount = await getRealQuestionCount(response.data._id);
        const surveyWithRealCount = {
          ...response.data,
          actualQuestionCount
        };
        
        setSurveys(prev => [surveyWithRealCount, ...prev]);
        toast({
          title: 'Success',
          description: 'Survey cloned successfully',
        });
      }
    } catch (err) {
      console.error('Error cloning survey:', err);
      toast({
        title: 'Error',
        description: 'Failed to clone survey',
        variant: 'destructive',
      });
    }
  };

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

  const filteredSurveys = Array.isArray(surveys) ? surveys.filter(survey => {
    const stakeholderName = getStakeholderName(survey.stakeholderGroup);
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || survey.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  }) : [];

  const surveysArray = Array.isArray(surveys) ? surveys : [];
  const surveyStats = {
    total: surveysArray.length,
    published: surveysArray.filter(s => s.status === 'published').length,
    draft: surveysArray.filter(s => s.status === 'draft').length,
    totalQuestions: surveysArray.reduce((sum, s) => sum + s.actualQuestionCount, 0),
    avgDuration: surveysArray.length > 0 
      ? Math.round(surveysArray.reduce((sum, s) => sum + (s.estimatedDuration || 0), 0) / surveysArray.length)
      : 0
  };

  // Group surveys by category
  const surveysByCategory = filteredSurveys.reduce((acc, survey) => {
    const category = survey.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(survey);
    return acc;
  }, {} as Record<string, SurveyWithRealCount[]>);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName="Loading..."
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-stratosphere-900 font-medium">Loading surveys...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName={project?.name || 'Project'}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-ochre-50 rounded-full p-6 w-fit mx-auto mb-4">
              <XCircle className="h-12 w-12 text-ochre-500" />
            </div>
            <h2 className="text-xl font-semibold text-stratosphere-900 mb-2">Error Loading Surveys</h2>
            <p className="text-sky-500 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              Try Again
            </Button>
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
          projectName={project?.name || 'Project'}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white border-b border-concrete-500/20">
            <div className="px-8 py-6">
              <Link 
                href={`/dashboard/project/${projectId}`}
                className="flex items-center text-sky-500 hover:text-stratosphere-900 mb-6 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Project
              </Link>
              
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-stratosphere-900">Survey Management</h1>
                    <Link href={`/dashboard/project/${projectId}/surveys/intro`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sky-500 hover:text-stratosphere-900 hover:bg-sky-50"
                      >
                        <HelpCircle className="h-4 w-4 mr-1" />
                        Guide
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sky-500 max-w-2xl">
                    Create and manage surveys for your stakeholder groups. Build compliant, 
                    professional surveys with our intelligent question library and translation support.
                  </p>
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Button 
                    variant="outline" 
                    className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
                    onClick={() => router.push(`/dashboard/project/${projectId}/surveys/templates`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                  <Button 
                    className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20"
                    onClick={() => router.push(`/dashboard/project/${projectId}/surveys/builder`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Survey
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-sky-50 to-white border-sky-500/20 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-sky-500 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Total Surveys
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-stratosphere-900">{surveyStats.total}</div>
                  <p className="text-xs text-sky-500 mt-1">Across all categories</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-coral-50 to-white border-coral-500/20 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-coral-500 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Published
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-coral-500">{surveyStats.published}</div>
                  <p className="text-xs text-sky-500 mt-1">Active & collecting data</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-ochre-50 to-white border-ochre-500/20 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-ochre-500 flex items-center gap-2">
                    <PauseCircle className="h-4 w-4" />
                    Draft
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-ochre-500">{surveyStats.draft}</div>
                  <p className="text-xs text-sky-500 mt-1">In development</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-grass-50 to-white border-grass-500/20 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-grass-500 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-grass-500">{surveyStats.totalQuestions}</div>
                  <p className="text-xs text-sky-500 mt-1">Total across surveys</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-forest-50 to-white border-forest-500/20 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-forest-500 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Avg Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-forest-500">{surveyStats.avgDuration}</div>
                  <p className="text-xs text-sky-500 mt-1">Minutes per survey</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="mb-8 border-concrete-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Find Surveys</CardTitle>
                    <CardDescription>Search and filter your survey collection</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={viewMode === 'grid' ? 'bg-sky-50 text-sky-500' : 'text-concrete-900'}
                    >
                      Grid
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={viewMode === 'list' ? 'bg-sky-50 text-sky-500' : 'text-concrete-900'}
                    >
                      List
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
                    <Input
                      placeholder="Search by survey title or stakeholder group..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-concrete-500/30 focus:border-sky-500 focus:ring-sky-500/20"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-48 border-concrete-500/30">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full lg:w-48 border-concrete-500/30">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="baseline">Baseline</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="evaluation">Evaluation</SelectItem>
                      <SelectItem value="impact_assessment">Impact Assessment</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Surveys Display */}
            {filteredSurveys.length === 0 ? (
              <Card className="border-concrete-500/20">
                <CardContent className="py-16">
                  <div className="text-center max-w-md mx-auto">
                    <div className="bg-sky-50 rounded-full p-6 w-fit mx-auto mb-6">
                      <FileText className="h-12 w-12 text-sky-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-stratosphere-900 mb-2">
                      {surveysArray.length === 0 ? 'No surveys yet' : 'No matching surveys'}
                    </h3>
                    <p className="text-sky-500 mb-6">
                      {surveysArray.length === 0 
                        ? "Get started by creating your first survey with our intelligent builder"
                        : "Try adjusting your search terms or filters"
                      }
                    </p>
                    {surveysArray.length === 0 && (
                      <div className="flex items-center justify-center gap-3">
                        <Link href={`/dashboard/project/${projectId}/surveys/intro`}>
                          <Button 
                            variant="outline" 
                            className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            View Guide
                          </Button>
                        </Link>
                        <Button 
                          className="bg-sky-500 hover:bg-sky-600 text-white"
                          onClick={() => router.push(`/dashboard/project/${projectId}/surveys/builder`)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Survey
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              // Grid View
              <div className="space-y-8">
                {Object.entries(surveysByCategory).map(([category, categorySurveys]) => (
                  <div key={category}>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-lg font-semibold text-stratosphere-900 capitalize">
                        {category.replace('_', ' ')}
                      </h2>
                      <Badge variant="outline" className={getCategoryColor(category)}>
                        {categorySurveys.length}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categorySurveys.map((survey) => (
                        <Card 
                          key={survey._id} 
                          className="group hover:shadow-xl transition-all duration-300 border-concrete-500/20 hover:border-sky-500/30 overflow-hidden"
                        >
                          <div className={`h-2 ${getCategoryColor(survey.category).split(' ')[0]}`} />
                          
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <CardTitle className="text-lg group-hover:text-sky-500 transition-colors line-clamp-2">
                                  {survey.title}
                                </CardTitle>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/project/${projectId}/surveys/${survey._id}`}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/project/${projectId}/surveys/${survey._id}/edit`}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Survey
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleCloneSurvey(survey._id)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Clone Survey
                                    </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleArchiveSurvey(survey._id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={`${getStatusColor(survey.status)} capitalize`}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(survey.status)}
                                  {survey.status}
                                </span>
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent>
                            {survey.description && (
                              <p className="text-sm text-sky-500 mb-4 line-clamp-2">{survey.description}</p>
                            )}
                            
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-sky-500">
                                <Users className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{getStakeholderName(survey.stakeholderGroup)}</span>
                              </div>
                              
                              {getStageNumber(survey.theoryOfChangeStage) > 0 && (
                                <div className="flex items-center gap-2 text-sm text-sky-500">
                                  <GitBranch className="h-4 w-4 flex-shrink-0" />
                                  <span>Stage {getStageNumber(survey.theoryOfChangeStage)}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between pt-3 border-t border-concrete-500/10">
                                <div className="flex items-center gap-1 text-sm text-sky-500">
                                  <FileText className="h-4 w-4" />
                                  {survey.actualQuestionCount} questions
                                </div>
                                <div className="flex items-center gap-1 text-sm text-sky-500">
                                  <Clock className="h-4 w-4" />
                                  ~{survey.estimatedDuration || 0} min
                                </div>
                              </div>
                            </div>
                            
                            <Link href={`/dashboard/project/${projectId}/surveys/${survey._id}`}>
                              <Button 
                                className="w-full mt-4 bg-sky-500 hover:bg-sky-600 text-white"
                                size="sm"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Survey
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <Card className="border-concrete-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Surveys</CardTitle>
                      <CardDescription>
                        {filteredSurveys.length} of {surveysArray.length} surveys
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-concrete-500/10">
                    {filteredSurveys.map((survey) => (
                      <div key={survey._id} className="p-6 hover:bg-stratosphere-50/30 transition-colors group">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Link href={`/dashboard/project/${projectId}/surveys/${survey._id}`}>
                                <h3 className="text-lg font-semibold text-stratosphere-900 group-hover:text-sky-500 transition-colors">
                                  {survey.title}
                                </h3>
                              </Link>
                              <Badge className={`${getStatusColor(survey.status)} capitalize flex items-center gap-1`}>
                                {getStatusIcon(survey.status)}
                                {survey.status}
                              </Badge>
                              <Badge variant="outline" className={getCategoryColor(survey.category)}>
                                {survey.category.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            {survey.description && (
                              <p className="text-sm text-sky-500 mb-3 line-clamp-1">{survey.description}</p>
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
                                {survey.actualQuestionCount} questions
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                ~{survey.estimatedDuration || 0} min
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <Calendar className="h-3 w-3" />
                                Updated {new Date(survey.updatedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link href={`/dashboard/project/${projectId}/surveys/${survey._id}`}>
                              <Button variant="outline" size="sm" className="border-sky-500/30 text-sky-500 hover:bg-sky-50">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/project/${projectId}/surveys/${survey._id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Survey
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCloneSurvey(survey._id)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Clone Survey
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleArchiveSurvey(survey._id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Archive Survey
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
  );
};

export default SurveyOverviewPage;