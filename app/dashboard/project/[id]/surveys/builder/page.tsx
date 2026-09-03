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
  Sparkles,
  BarChart3,
  AlertCircle,
  Clock,
  MessageSquare,
  Grid3x3,
  List,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ProjectSidebar from '@/components/project/ProjectSidebar';
import HeaderHelpActions from '@/components/HeaderHelpActions';
import { useToast } from "@/hooks/use-toast";
import { getSurveyBuilderOverview } from '@/lib/api/survey';
import { getProject } from '@/lib/api/project';
import { encodeIdList } from '@/lib/utils/builderRouteParams';
import { StakeholderGroup } from '@/types';
import { Category } from '@/types/taxonomy';
import { cn } from '@/lib/utils';

interface PageParams {
  id: string;
}

interface TheoryOfChangeStage {
  _id: string;
  stageNumber: number;
  stageType?: string;
  name: string;
  description?: string;
}

interface StakeholderStageCombo {
  stakeholderGroups: StakeholderGroup[];
  stage: TheoryOfChangeStage;
  availableQuestions: number;
  existingSurveys: number;
  lastSurveyDate?: string;
  isBoth?: boolean;
  // The specific Action/Impact record this card represents — carried through navigation so
  // the question-selection page scopes eligibility to exactly this record.
  sourceActionId?: string;
  sourceImpactId?: string;
}

// Truncated, scannable label ("A + B + 6 more") for titles/headings where space is tight.
const comboGroupsLabel = (combo: StakeholderStageCombo, max = 2): string => {
  const names = combo.stakeholderGroups.map(g => g.name);
  if (names.length <= max) return names.join(' + ');
  return `${names.slice(0, max).join(' + ')} + ${names.length - max} more`;
};

// Full, untruncated list — used as a hover tooltip so the complete set is always one hover away.
const comboGroupsFullLabel = (combo: StakeholderStageCombo): string =>
  combo.stakeholderGroups.map(g => g.name).join(', ');

const getComboStageScope = (combo: StakeholderStageCombo): 'stage1' | 'stage2' | 'both' =>
  combo.isBoth ? 'both' : combo.stage.stageNumber === 1 ? 'stage1' : 'stage2';

const STAGE_SCOPE_LABELS: Record<'stage1' | 'stage2' | 'both', string> = {
  stage1: 'Stage 1',
  stage2: 'Stage 2',
  both: 'Both Stages'
};

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
  // Empty array = "all" for both — these narrow the grid of real, ToC-derived combos;
  // they don't construct new ones.
  const [stakeholderFilterIds, setStakeholderFilterIds] = useState<string[]>([]);
  const [stageScopeFilters, setStageScopeFilters] = useState<Array<'stage1' | 'stage2' | 'both'>>([]);
  const [stakeholderDropdownSearch, setStakeholderDropdownSearch] = useState('');
  // Default to grouping by Stage (Stage 1 / Stage 2 / Both) — that's the primary lens for
  // "what are we building a survey for," with stakeholder-group composition shown on every
  // card regardless of which grouping is active.
  const [viewMode, setViewMode] = useState<'stakeholder' | 'stage'>('stage');
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

      // Single aggregate call replaces the old per-combo loop (stakeholder groups, stages,
      // available-question counts, and existing-survey counts all computed server-side)
      const overviewResponse = await getSurveyBuilderOverview(projectId);
      const { stakeholderGroups: sgs, stages: sts, combos: overviewCombos } = overviewResponse.data;
      setStakeholderGroups(sgs);
      setTheoryOfChangeStages(sts);

      if (sgs.length === 0 || sts.length === 0) {
        setAvailableCombos([]);
        setLoading(false);
        return;
      }

      const combos: StakeholderStageCombo[] = overviewCombos.map(c => {
        const stakeholders = c.stakeholderGroupIds
          .map((gid: string) => sgs.find((g: StakeholderGroup) => g._id === gid))
          .filter((g): g is StakeholderGroup => Boolean(g));
        const isBoth = c.stageScope === 'both';
        const stage: TheoryOfChangeStage | undefined = isBoth
          ? {
              _id: encodeIdList(c.stageIds),
              stageNumber: 0,
              stageType: 'both',
              name: 'Both Stages',
              description: 'Questions covering Stage 1 (Output) and Stage 2 (Outcome)'
            }
          : sts.find((s: TheoryOfChangeStage) => c.stageIds.includes(s._id));

        return { stakeholders, isBoth, stage, c };
      })
        // Defensively drop any combo whose stakeholder group(s) or stage couldn't be
        // resolved against the overview's own reference lists (should never happen with
        // fresh data, but avoids a hard crash if state and code ever get out of sync).
        .filter((entry): entry is typeof entry & { stage: TheoryOfChangeStage } =>
          entry.stakeholders.length > 0 && Boolean(entry.stage))
        .map(({ stakeholders, isBoth, stage, c }) => ({
          stakeholderGroups: stakeholders,
          stage,
          availableQuestions: c.availableQuestions,
          existingSurveys: c.existingSurveys,
          lastSurveyDate: c.lastSurveyDate ?? undefined,
          isBoth,
          sourceActionId: c.sourceActionId,
          sourceImpactId: c.sourceImpactId
        }));

      setAvailableCombos(combos);

      // Initialize collapsed state - auto-collapse if more than threshold
      const shouldAutoCollapse = viewMode === 'stakeholder'
        ? sgs.length > COLLAPSE_THRESHOLD
        : sts.length > COLLAPSE_THRESHOLD;

      if (shouldAutoCollapse) {
        const initialCollapsed: Record<string, boolean> = {};
        (viewMode === 'stakeholder' ? sgs : sts).forEach((item: any, index: any) => {
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

  // stageId may itself already be a comma-joined "both stages" id (see the isBoth branch in
  // fetchData) — it's passed through as-is, only the group id list needs encoding here.
  // sourceActionId/sourceImpactId identify the SPECIFIC Action/Impact this card represents —
  // required on the next page so it can scope eligibility to this record alone, since other
  // distinct records can share the exact same stakeholder-group set.
  const handleContinueToBuilder = (combo: StakeholderStageCombo) => {
    const groupIds = combo.stakeholderGroups.map(g => g._id);
    const sourceParams = new URLSearchParams();
    if (combo.sourceActionId) sourceParams.set('actionId', combo.sourceActionId);
    if (combo.sourceImpactId) sourceParams.set('impactId', combo.sourceImpactId);
    const query = sourceParams.toString();
    router.push(
      `/dashboard/project/${projectId}/surveys/builder/${encodeIdList(groupIds)}/${combo.stage._id}${query ? `?${query}` : ''}`
    );
  };

  const toggleStakeholderFilter = (groupId: string) => {
    setStakeholderFilterIds(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const toggleStageScopeFilter = (scope: 'stage1' | 'stage2' | 'both') => {
    setStageScopeFilters(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  const getStageIcon = (stageType?: string) => {
    switch (stageType) {
      case 'input': return <Target className="h-4 w-4" />;
      case 'activity': return <Layers className="h-4 w-4" />;
      case 'output': return <FileText className="h-4 w-4" />;
      case 'outcome': return <TrendingUp className="h-4 w-4" />;
      case 'impact': return <CheckCircle className="h-4 w-4" />;
      case 'both': return <Layers className="h-4 w-4" />;
      default: return <GitBranch className="h-4 w-4" />;
    }
  };

  const getStageColor = (stageType?: string) => {
    switch (stageType) {
      case 'input': return 'bg-sky-50 text-sky-500 border-sky-500/20';
      case 'activity': return 'bg-ochre-50 text-ochre-500 border-ochre-500/20';
      case 'output': return 'bg-grass-50 text-forest border-grass-500/20';
      case 'outcome': return 'bg-grass-50 text-forest border-grass-500/20';
      case 'impact': return 'bg-forest-50 text-forest-500 border-forest-500/20';
      case 'both': return 'bg-stratosphere-50 text-stratosphere border-stratosphere/20';
      default: return 'bg-concrete-50 text-concrete-500 border-concrete-500/20';
    }
  };

  const getStakeholderCategoryColor = (category: string | Category) => {
    const categoryName = typeof category === 'string' ? category : category.name;
    switch (categoryName.toLowerCase()) {
      case 'community': return 'bg-grass-50 text-forest border-grass-500/20';
      case 'institutional': return 'bg-sky-50 text-sky-500 border-sky-500/20';
      case 'organizational': return 'bg-ochre-50 text-ochre-500 border-ochre-500/20';
      case 'government': return 'bg-grass-50 text-forest border-grass-500/20';
      case 'vulnerable groups': return 'bg-sand-50 text-clay border-sand-500/20';
      default: return 'bg-concrete-50 text-concrete-500 border-concrete-500/20';
    }
  };

  const getCategoryName = (category: string | Category): string => {
    return typeof category === 'string' ? category : category.name;
  };

  const filteredCombos = availableCombos.filter(combo => {
    const matchesSearch = combo.stakeholderGroups.some(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         combo.stage.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Multi-select filters: empty selection = no restriction. A combo matches the
    // stakeholder filter if it includes ANY of the selected groups (so filtering by one
    // member of a multi-group combo still surfaces that combo).
    const matchesStakeholder = stakeholderFilterIds.length === 0 ||
      combo.stakeholderGroups.some(g => stakeholderFilterIds.includes(g._id));
    const matchesStage = stageScopeFilters.length === 0 ||
      stageScopeFilters.includes(getComboStageScope(combo));

    return matchesSearch && matchesStakeholder && matchesStage;
  });

  // Group combos by stakeholder or stage based on view mode. A multi-group combo is listed
  // under every participating stakeholder's section when grouping by stakeholder.
  const groupedCombos = viewMode === 'stakeholder'
    ? stakeholderGroups.reduce((acc, stakeholder) => {
        const combos = filteredCombos.filter(c => c.stakeholderGroups.some(g => g._id === stakeholder._id));
        if (combos.length > 0) {
          acc[stakeholder._id] = {
            header: stakeholder,
            combos: combos
          };
        }
        return acc;
      }, {} as Record<string, { header: StakeholderGroup; combos: StakeholderStageCombo[] }>)
    : (() => {
        const acc = theoryOfChangeStages.reduce((a, stage) => {
          const combos = filteredCombos.filter(c => c.stage._id === stage._id);
          if (combos.length > 0) {
            a[stage._id] = { header: stage, combos };
          }
          return a;
        }, {} as Record<string, { header: TheoryOfChangeStage; combos: StakeholderStageCombo[] }>);
        // Add "Both Stages" group if any both combos exist in the filtered set
        const bothCombos = filteredCombos.filter(c => c.isBoth);
        if (bothCombos.length > 0) {
          acc['both'] = { header: bothCombos[0].stage, combos: bothCombos };
        }
        return acc;
      })();

  // Calculate stats
  const totalQuestions = availableCombos.reduce((sum, combo) => sum + combo.availableQuestions, 0);
  const totalSurveys = availableCombos.reduce((sum, combo) => sum + combo.existingSurveys, 0);
  const avgQuestionsPerCombo = availableCombos.length > 0
    ? Math.round(totalQuestions / availableCombos.length)
    : 0;

  // Render combo card
  const renderComboCard = (combo: StakeholderStageCombo) => {
    const isMultiGroup = combo.stakeholderGroups.length > 1;
    return (
    <Card
      key={`${combo.sourceActionId || ''}-${combo.sourceImpactId || ''}-${combo.stakeholderGroups.map(g => g._id).join(',')}-${combo.stage._id}`}
      className={`group bg-white hover:shadow-xl transition-all cursor-pointer overflow-hidden ${combo.isBoth ? 'border-stratosphere/30 hover:border-stratosphere/60' : 'border-concrete-500/20 hover:border-sky-500/50'}`}
      onClick={() => handleContinueToBuilder(combo)}
    >
      <div className={`h-2 ${combo.isBoth ? 'bg-stratosphere' : getStageColor(combo.stage.stageType)}`} />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {/* Stage identity and stakeholder-group composition are always both shown —
                which you're grouping by only changes what's used as the section heading. */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {getStageIcon(combo.stage.stageType)}
              <Badge className={`text-xs ${getStageColor(combo.stage.stageType)}`}>
                {combo.isBoth ? 'Both Stages' : `Stage ${combo.stage.stageNumber}`}
              </Badge>
              <Badge
                variant="outline"
                title={comboGroupsFullLabel(combo)}
                className={`text-xs gap-1 ${isMultiGroup ? 'border-stratosphere text-stratosphere' : 'border-concrete-500/30 text-concrete-500'}`}
              >
                <Users className="h-3 w-3" />
                {isMultiGroup ? `${combo.stakeholderGroups.length} Stakeholder Groups` : getCategoryName(combo.stakeholderGroups[0].category)}
              </Badge>
            </div>
            <CardTitle className="text-lg group-hover:text-sky-500 transition-colors" title={comboGroupsFullLabel(combo)}>
              {viewMode === 'stakeholder' ? combo.stage.name : comboGroupsLabel(combo)}
            </CardTitle>
            {viewMode === 'stakeholder' && (
              <p className="text-xs text-sky-500 mt-1 truncate" title={comboGroupsFullLabel(combo)}>
                {comboGroupsLabel(combo, 3)}
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-concrete-500 group-hover:text-sky-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-stratosphere-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="h-4 w-4 text-forest" />
              <div className="text-2xl font-light text-forest">
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
              <div className="text-2xl font-light text-ochre-500">
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
  };

  // Render combo list item (for list view)
  const renderComboListItem = (combo: StakeholderStageCombo) => {
    const isMultiGroup = combo.stakeholderGroups.length > 1;
    const stakeholderLabel = isMultiGroup ? `${combo.stakeholderGroups.length} Stakeholder Groups` : getCategoryName(combo.stakeholderGroups[0].category);
    return (
    <div
      key={`${combo.sourceActionId || ''}-${combo.sourceImpactId || ''}-${combo.stakeholderGroups.map(g => g._id).join(',')}-${combo.stage._id}`}
      className="group bg-white border border-concrete-500/20 hover:border-sky-500/50 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => handleContinueToBuilder(combo)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className={`p-3 rounded-lg ${combo.isBoth ? 'bg-stratosphere text-white' : getStageColor(combo.stage.stageType)}`}>
            {getStageIcon(combo.stage.stageType)}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-stratosphere-900 group-hover:text-sky-500 transition-colors">
                {viewMode === 'stakeholder' ? combo.stage.name : comboGroupsLabel(combo)}
              </h3>
              <Badge className={`text-xs ${combo.isBoth ? 'bg-stratosphere text-white' : getStageColor(combo.stage.stageType)}`}>
                {combo.isBoth ? 'Both Stages' : `Stage ${combo.stage.stageNumber}`}
              </Badge>
              <Badge
                variant="outline"
                title={comboGroupsFullLabel(combo)}
                className={`text-xs gap-1 ${isMultiGroup ? 'border-stratosphere text-stratosphere' : 'border-concrete-500/30 text-concrete-500'}`}
              >
                <Users className="h-3 w-3" />
                {stakeholderLabel}
              </Badge>
            </div>
            {viewMode === 'stakeholder' && (
              <p className="text-xs text-sky-500 truncate max-w-md" title={comboGroupsFullLabel(combo)}>
                {comboGroupsLabel(combo, 3)}
              </p>
            )}
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
            <div className="text-2xl font-light text-forest">{combo.availableQuestions}</div>
            <div className="text-xs text-sky-500">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light text-ochre-500">{combo.existingSurveys}</div>
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
  };

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
            <div className="bg-ochre-50 rounded p-6 w-fit mx-auto mb-4">
              <AlertCircle className="h-12 w-12 text-ochre-500" />
            </div>
            <h2 className="text-stratosphere-900 mb-2">Error Loading Builder</h2>
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
            <h1 className="text-stratosphere-900">Survey Builder</h1>
          </div>

          <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-2xl">
              <div className="bg-sky-50 rounded p-8 w-fit mx-auto mb-6">
                <FileText className="h-16 w-16 text-sky-500" />
              </div>
              <h2 className="text-stratosphere-900 mb-3">Setup Required</h2>
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
                  <h1 className="text-stratosphere-900">Create Your Survey</h1>
                  <Sparkles className="h-6 w-6 text-sky-500" />
                </div>
                {project?.organization && (
                  <HeaderHelpActions
                    organizationId={project.organization}
                    guideHref={`/dashboard/project/${projectId}/surveys/intro`}
                    className="mb-2"
                  />
                )}
                <p className="text-sky-500 max-w-2xl">
                  Choose a stakeholder group and theory of change stage combination to start building.
                  Our intelligent system will show you relevant, curated questions for your context.
                </p>
              </div>
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
                <div className="text-3xl font-light text-stratosphere-900">{stakeholderGroups.length}</div>
                <p className="text-xs text-sky-500 mt-1">Available to survey</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-grass-50 to-white border-grass-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-forest flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  ToC Stages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light text-stratosphere-900">{theoryOfChangeStages.length}</div>
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
                <div className="text-3xl font-light text-stratosphere-900">{totalQuestions}</div>
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
                <div className="text-3xl font-light text-stratosphere-900">{totalSurveys}</div>
                <p className="text-xs text-sky-500 mt-1">Already created for this project</p>
              </CardContent>
            </Card>
          </div>

          {/* Info Alert */}
          <Alert className="mb-8 border-sky-500/30 bg-gradient-to-r from-sky-50 to-grass-50">
            <Info className="h-5 w-5 text-sky-500" />
            <AlertTitle className="text-stratosphere-900 font-semibold">Smart Question Filtering</AlertTitle>
            <AlertDescription className="text-sky-500">
              Each combination reflects exactly how stakeholder groups are recorded in Theory of Change —
              including groups combined together on a single Action or Impact — and shows questions
              curated for that exact combination and stage.
            </AlertDescription>
          </Alert>

          {/* Filters & View Toggle */}
          <Card className="mb-8 border-concrete-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Find Your Context</CardTitle>
                  <CardDescription>Search, or narrow the grid by one or more stakeholder groups and by stage — you can select several of each at once.</CardDescription>
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

                <DropdownMenu onOpenChange={(open) => { if (!open) setStakeholderDropdownSearch(''); }}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full lg:w-64 justify-between font-normal',
                        stakeholderFilterIds.length > 0
                          ? 'border-sky-500 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800'
                          : 'border-concrete-500/30'
                      )}
                    >
                      <span className="flex items-center truncate">
                        <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
                        {stakeholderFilterIds.length === 0
                          ? 'All Stakeholders'
                          : stakeholderFilterIds.length === 1
                          ? stakeholderGroups.find(g => g._id === stakeholderFilterIds[0])?.name || '1 Stakeholder'
                          : `${stakeholderFilterIds.length} Stakeholders`}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <DropdownMenuLabel className="p-0">Stakeholder Groups</DropdownMenuLabel>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          className="text-sky-500 hover:text-sky-700 font-medium disabled:opacity-40 disabled:pointer-events-none"
                          disabled={stakeholderFilterIds.length === stakeholderGroups.length}
                          onClick={() => setStakeholderFilterIds(stakeholderGroups.map(g => g._id))}
                        >
                          Select all
                        </button>
                        <span className="text-concrete-300">·</span>
                        <button
                          className="text-sky-500 hover:text-sky-700 font-medium disabled:opacity-40 disabled:pointer-events-none"
                          disabled={stakeholderFilterIds.length === 0}
                          onClick={() => setStakeholderFilterIds([])}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {stakeholderGroups.length > 6 && (
                      <div className="px-2 py-1.5">
                        <Input
                          value={stakeholderDropdownSearch}
                          onChange={(e) => setStakeholderDropdownSearch(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          placeholder="Search groups..."
                          className="h-8 text-sm"
                        />
                      </div>
                    )}
                    <div className="max-h-64 overflow-y-auto">
                      {stakeholderGroups
                        .filter(g => g.name.toLowerCase().includes(stakeholderDropdownSearch.toLowerCase()))
                        .map(group => (
                          <DropdownMenuCheckboxItem
                            key={group._id}
                            checked={stakeholderFilterIds.includes(group._id)}
                            onSelect={(e) => { e.preventDefault(); toggleStakeholderFilter(group._id); }}
                          >
                            {group.name}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full lg:w-64 justify-between font-normal',
                        stageScopeFilters.length > 0
                          ? 'border-grass-500 bg-grass-50 text-grass-700 hover:bg-grass-100 hover:text-grass-800'
                          : 'border-concrete-500/30'
                      )}
                    >
                      <span className="flex items-center truncate">
                        <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
                        {stageScopeFilters.length === 0
                          ? 'All Stages'
                          : stageScopeFilters.length === 1
                          ? STAGE_SCOPE_LABELS[stageScopeFilters[0]]
                          : `${stageScopeFilters.length} Stage Options`}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuLabel>Stage</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {theoryOfChangeStages.some(s => s.stageNumber === 1) && (
                      <DropdownMenuCheckboxItem
                        checked={stageScopeFilters.includes('stage1')}
                        onSelect={(e) => { e.preventDefault(); toggleStageScopeFilter('stage1'); }}
                      >
                        Stage 1
                      </DropdownMenuCheckboxItem>
                    )}
                    {theoryOfChangeStages.some(s => s.stageNumber === 2) && (
                      <DropdownMenuCheckboxItem
                        checked={stageScopeFilters.includes('stage2')}
                        onSelect={(e) => { e.preventDefault(); toggleStageScopeFilter('stage2'); }}
                      >
                        Stage 2
                      </DropdownMenuCheckboxItem>
                    )}
                    {theoryOfChangeStages.some(s => s.stageNumber === 1) && theoryOfChangeStages.some(s => s.stageNumber === 2) && (
                      <DropdownMenuCheckboxItem
                        checked={stageScopeFilters.includes('both')}
                        onSelect={(e) => { e.preventDefault(); toggleStageScopeFilter('both'); }}
                      >
                        Both Stages
                      </DropdownMenuCheckboxItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {(searchTerm || stakeholderFilterIds.length > 0 || stageScopeFilters.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-concrete-500/10">
                  <span className="text-xs font-medium text-concrete-500 uppercase tracking-wide">Active:</span>
                  {searchTerm && (
                    <Badge variant="outline" className="gap-1.5 pl-2.5 pr-1.5 py-1 border-concrete-500/30 text-stratosphere-900 bg-white">
                      &quot;{searchTerm}&quot;
                      <button onClick={() => setSearchTerm('')} className="rounded hover:bg-concrete-100 p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {stakeholderFilterIds.map(id => {
                    const group = stakeholderGroups.find(g => g._id === id);
                    if (!group) return null;
                    return (
                      <Badge key={id} variant="outline" className="gap-1.5 pl-2.5 pr-1.5 py-1 border-sky-500/30 text-sky-700 bg-sky-50">
                        {group.name}
                        <button onClick={() => toggleStakeholderFilter(id)} className="rounded hover:bg-sky-100 p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                  {stageScopeFilters.map(scope => (
                    <Badge key={scope} variant="outline" className="gap-1.5 pl-2.5 pr-1.5 py-1 border-grass-500/30 text-grass-700 bg-grass-50">
                      {STAGE_SCOPE_LABELS[scope]}
                      <button onClick={() => toggleStageScopeFilter(scope)} className="rounded hover:bg-grass-100 p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <button
                    onClick={() => { setSearchTerm(''); setStakeholderFilterIds([]); setStageScopeFilters([]); }}
                    className="text-xs text-sky-500 hover:text-sky-700 underline underline-offset-2 ml-1"
                  >
                    Clear all
                  </button>
                  <span className="text-xs text-sky-500 ml-auto">
                    Showing {filteredCombos.length} of {availableCombos.length} combinations
                  </span>
                </div>
              )}
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
                  <div className="bg-concrete-50 rounded p-6 w-fit mx-auto mb-6">
                    <FileText className="h-12 w-12 text-concrete-500" />
                  </div>
                  <h3 className="text-stratosphere-900 mb-2">No Matches Found</h3>
                  <p className="text-sky-500 mb-6">
                    Try adjusting your search or filters to find available combinations
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setStakeholderFilterIds([]);
                      setStageScopeFilters([]);
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
                                    <h2 className="text-stratosphere-900">
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
                                  <h2 className="text-stratosphere-900 mb-1">
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
