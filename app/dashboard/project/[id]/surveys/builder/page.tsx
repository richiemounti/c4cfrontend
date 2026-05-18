// app/dashboard/project/[id]/surveys/builder/page.tsx - Enhanced Design with Collapsible Sections
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  Users, 
  GitBranch, 
  FileText, 
  Search, 
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Target,
  TrendingUp,
  Lightbulb,
  Layers,
  CheckCircle,
  Info,
  BookOpen,
  Sparkles,
  BarChart3,
  AlertCircle,
  Clock,
  MessageSquare,
  Grid3x3,
  List
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { useToast } from "@/hooks/use-toast";
import { getStagesByProject } from '@/lib/api/theoryOfChange';
import stakeholderMappingApi from '@/lib/api/stakeholderMapping';
import { getFilteredQuestionsForSurvey, getSurveysByStakeholder } from '@/lib/api/survey';
import { getProject } from '@/lib/api/project';
import { StakeholderGroup } from '@/types';
import { Category } from '@/types/taxonomy';

interface PageParams {
  id: string;
}

interface TheoryOfChangeStage {
  _id: string;
  stageNumber: number;
  stageType: string;
  name: string;
  description?: string;
}

interface StakeholderStageCombo {
  stakeholderGroup: StakeholderGroup;
  stage: TheoryOfChangeStage;
  availableQuestions: number;
  existingSurveys: number;
  lastSurveyDate?: string;
}

const ITEMS_PER_PAGE = 6; // Show 6 cards per group before pagination
const COLLAPSE_THRESHOLD = 4; // Auto-collapse groups if there are more than 4

const SurveyBuilderLandingPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { id: projectId } = params;
  
  const [stakeholderGroups, setStakeholderGroups] = useState<StakeholderGroup[]>([]);
  const [theoryOfChangeStages, setTheoryOfChangeStages] = useState<TheoryOfChangeStage[]>([]);
  const [availableCombos, setAvailableCombos] = useState<StakeholderStageCombo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stakeholderFilter, setStakeholderFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'stakeholder' | 'stage'>('stakeholder');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  
  // Track collapsed state for each group
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  // Track current page for each group when paginating
  const [groupPages, setGroupPages] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch project details
      const projectResponse = await getProject(projectId);
      setProject(projectResponse.data);
      
      // Fetch stakeholder groups
      const stakeholderResponse = await stakeholderMappingApi.getStakeholderGroups(projectId);
      const stakeholderGroups = stakeholderResponse.data?.data?.stakeholderGroups || [];
      setStakeholderGroups(stakeholderGroups);

      // Fetch theory of change stages
      const stagesResponse = await getStagesByProject(projectId);
      const stages = stagesResponse.data?.data || [];
      setTheoryOfChangeStages(stages);

      // If no stakeholders or stages, show empty state
      if (stakeholderGroups.length === 0 || stages.length === 0) {
        setAvailableCombos([]);
        setLoading(false);
        return;
      }

      // Generate combinations and fetch data
      const combos: StakeholderStageCombo[] = [];
      
      for (const stakeholder of stakeholderGroups) {
        for (const stage of stages) {
          try {
            // Get available questions count
            const questionsResponse = await getFilteredQuestionsForSurvey({
              stakeholderGroupId: stakeholder._id,
              stageId: stage._id,
              page: 1,
              limit: 1
            });

            // Get existing surveys
            const surveysResponse = await getSurveysByStakeholder(stakeholder._id, {
              stageId: stage._id
            });

            const existingSurveys = surveysResponse.data?.surveys || [];
            const lastSurvey = existingSurveys.length > 0 ? 
              existingSurveys.sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0] : null;

            combos.push({
              stakeholderGroup: stakeholder,
              stage: stage,
              availableQuestions: questionsResponse.pagination?.totalItems || questionsResponse.data?.totalCount || 0,
              existingSurveys: existingSurveys.length,
              lastSurveyDate: lastSurvey?.createdAt.toString()
            });
          } catch (comboError) {
            console.error(`Error fetching data for ${stakeholder.name} - ${stage.name}:`, comboError);
            combos.push({
              stakeholderGroup: stakeholder,
              stage: stage,
              availableQuestions: 0,
              existingSurveys: 0,
              lastSurveyDate: undefined
            });
          }
        }
      }

      setAvailableCombos(combos);
      
      // Initialize collapsed state - auto-collapse if more than threshold
      const shouldAutoCollapse = viewMode === 'stakeholder' 
        ? stakeholderGroups.length > COLLAPSE_THRESHOLD
        : stages.length > COLLAPSE_THRESHOLD;
      
      if (shouldAutoCollapse) {
        const initialCollapsed: Record<string, boolean> = {};
        (viewMode === 'stakeholder' ? stakeholderGroups : stages).forEach((item: any, index: any) => {
          // Keep first one open, collapse the rest
          initialCollapsed[item._id] = index > 0;
        });
        setCollapsedGroups(initialCollapsed);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load survey builder data');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    Object.keys(collapsedGroups).forEach(key => {
      allExpanded[key] = false;
    });
    setCollapsedGroups(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    Object.keys(collapsedGroups).forEach(key => {
      allCollapsed[key] = true;
    });
    setCollapsedGroups(allCollapsed);
  };

  const handleContinueToBuilder = (stakeholderGroupId: string, stageId: string) => {
    router.push(`/dashboard/project/${projectId}/surveys/builder/${stakeholderGroupId}/${stageId}`);
  };

  const getStageIcon = (stageType: string) => {
    switch (stageType) {
      case 'input': return <Target className="h-4 w-4" />;
      case 'activity': return <Layers className="h-4 w-4" />;
      case 'output': return <FileText className="h-4 w-4" />;
      case 'outcome': return <TrendingUp className="h-4 w-4" />;
      case 'impact': return <CheckCircle className="h-4 w-4" />;
      default: return <GitBranch className="h-4 w-4" />;
    }
  };

  const getStageColor = (stageType: string) => {
    switch (stageType) {
      case 'input': return 'bg-sky-50 text-sky-500 border-sky-500/20';
      case 'activity': return 'bg-ochre-50 text-ochre-500 border-ochre-500/20';
      case 'output': return 'bg-grass-50 text-grass-500 border-grass-500/20';
      case 'outcome': return 'bg-grass-50 text-grass-500 border-grass-500/20';
      case 'impact': return 'bg-forest-50 text-forest-500 border-forest-500/20';
      default: return 'bg-concrete-50 text-concrete-500 border-concrete-500/20';
    }
  };

  const getStakeholderCategoryColor = (category: string | Category) => {
    const categoryName = typeof category === 'string' ? category : category.name;
    switch (categoryName.toLowerCase()) {
      case 'community': return 'bg-grass-50 text-grass-500 border-grass-500/20';
      case 'institutional': return 'bg-sky-50 text-sky-500 border-sky-500/20';
      case 'organizational': return 'bg-ochre-50 text-ochre-500 border-ochre-500/20';
      case 'government': return 'bg-grass-50 text-grass-500 border-grass-500/20';
      case 'vulnerable groups': return 'bg-sand-50 text-sand-500 border-sand-500/20';
      default: return 'bg-concrete-50 text-concrete-500 border-concrete-500/20';
    }
  };

  const getCategoryName = (category: string | Category): string => {
    return typeof category === 'string' ? category : category.name;
  };

  const filteredCombos = availableCombos.filter(combo => {
    const matchesSearch = combo.stakeholderGroup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         combo.stage.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStakeholder = stakeholderFilter === 'all' || combo.stakeholderGroup._id === stakeholderFilter;
    const matchesStage = stageFilter === 'all' || combo.stage._id === stageFilter;
    
    return matchesSearch && matchesStakeholder && matchesStage;
  });

  // Group combos by stakeholder or stage based on view mode
  const groupedCombos = viewMode === 'stakeholder' 
    ? stakeholderGroups.reduce((acc, stakeholder) => {
        const combos = filteredCombos.filter(c => c.stakeholderGroup._id === stakeholder._id);
        if (combos.length > 0) {
          acc[stakeholder._id] = {
            header: stakeholder,
            combos: combos
          };
        }
        return acc;
      }, {} as Record<string, { header: StakeholderGroup; combos: StakeholderStageCombo[] }>)
    : theoryOfChangeStages.reduce((acc, stage) => {
        const combos = filteredCombos.filter(c => c.stage._id === stage._id);
        if (combos.length > 0) {
          acc[stage._id] = {
            header: stage,
            combos: combos
          };
        }
        return acc;
      }, {} as Record<string, { header: TheoryOfChangeStage; combos: StakeholderStageCombo[] }>);

  // Calculate stats
  const totalQuestions = availableCombos.reduce((sum, combo) => sum + combo.availableQuestions, 0);
  const totalSurveys = availableCombos.reduce((sum, combo) => sum + combo.existingSurveys, 0);
  const avgQuestionsPerCombo = availableCombos.length > 0 
    ? Math.round(totalQuestions / availableCombos.length) 
    : 0;

  // Render combo card
  const renderComboCard = (combo: StakeholderStageCombo) => (
    <Card 
      key={`${combo.stakeholderGroup._id}-${combo.stage._id}`}
      className="group bg-white border-concrete-500/20 hover:border-sky-500/50 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
      onClick={() => handleContinueToBuilder(combo.stakeholderGroup._id, combo.stage._id)}
    >
      <div className={`h-2 ${viewMode === 'stakeholder' ? getStageColor(combo.stage.stageType) : getStakeholderCategoryColor(combo.stakeholderGroup.category)}`} />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {viewMode === 'stakeholder' ? (
              <div className="flex items-center gap-2 mb-2">
                {getStageIcon(combo.stage.stageType)}
                <Badge className={`text-xs ${getStageColor(combo.stage.stageType)}`}>
                  Stage {combo.stage.stageNumber}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-sky-500" />
                <Badge className={`text-xs ${getStakeholderCategoryColor(combo.stakeholderGroup.category)}`}>
                  {getCategoryName(combo.stakeholderGroup.category)}
                </Badge>
              </div>
            )}
            <CardTitle className="text-lg group-hover:text-sky-500 transition-colors">
              {viewMode === 'stakeholder' ? combo.stage.name : combo.stakeholderGroup.name}
            </CardTitle>
          </div>
          <ChevronRight className="h-5 w-5 text-concrete-500 group-hover:text-sky-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-stratosphere-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="h-4 w-4 text-grass-500" />
              <div className="text-2xl font-bold text-grass-500">
                {combo.availableQuestions}
              </div>
            </div>
            <div className="text-xs text-sky-500">
              Questions Available
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="h-4 w-4 text-ochre-500" />
              <div className="text-2xl font-bold text-ochre-500">
                {combo.existingSurveys}
              </div>
            </div>
            <div className="text-xs text-sky-500">
              Surveys Created
            </div>
          </div>
        </div>
        
        {combo.lastSurveyDate && (
          <div className="flex items-center gap-2 text-xs text-sky-500 mb-4 px-3 py-2 bg-sky-50 rounded-lg">
            <Clock className="h-3 w-3" />
            Last survey: {new Date(combo.lastSurveyDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        )}
        
        <Button 
          className="w-full bg-grass-500 hover:bg-grass-600 text-white shadow-lg shadow-grass-500/20 group-hover:shadow-xl"
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Build Survey
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );

  // Render combo list item (for list view)
  const renderComboListItem = (combo: StakeholderStageCombo) => (
    <div
      key={`${combo.stakeholderGroup._id}-${combo.stage._id}`}
      className="group bg-white border border-concrete-500/20 hover:border-sky-500/50 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => handleContinueToBuilder(combo.stakeholderGroup._id, combo.stage._id)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className={`p-3 rounded-lg ${viewMode === 'stakeholder' ? getStageColor(combo.stage.stageType) : getStakeholderCategoryColor(combo.stakeholderGroup.category)}`}>
            {viewMode === 'stakeholder' ? getStageIcon(combo.stage.stageType) : <Users className="h-5 w-5" />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-stratosphere-900 group-hover:text-sky-500 transition-colors">
                {viewMode === 'stakeholder' ? combo.stage.name : combo.stakeholderGroup.name}
              </h3>
              <Badge className={`text-xs ${viewMode === 'stakeholder' ? getStageColor(combo.stage.stageType) : getStakeholderCategoryColor(combo.stakeholderGroup.category)}`}>
                {viewMode === 'stakeholder' ? `Stage ${combo.stage.stageNumber}` : getCategoryName(combo.stakeholderGroup.category)}
              </Badge>
            </div>
            {combo.lastSurveyDate && (
              <div className="flex items-center gap-2 text-xs text-sky-500">
                <Clock className="h-3 w-3" />
                Last survey: {new Date(combo.lastSurveyDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-grass-500">{combo.availableQuestions}</div>
            <div className="text-xs text-sky-500">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-ochre-500">{combo.existingSurveys}</div>
            <div className="text-xs text-sky-500">Surveys</div>
          </div>
          <Button 
            size="sm"
            className="bg-grass-500 hover:bg-grass-600 text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Build
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

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
            <p className="text-stratosphere-900 font-medium">Loading survey builder...</p>
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
              <AlertCircle className="h-12 w-12 text-ochre-500" />
            </div>
            <h2 className="text-xl font-semibold text-stratosphere-900 mb-2">Error Loading Builder</h2>
            <p className="text-sky-500 mb-6">{error}</p>
            <Button 
              onClick={fetchData}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - no stakeholders or stages
  if (stakeholderGroups.length === 0 || theoryOfChangeStages.length === 0) {
    return (
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar 
          projectId={projectId}
          projectName={project?.name || 'Project'}
        />
        <div className="flex-1">
          <div className="bg-white px-8 py-6 border-b border-concrete-500/20">
            <Link 
              href={`/dashboard/project/${projectId}/surveys`}
              className="flex items-center text-sky-500 hover:text-stratosphere-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Surveys
            </Link>
            <h1 className="text-2xl font-semibold text-stratosphere-900">Survey Builder</h1>
          </div>

          <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-2xl">
              <div className="bg-sky-50 rounded-full p-8 w-fit mx-auto mb-6">
                <FileText className="h-16 w-16 text-sky-500" />
              </div>
              <h2 className="text-2xl font-bold text-stratosphere-900 mb-3">Setup Required</h2>
              <p className="text-sky-500 text-lg mb-8">
                {stakeholderGroups.length === 0 && theoryOfChangeStages.length === 0
                  ? 'You need to set up stakeholder groups and theory of change stages before creating surveys.'
                  : stakeholderGroups.length === 0
                  ? 'You need to set up stakeholder groups before creating surveys.'
                  : 'You need to set up theory of change stages before creating surveys.'}
              </p>
              <div className="flex gap-4 justify-center">
                {stakeholderGroups.length === 0 && (
                  <Link href={`/dashboard/project/${projectId}/stakeholder-mapping`}>
                    <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                      <Users className="h-4 w-4 mr-2" />
                      Setup Stakeholders
                    </Button>
                  </Link>
                )}
                {theoryOfChangeStages.length === 0 && (
                  <Link href={`/dashboard/project/${projectId}/theory-of-change`}>
                    <Button className="bg-grass-500 hover:bg-grass-600 text-white">
                      <GitBranch className="h-4 w-4 mr-2" />
                      Setup Theory of Change
                    </Button>
                  </Link>
                )}
              </div>
            </div>
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
              href={`/dashboard/project/${projectId}/surveys`}
              className="flex items-center text-sky-500 hover:text-stratosphere-900 mb-6 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Surveys
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-stratosphere-900">Create Your Survey</h1>
                  <Sparkles className="h-6 w-6 text-sky-500" />
                </div>
                <p className="text-sky-500 max-w-2xl">
                  Choose a stakeholder group and theory of change stage combination to start building. 
                  Our intelligent system will show you relevant, curated questions for your context.
                </p>
              </div>
              
              <Link href={`/dashboard/project/${projectId}/surveys/intro`}>
                <Button 
                  variant="outline" 
                  className="border-sky-500/30 text-sky-500 hover:bg-sky-50 flex-shrink-0"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-sky-50 to-white border-sky-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-sky-500 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Stakeholder Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-stratosphere-900">{stakeholderGroups.length}</div>
                <p className="text-xs text-sky-500 mt-1">Available to survey</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-grass-50 to-white border-grass-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-grass-500 flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  ToC Stages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-stratosphere-900">{theoryOfChangeStages.length}</div>
                <p className="text-xs text-sky-500 mt-1">Project lifecycle stages</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-clay-50 to-white border-clay-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-clay-500 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-stratosphere-900">{totalQuestions}</div>
                <p className="text-xs text-sky-500 mt-1">Curated & available</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-ochre-50 to-white border-ochre-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-ochre-500 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Existing Surveys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-stratosphere-900">{totalSurveys}</div>
                <p className="text-xs text-sky-500 mt-1">Already created for this project</p>
              </CardContent>
            </Card>
          </div>

          {/* Info Alert */}
          <Alert className="mb-8 border-sky-500/30 bg-gradient-to-r from-sky-50 to-grass-50">
            <Info className="h-5 w-5 text-sky-500" />
            <AlertTitle className="text-stratosphere-900 font-semibold">Smart Question Filtering</AlertTitle>
            <AlertDescription className="text-sky-500">
              Each combination shows questions specifically curated for that stakeholder group and project stage. 
              Questions are pre-filtered by relevance, themes, and compliance requirements.
            </AlertDescription>
          </Alert>

          {/* Filters & View Toggle */}
          <Card className="mb-8 border-concrete-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Find Your Context</CardTitle>
                  <CardDescription>This is a 2 step filter process. You start by filtering by either by grid or list view, or by stakeholder or stage. If you have a specific stakeholder or stage you want to find you can search by the list below</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Display Mode Toggle */}
                  <div className="flex items-center gap-1 bg-stratosphere-50 rounded-lg p-1">
                    <Button
                      variant={displayMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setDisplayMode('grid')}
                      className={displayMode === 'grid' ? 'bg-sky-500 text-white hover:bg-sky-600' : 'hover:bg-white'}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={displayMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setDisplayMode('list')}
                      className={displayMode === 'list' ? 'bg-sky-500 text-white hover:bg-sky-600' : 'hover:bg-white'}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* View Mode Toggle */}
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'stakeholder' | 'stage')}>
                    <TabsList className="bg-stratosphere-50">
                      <TabsTrigger value="stakeholder" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white">
                        <Users className="h-4 w-4 mr-2" />
                        By Stakeholder
                      </TabsTrigger>
                      <TabsTrigger value="stage" className="data-[state=active]:bg-grass-500 data-[state=active]:text-white">
                        <GitBranch className="h-4 w-4 mr-2" />
                        By Stage
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
                  <Input
                    placeholder="Search stakeholder groups or stages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-concrete-500/30 focus:border-sky-500 focus:ring-sky-500/20"
                  />
                </div>
                
                <Select value={stakeholderFilter} onValueChange={setStakeholderFilter}>
                  <SelectTrigger className="w-full lg:w-64 border-concrete-500/30">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Stakeholder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stakeholders</SelectItem>
                    {stakeholderGroups.map(group => (
                      <SelectItem key={group._id} value={group._id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-full lg:w-64 border-concrete-500/30">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {theoryOfChangeStages.map(stage => (
                      <SelectItem key={stage._id} value={stage._id}>
                        Stage {stage.stageNumber}: {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Collapse/Expand All Controls */}
          {Object.keys(groupedCombos).length > 1 && (
            <div className="flex justify-end gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
                className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
                className="border-concrete-500/30 text-concrete-500 hover:bg-concrete-50"
              >
                <ChevronUp className="h-4 w-4 mr-2" />
                Collapse All
              </Button>
            </div>
          )}

          {/* Grouped Survey Options */}
          {Object.keys(groupedCombos).length === 0 ? (
            <Card className="border-concrete-500/20">
              <CardContent className="py-16">
                <div className="text-center max-w-md mx-auto">
                  <div className="bg-concrete-50 rounded-full p-6 w-fit mx-auto mb-6">
                    <FileText className="h-12 w-12 text-concrete-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-stratosphere-900 mb-2">No Matches Found</h3>
                  <p className="text-sky-500 mb-6">
                    Try adjusting your search or filters to find available combinations
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setStakeholderFilter('all');
                      setStageFilter('all');
                    }}
                    variant="outline"
                    className="border-sky-500/30 text-sky-500 hover:bg-sky-50"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Instruction Text */}
              <div className="text-center py-4">
                <p className="text-lg text-stratosphere-900">
                  Decide which survey you would like to build and click build survey
                </p>
              </div>
              {Object.entries(groupedCombos).map(([key, group]) => {
                const isCollapsed = collapsedGroups[key] || false;
                const combosToShow = group.combos;
                
                return (
                  <Collapsible
                    key={key}
                    open={!isCollapsed}
                    onOpenChange={() => toggleGroupCollapse(key)}
                  >
                    <Card className="border-concrete-500/20 overflow-hidden">
                      {/* Collapsible Header */}
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-stratosphere-50 transition-colors">
                          {viewMode === 'stakeholder' ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="bg-grass-500 rounded-lg p-3">
                                  <Users className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-xl font-bold text-stratosphere-900">
                                      {(group.header as StakeholderGroup).name}
                                    </h2>
                                    <Badge className={getStakeholderCategoryColor((group.header as StakeholderGroup).category)}>
                                      {getCategoryName((group.header as StakeholderGroup).category)}
                                    </Badge>
                                  </div>
                                  {(group.header as StakeholderGroup).description && (
                                    <p className="text-sky-500 text-sm">{(group.header as StakeholderGroup).description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm font-medium text-stratosphere-900">{group.combos.length} stages</div>
                                  <div className="text-xs text-sky-500">available</div>
                                </div>
                                {isCollapsed ? (
                                  <ChevronDown className="h-5 w-5 text-sky-500" />
                                ) : (
                                  <ChevronUp className="h-5 w-5 text-sky-500" />
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="bg-grass-500 rounded-lg p-3">
                                  <div className="flex items-center gap-2">
                                    {getStageIcon((group.header as TheoryOfChangeStage).stageType)}
                                    <span className="text-white font-medium">
                                      Stage {(group.header as TheoryOfChangeStage).stageNumber}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h2 className="text-xl font-bold text-stratosphere-900 mb-1">
                                    {(group.header as TheoryOfChangeStage).name}
                                  </h2>
                                  {(group.header as TheoryOfChangeStage).description && (
                                    <p className="text-sky-500 text-sm">{(group.header as TheoryOfChangeStage).description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm font-medium text-stratosphere-900">{group.combos.length} stakeholders</div>
                                  <div className="text-xs text-sky-500">available</div>
                                </div>
                                {isCollapsed ? (
                                  <ChevronDown className="h-5 w-5 text-sky-500" />
                                ) : (
                                  <ChevronUp className="h-5 w-5 text-sky-500" />
                                )}
                              </div>
                            </div>
                          )}
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      {/* Collapsible Content */}
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-6">
                          {displayMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {combosToShow.map(renderComboCard)}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {combosToShow.map(renderComboListItem)}
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilderLandingPage;