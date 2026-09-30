// app/dashboard/project/[id]/surveys/page.tsx - Enhanced with better design
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  MoreVertical,
  Users,
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
  FlaskConical,
  GitBranch,
  Eye,
  Edit,
  Copy,
  Trash2,
  Filter,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import ProjectSidebar from '@/components/project/ProjectSidebar';
import HeaderHelpActions from '@/components/HeaderHelpActions';
import { getProject } from '@/lib/api/project';
import { useToast } from "@/hooks/use-toast";
import * as surveyApi from '@/lib/api/survey';
import { Topbar, TopbarBack, TopbarHead, TopbarTitle, TopbarSub, TopbarActions } from '@/components/shared/Topbar';
import { StatGrid, StatTile } from '@/components/shared/StatTile';
import { Toolbar, SearchField, SegmentedToggle, SegmentedButton } from '@/components/shared/Toolbar';
import { RowHead, CardLede } from '@/components/shared/PageLayout';
import { EmptyState } from '@/components/shared/EmptyState';

interface SurveyData {
  _id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  category: string;
  stakeholderGroups?: {
    _id: string;
    name: string;
  }[];
  stageScope?: 'stage1' | 'stage2' | 'both';
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
      case 'pretest': return <FlaskConical className="h-4 w-4" />;
      case 'draft': return <PauseCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Colour does exactly one job (Brand Guidelines): status carries meaning
  // (draft = waiting on a person, published = live/healthy), so only status
  // is tinted. Category is purely informational and stays a plain quiet tag
  // rather than each category getting its own arbitrary colour.
  const getStatusVariant = (status: string): 'attention' | 'done' | 'phase' | 'quiet' => {
    switch (status) {
      case 'published': return 'done';
      case 'pretest': return 'phase';
      case 'draft': return 'attention';
      case 'closed': return 'quiet';
      default: return 'quiet';
    }
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

  const getStakeholderNames = (stakeholderGroups: any[] | undefined): string => {
    if (!stakeholderGroups || stakeholderGroups.length === 0) return 'Unknown';
    return stakeholderGroups
      .map((sg) => (typeof sg === 'string' ? 'Stakeholder Group' : sg?.name || 'Unknown'))
      .join(', ');
  };

  const getStageLabel = (stageScope: 'stage1' | 'stage2' | 'both' | undefined): string | null => {
    if (stageScope === 'stage1') return 'Stage 1';
    if (stageScope === 'stage2') return 'Stage 2';
    if (stageScope === 'both') return 'Both Stages';
    return null;
  };

  const filteredSurveys = Array.isArray(surveys) ? surveys.filter(survey => {
    const stakeholderName = getStakeholderNames(survey.stakeholderGroups);
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
      <div className="flex min-h-screen bg-c4c-grey-bg">
        <ProjectSidebar
          projectId={projectId}
          projectName="Loading..."
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c4c-coral mx-auto mb-4"></div>
            <p className="text-black font-medium">Loading surveys...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        <ProjectSidebar
          projectId={projectId}
          projectName={project?.name || 'Project'}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-c4c-tint-gold p-6 w-fit mx-auto mb-4">
              <XCircle className="h-12 w-12 text-black" />
            </div>
            <h2 className="text-xl font-semibold text-black mb-2">Error Loading Surveys</h2>
            <p className="text-c4c-petrol mb-6">{error}</p>
            <Button variant="anchor" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        {/* Sidebar */}
        <ProjectSidebar
          projectId={projectId}
          projectName={project?.name || 'Project'}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <Topbar motif="burgundy">
            <TopbarBack href={`/dashboard/project/${projectId}`}>Back to Project</TopbarBack>
            <TopbarHead>
              <div>
                <TopbarTitle>Survey Management</TopbarTitle>
                {project?.organization && (
                  <HeaderHelpActions
                    organizationId={project.organization}
                    guideHref={`/dashboard/project/${projectId}/surveys/intro`}
                  />
                )}
                <TopbarSub>
                  Create and manage surveys for your stakeholder groups. Build compliant,
                  professional surveys with our intelligent question library and translation support.
                </TopbarSub>
              </div>

              <TopbarActions>
                <Button variant="quiet" onClick={() => router.push(`/dashboard/project/${projectId}/surveys/templates`)}>
                  <FileText className="h-4 w-4" />
                  Templates
                </Button>
                <Button variant="anchor" onClick={() => router.push(`/dashboard/project/${projectId}/surveys/builder`)}>
                  <Plus className="h-4 w-4" />
                  Create Survey
                </Button>
              </TopbarActions>
            </TopbarHead>
          </Topbar>

          <div className="p-8 flex flex-col gap-6">
            {/* Stats Cards — only Draft is tinted: these five numbers are
                five counts of the same thing, not five different kinds of
                thing, and a draft is the one waiting on a person. */}
            <StatGrid>
              <StatTile label="Total Surveys" value={surveyStats.total} caption="Across all categories" icon={<BarChart3 />} />
              <StatTile label="Published" value={surveyStats.published} caption="Active & collecting data" icon={<CheckCircle />} />
              <StatTile label="Draft" value={surveyStats.draft} caption="In development" icon={<PauseCircle />} variant="attention" />
              <StatTile label="Questions" value={surveyStats.totalQuestions} caption="Total across surveys" icon={<FileText />} />
              <StatTile label="Avg Duration" value={surveyStats.avgDuration} caption="Minutes per survey" icon={<Clock />} />
            </StatGrid>

            {/* Filters and Search */}
            <Card className="p-6">
              <RowHead>
                <div>
                  <h3 className="text-lg font-medium text-black">Find Surveys</h3>
                  <CardLede>Search and filter your survey collection</CardLede>
                </div>
                <SegmentedToggle>
                  <SegmentedButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>Grid</SegmentedButton>
                  <SegmentedButton active={viewMode === 'list'} onClick={() => setViewMode('list')}>List</SegmentedButton>
                </SegmentedToggle>
              </RowHead>

              <div className="flex flex-col lg:flex-row gap-4 mt-4">
                <Toolbar className="flex-1">
                  <SearchField
                    placeholder="Search by survey title or stakeholder group..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Toolbar>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pretest">Pretest</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-48">
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
            </Card>

            {/* Surveys Display */}
            {filteredSurveys.length === 0 ? (
              <div className="border border-c4c-rule bg-white">
                <EmptyState
                  icon={<FileText />}
                  title={surveysArray.length === 0 ? 'No surveys yet' : 'No matching surveys'}
                  description={
                    surveysArray.length === 0
                      ? "Get started by creating your first survey with our intelligent builder"
                      : "Try adjusting your search terms or filters"
                  }
                  actions={surveysArray.length === 0 ? (
                    <>
                      <Link href={`/dashboard/project/${projectId}/surveys/intro`}>
                        <Button variant="quiet">
                          <Sparkles className="h-4 w-4" />
                          View Guide
                        </Button>
                      </Link>
                      <Button variant="spotlight" onClick={() => router.push(`/dashboard/project/${projectId}/surveys/builder`)}>
                        <Plus className="h-4 w-4" />
                        Create First Survey
                      </Button>
                    </>
                  ) : undefined}
                />
              </div>
            ) : viewMode === 'grid' ? (
              // Grid View
              <div className="space-y-8">
                {Object.entries(surveysByCategory).map(([category, categorySurveys]) => (
                  <div key={category}>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="font-title text-lg font-semibold text-black capitalize">
                        {category.replace('_', ' ')}
                      </h2>
                      <Badge variant="quiet">{categorySurveys.length}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categorySurveys.map((survey) => (
                        <Card key={survey._id} className="group overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <CardTitle className="font-title text-lg line-clamp-2">
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
                              <Badge variant={getStatusVariant(survey.status)} className="capitalize">
                                {getStatusIcon(survey.status)}
                                {survey.status}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent>
                            {survey.description && (
                              <p className="text-sm text-c4c-petrol mb-4 line-clamp-2">{survey.description}</p>
                            )}

                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-c4c-petrol">
                                <Users className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{getStakeholderNames(survey.stakeholderGroups)}</span>
                              </div>

                              {getStageLabel(survey.stageScope) && (
                                <div className="flex items-center gap-2 text-sm text-c4c-petrol">
                                  <GitBranch className="h-4 w-4 flex-shrink-0" />
                                  <span>{getStageLabel(survey.stageScope)}</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-3 border-t border-c4c-rule">
                                <div className="flex items-center gap-1 text-sm text-c4c-petrol">
                                  <FileText className="h-4 w-4" />
                                  {survey.actualQuestionCount} questions
                                </div>
                                <div className="flex items-center gap-1 text-sm text-c4c-petrol">
                                  <Clock className="h-4 w-4" />
                                  ~{survey.estimatedDuration || 0} min
                                </div>
                              </div>
                            </div>

                            <Link href={`/dashboard/project/${projectId}/surveys/${survey._id}`}>
                              <Button variant="anchor" className="w-full mt-4" size="sm">
                                <Eye className="h-4 w-4" />
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
              <Card className="p-0">
                <CardHeader>
                  <CardTitle className="font-title text-lg">All Surveys</CardTitle>
                  <p className="mt-1 text-sm text-c4c-petrol">{filteredSurveys.length} of {surveysArray.length} surveys</p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-c4c-rule">
                    {filteredSurveys.map((survey) => (
                      <div key={survey._id} className="p-6 hover:bg-c4c-grey-bg transition-colors group">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Link href={`/dashboard/project/${projectId}/surveys/${survey._id}`}>
                                <h3 className="font-title text-lg font-semibold text-black">
                                  {survey.title}
                                </h3>
                              </Link>
                              <Badge variant={getStatusVariant(survey.status)} className="capitalize">
                                {getStatusIcon(survey.status)}
                                {survey.status}
                              </Badge>
                              <Badge variant="quiet" className="capitalize">
                                {survey.category.replace('_', ' ')}
                              </Badge>
                            </div>

                            {survey.description && (
                              <p className="text-sm text-c4c-petrol mb-3 line-clamp-1">{survey.description}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-c4c-petrol">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {getStakeholderNames(survey.stakeholderGroups)}
                              </div>
                              {getStageLabel(survey.stageScope) && (
                                <div className="flex items-center gap-1">
                                  <GitBranch className="h-4 w-4" />
                                  {getStageLabel(survey.stageScope)}
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
                              <Button variant="quiet" size="sm">
                                <Eye className="h-4 w-4" />
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