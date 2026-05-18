'use client';

import { useState } from 'react';
import { 
  Calendar, Clock, Users, Target, TrendingUp, Activity,
  ChevronDown, ChevronRight, Eye, EyeOff, BarChart3,
  GitBranch, MapPin, CheckCircle, AlertCircle, Zap,
  ArrowRight, PlayCircle, PauseCircle, StopCircle,
  User, Building, Globe, Award, Timer, AlertTriangle, Filter 
} from 'lucide-react';
import { BaseReportData, Stage1ReportData, TheoryOfChangeReportData } from '@/types/reports';
import TheoryOfChangeVisualization from '../visuals/TheoryOfChangeVisualization';
import EnhancedGanttChart from '../visuals/EnhancedGanttChart';

interface TheoryOfChangeReportContentProps {
  report: BaseReportData;
  onUpdate?: () => void;
}

const TheoryOfChangeReportContent: React.FC<TheoryOfChangeReportContentProps> = ({ 
  report, 
  onUpdate 
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    stages: false,
    workplan: false,
    outcomes: false,
    gantt: false,
    stakeholders: false,
    risks: false,
    sites: false
  });

  // ✅ NEW: State for selected framework
  const [selectedFramework, setSelectedFramework] = useState<'themes' | 'sdgs' | 'resilience' | 'indicators' | 'esg' | 'standards'>('themes');

  // Cast to specific report type
  const tocReport = report as TheoryOfChangeReportData;
  const reportData = tocReport.reportData;

  // Detect report type
  const reportType = detectReportType(reportData);

  // Around line 44, update the detectReportType function:
  function detectReportType(data: any): 'full' | 'workplan' | 'stage1' | 'outcome' | 'consultation' {
    // Check if it's a consultation plan report
    if (data.consultationPlan) return 'consultation';
    
    // Check if it's a Stage 1 data report (NEW)
    if (data.stage1Data) return 'stage1';
    
    // Check if it's a full report (both stages)
    if (data.stage1 && data.stage2) return 'full';
    
    // Check if it's workplan (Stage 1 visuals only)
    if (data.outputs) return 'workplan';
    
    // Check if it's outcome (Stage 2 only)
    if (data.outcomes) return 'outcome';
    
    return 'full';
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSectionIcon = (section: string, isExpanded: boolean) => {
    const iconColor = isExpanded ? 'text-white' : 'text-sky';
    const icons: Record<string, React.ReactNode> = {
      overview: <TrendingUp className={iconColor} size={20} />,
      stages: <GitBranch className={iconColor} size={20} />,
      workplan: <Calendar className={iconColor} size={20} />,
      outcomes: <Target className={iconColor} size={20} />,
      gantt: <BarChart3 className={iconColor} size={20} />,
      stakeholders: <Users className={iconColor} size={20} />,
      risks: <AlertTriangle className={iconColor} size={20} />,
      sites: <MapPin className={iconColor} size={20} />
    };
    return icons[section];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'achieved': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'not_started': return 'bg-gray-400';
      case 'on_hold': return 'bg-yellow-500';
      case 'planned': return 'bg-purple-500';
      case 'at_risk': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-600';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': case 'achieved': return <CheckCircle size={16} className="text-green-600" />;
      case 'in_progress': return <PlayCircle size={16} className="text-blue-600" />;
      case 'not_started': return <StopCircle size={16} className="text-gray-600" />;
      case 'on_hold': return <PauseCircle size={16} className="text-yellow-600" />;
      case 'planned': return <Clock size={16} className="text-purple-600" />;
      case 'at_risk': return <AlertCircle size={16} className="text-red-600" />;
      default: return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  // ✅ NEW: Framework Selector Component
  const FrameworkSelector: React.FC<{
    selectedFramework: string;
    onFrameworkChange: (framework: 'themes' | 'sdgs' | 'resilience' | 'indicators' | 'esg' | 'standards') => void;
    availableFrameworks?: string[];
  }> = ({ selectedFramework, onFrameworkChange, availableFrameworks }) => {
    const frameworks = [
      { value: 'themes', label: 'Themes', icon: '🎯' },
      { value: 'sdgs', label: 'SDGs', icon: '🌍' },
      { value: 'resilience', label: 'Resilience', icon: '💪' },
      { value: 'indicators', label: 'Indicators', icon: '📊' },
      { value: 'esg', label: 'ESG', icon: '🌱' },
      { value: 'standards', label: 'Standards', icon: '⭐' }
    ];

    return (
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-sky">
          <Filter size={16} />
          <span className="font-medium">View by Framework:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {frameworks.map((fw) => (
            <button
              key={fw.value}
              onClick={() => onFrameworkChange(fw.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedFramework === fw.value
                  ? 'bg-ochre text-white shadow-md'
                  : 'bg-sky-tint text-stratosphere hover:bg-sky-tint/70'
              }`}
            >
              <span className="mr-2">{fw.icon}</span>
              {fw.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSection = (
    title: string, 
    key: string, 
    content: React.ReactNode,
    itemCount?: number
  ) => {
    const isExpanded = expandedSections[key];
    return (
      <div className="border border-sky rounded-lg mb-6 overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection(key)}
          className={`w-full px-6 py-4 flex items-center justify-between transition-all duration-200 ${
            isExpanded 
              ? 'bg-sky text-white' 
              : 'bg-sky-tint/50 hover:bg-sky-tint text-stratosphere'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg transition-colors ${
              isExpanded ? 'bg-white/20' : 'bg-white'
            }`}>
              {getSectionIcon(key, isExpanded)}
            </div>
            <h3 className="text-lg font-medium">{title}</h3>
            {itemCount !== undefined && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                isExpanded 
                  ? 'bg-white/20 text-white' 
                  : 'bg-sky text-white'
              }`}>
                {itemCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <>
                <EyeOff size={16} />
                <ChevronDown size={20} />
              </>
            ) : (
              <>
                <Eye size={16} />
                <ChevronRight size={20} />
              </>
            )}
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-6 bg-white border-t border-sky/20 overflow-x-auto">
            {content}
          </div>
        )}
      </div>
    );
  };

  // WORKPLAN REPORT RENDERER
  const renderWorkplanReport = () => {
    const workplanData = reportData as any;
    
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Workplan Overview */}
        <div className="bg-gradient-to-r from-sky-tint to-sky-tint/50 rounded-lg p-6 mb-8 border border-sky">
          <h2 className="text-xl font-semibold text-stratosphere mb-6">Work Plan Report - Stage 1 Actions</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stratosphere">Activities</h3>
                <Calendar className="text-sky" size={24} />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-stratosphere">
                  {workplanData.outputs.totalActions}
                </div>
                <div className="text-xs text-sky">Total Actions</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stratosphere">Scheduled</h3>
                <Clock className="text-green-600" size={24} />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-stratosphere">
                  {workplanData.outputs.actionsWithDates}
                </div>
                <div className="text-xs text-sky">With Dates</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stratosphere">Estimated</h3>
                <Clock className="text-ochre" size={24} />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-stratosphere">
                  {workplanData.outputs.actionsWithEstimatedDates}
                </div>
                <div className="text-xs text-sky">Date Estimated</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stratosphere">Progress</h3>
                <TrendingUp className="text-grass" size={24} />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-stratosphere">
                  {workplanData.outputs.timelineAnalysis.averageProgress}%
                </div>
                <div className="w-full bg-sky-tint rounded-full h-2 mt-2">
                  <div 
                    className="bg-grass h-2 rounded-full transition-all"
                    style={{ width: `${workplanData.outputs.timelineAnalysis.averageProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Building size={18} className="text-sky" />
                <h4 className="font-medium text-stratosphere">Organization</h4>
              </div>
              <p className="text-sky text-sm">{workplanData.organizationInfo.name}</p>
            </div>

            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Globe size={18} className="text-sky" />
                <h4 className="font-medium text-stratosphere">Project</h4>
              </div>
              <p className="text-sky text-sm">{workplanData.projectInfo.name}</p>
            </div>

            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target size={18} className="text-ochre" />
                <h4 className="font-medium text-stratosphere">Scope</h4>
              </div>
              <p className="text-sky text-sm capitalize">{workplanData.scope.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Theory of Change Visualization */}
        <TheoryOfChangeVisualization 
          reportData={reportData}
          reportType="workplan"
        />

        {/* Gantt Timeline */}
        {renderSection(
          'Timeline & Work Plan Visualization',
          'gantt',
          <EnhancedGanttChart 
            ganttTimeline={workplanData.outputs.ganttTimeline}
            timelineAnalysis={workplanData.outputs.timelineAnalysis}
            workloadDistribution={workplanData.outputs.workloadDistribution}
            showMetrics={true}
          />,
          workplanData.outputs.ganttTimeline.length
        )}

        {/* Timeline Analysis */}
        {renderSection(
          'Timeline Analysis',
          'workplan',
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-sky-tint rounded-lg p-6">
              <h4 className="font-semibold text-stratosphere mb-4">Critical Path</h4>
              {workplanData.outputs.timelineAnalysis.criticalPath.length > 0 ? (
                <div className="space-y-3">
                  {workplanData.outputs.timelineAnalysis.criticalPath.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-white rounded border">
                      <Zap className="text-ochre flex-shrink-0" size={16} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stratosphere truncate">{item.name}</div>
                        <div className="text-xs text-sky">{item.stakeholder.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sky text-sm">No critical path identified</p>
              )}
            </div>
            
            <div className="bg-sky-tint rounded-lg p-6">
              <h4 className="font-semibold text-stratosphere mb-4">Upcoming Deadlines</h4>
              {workplanData.outputs.timelineAnalysis.upcomingDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {workplanData.outputs.timelineAnalysis.upcomingDeadlines.slice(0, 5).map((deadline: any) => (
                    <div key={deadline.item.id} className="flex items-center space-x-3 p-3 bg-white rounded border">
                      <Timer className="text-red-500 flex-shrink-0" size={16} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stratosphere truncate">{deadline.item.name}</div>
                        <div className="text-xs text-sky">Due in {deadline.daysUntilDue} days</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sky text-sm">No upcoming deadlines</p>
              )}
            </div>
          </div>
        )}

        {/* Workload Distribution */}
        {renderSection(
          'Stakeholder Workloads',
          'stakeholders',
          renderStakeholderWorkloads(workplanData.outputs.workloadDistribution),
          workplanData.outputs.workloadDistribution.length
        )}

        {/* Site Breakdown if multi-site */}
        {/* {workplanData.siteBreakdown && workplanData.siteBreakdown.length > 0 && renderSection(
          'Site Breakdown',
          'sites',
          renderSiteBreakdown(workplanData.siteBreakdown),
          workplanData.siteBreakdown.length
        )} */}
      </div>
    );
  };

  // ============================================================================
  // STAGE 1 DATA REPORT RENDERER (NEW)
  // ============================================================================
  const renderStage1Report = () => {
    const stage1Data = reportData as Stage1ReportData;
    const { stage1Data: data } = stage1Data;

    const priorityStyles: Record<string, string> = {
      critical: 'bg-red-100 text-red-800',
      high:     'bg-orange-100 text-orange-800',
      medium:   'bg-yellow-100 text-yellow-800',
      low:      'bg-green-100 text-green-800',
    };

    const repeatLabels: Record<string, string> = {
      monthly:   'Monthly',
      quarterly: 'Quarterly',
      yearly:    'Yearly',
      no_repeat: '—',
    };

    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* ── Overview KPIs ──────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-sky-tint to-sky-tint/50 rounded-lg p-6 border border-sky">
          <h2 className="text-xl font-semibold text-stratosphere mb-6">
            Stage 1 Report — Actions & Activities
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {[
              { label: 'Total Actions',   value: data.totalActions,                    icon: <Activity className="text-sky" size={24} />,         sub: 'Activities defined' },
              { label: 'Completed',       value: data.progressSummary.completedActions,  icon: <CheckCircle className="text-green-600" size={24} />,  sub: 'Actions done' },
              { label: 'In Progress',     value: data.progressSummary.inProgressActions, icon: <PlayCircle className="text-blue-600" size={24} />,   sub: 'Active now' },
              { label: 'Not Started',     value: data.progressSummary.notStartedActions, icon: <StopCircle className="text-gray-400" size={24} />,   sub: 'Pending start' },
            ].map(({ label, value, icon, sub }) => (
              <div key={label} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-stratosphere">{label}</h3>
                  {icon}
                </div>
                <div className="text-2xl font-bold text-stratosphere">{value}</div>
                <div className="text-xs text-sky mt-1">{sub}</div>
              </div>
            ))}
          </div>

          {/* Average progress bar */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-stratosphere">Overall Progress</span>
              <span className="text-sm font-bold text-stratosphere">
                {data.progressSummary.averageProgress}%
              </span>
            </div>
            <div className="w-full bg-sky-tint rounded-full h-2">
              <div
                className="bg-grass h-2 rounded-full transition-all"
                style={{ width: `${data.progressSummary.averageProgress}%` }}
              />
            </div>
          </div>

          {/* Context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Building size={16} className="text-sky" />
                <span className="text-xs font-medium text-stratosphere">Organization</span>
              </div>
              <p className="text-sm text-sky">{stage1Data.organizationInfo.name}</p>
            </div>
            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Globe size={16} className="text-sky" />
                <span className="text-xs font-medium text-stratosphere">Project</span>
              </div>
              <p className="text-sm text-sky">{stage1Data.projectInfo.name}</p>
            </div>
            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Target size={16} className="text-ochre" />
                <span className="text-xs font-medium text-stratosphere">Scope</span>
              </div>
              <p className="text-sm text-sky capitalize">{stage1Data.scope.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* ── Timeline Summary ───────────────────────────────────────── */}
        {data.timelineSummary.earliestStartDate && renderSection(
          'Timeline Summary',
          'timeline',
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center bg-sky-tint rounded-lg p-6">
            <div>
              <div className="text-xs text-sky mb-1">Earliest Start</div>
              <div className="text-lg font-bold text-stratosphere">
                {new Date(data.timelineSummary.earliestStartDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-sky mb-1">Total Span</div>
              <div className="text-lg font-bold text-stratosphere">
                {data.timelineSummary.totalDuration} days
              </div>
            </div>
            <div>
              <div className="text-xs text-sky mb-1">Latest End</div>
              <div className="text-lg font-bold text-stratosphere">
                {data.timelineSummary.latestEndDate
                  ? new Date(data.timelineSummary.latestEndDate).toLocaleDateString()
                  : '—'}
              </div>
            </div>
          </div>
        )}

        {/* ── Actions Table ──────────────────────────────────────────── */}
        {renderSection(
          'All Actions',
          'actions',
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-sky-tint sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-stratosphere w-64">Action</th>
                  <th className="px-4 py-3 text-left font-semibold text-stratosphere w-40">Stakeholder</th>
                  <th className="px-4 py-3 text-left font-semibold text-stratosphere w-28">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-stratosphere w-36">Themes</th>
                  <th className="px-4 py-3 text-center font-semibold text-stratosphere w-28">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-stratosphere w-24">Priority</th>
                  <th className="px-4 py-3 text-center font-semibold text-stratosphere w-24">Progress</th>
                  <th className="px-4 py-3 text-center font-semibold text-stratosphere w-24">Repeat</th>
                  <th className="px-4 py-3 text-left font-semibold text-stratosphere w-40">Timeframe</th>
                  <th className="px-4 py-3 text-left font-semibold text-stratosphere w-36">Responsible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-tint/50">
                {data.actions.map((action) => (
                  <tr key={action._id} className="hover:bg-sky-tint/20 transition-colors">

                    {/* Action text */}
                    <td className="px-4 py-4">
                      <p className="text-stratosphere font-medium leading-snug line-clamp-3">
                        {action.action}
                      </p>
                    </td>

                    {/* Stakeholder */}
                    <td className="px-4 py-4">
                      <div className="flex items-start space-x-2">
                        <User size={14} className="text-sky flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-stratosphere leading-tight">
                            {action.stakeholderGroup.name}
                          </div>
                          {action.stakeholderGroup.estimatedPopulation && (
                            <div className="text-xs text-sky mt-0.5">
                              ~{action.stakeholderGroup.estimatedPopulation.toLocaleString()} people
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      <span className="text-xs px-2 py-1 bg-sky-tint text-stratosphere rounded">
                        {action.stakeholderGroup.category?.name ?? '—'}
                      </span>
                    </td>

                    {/* Themes */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {action.themes.map(t => (
                          <span key={t._id} className="text-xs px-2 py-0.5 bg-ochre/10 text-ochre rounded">
                            {t.name}
                          </span>
                        ))}
                        {action.themes.length === 0 && <span className="text-sky text-xs">—</span>}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {getStatusIcon(action.status)}
                        <span className="text-xs text-stratosphere capitalize">
                          {action.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${priorityStyles[action.priority] ?? 'bg-gray-100 text-gray-700'}`}>
                        {action.priority}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-stratosphere">{action.progress}%</span>
                        <div className="w-16 bg-sky-tint rounded-full h-1.5">
                          <div
                            className="bg-grass h-1.5 rounded-full"
                            style={{ width: `${action.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Repeat cycle */}
                    <td className="px-4 py-4 text-center">
                      <span className="text-xs text-sky">
                        {repeatLabels[action.repeatCycle] ?? action.repeatCycle}
                      </span>
                    </td>

                    {/* Timeframe */}
                    <td className="px-4 py-4">
                      {action.timeframe?.startDate ? (
                        <div className="text-xs text-sky space-y-0.5">
                          <div>
                            <span className="text-concrete">Start:</span>{' '}
                            {new Date(action.timeframe.startDate).toLocaleDateString()}
                          </div>
                          {action.timeframe.endDate && (
                            <div>
                              <span className="text-concrete">End:</span>{' '}
                              {new Date(action.timeframe.endDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-sky">No dates set</span>
                      )}
                    </td>

                    {/* Responsible */}
                    <td className="px-4 py-4">
                      {action.responsibility?.name ? (
                        <div className="text-xs">
                          <div className="font-medium text-stratosphere">{action.responsibility.name}</div>
                          {action.responsibility.role && (
                            <div className="text-sky">{action.responsibility.role}</div>
                          )}
                          {action.responsibility.email && (
                            <div className="text-sky truncate max-w-[120px]">
                              {action.responsibility.email}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-sky">—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {data.actions.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-sky">
                      <Activity size={32} className="mx-auto mb-2 text-sky/40" />
                      No actions recorded for this stage.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>,
          data.totalActions
        )}
      </div>
    );
  };

  // OUTCOME REPORT RENDERER
  const renderOutcomeReport = () => {
    const outcomeData = reportData as any;
    // ✅ Get the selected framework data
    const currentFrameworkData = outcomeData.outcomes?.byFramework?.[selectedFramework] || [];
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Outcome Overview */}
        <div className="bg-gradient-to-r from-sky-tint to-sky-tint/50 rounded-lg p-6 mb-8 border border-sky">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-stratosphere">
              Outcome Report - Stage 2 Impacts
            </h2>
            {/* ✅ UPDATED: Show currently selected framework */}
            <span className="px-3 py-1 bg-ochre text-white rounded-full text-sm capitalize">
              {selectedFramework.replace('_', ' ')} Framework
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stratosphere">Impacts</h3>
                <Target className="text-sky" size={24} />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-stratosphere">
                  {outcomeData.outcomes.totalImpacts}
                </div>
                <div className="text-xs text-sky">Total Impacts</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stratosphere">Risks</h3>
                <AlertTriangle className="text-ochre" size={24} />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-stratosphere">
                  {outcomeData.outcomes.riskRegister.totalRisks}
                </div>
                <div className="text-xs text-sky">Total Risks</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stratosphere">Mitigation</h3>
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-stratosphere">
                  {outcomeData.outcomes.riskRegister.mitigationCoverage}%
                </div>
                <div className="text-xs text-sky">Coverage</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stratosphere">Measurement</h3>
                <Award className="text-grass" size={24} />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-stratosphere">
                  {outcomeData.outcomes.measurementSummary.indicatorCount}
                </div>
                <div className="text-xs text-sky">Indicators</div>
              </div>
            </div>
          </div>

          {/* Project Context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Building size={18} className="text-sky" />
                <h4 className="font-medium text-stratosphere">Organization</h4>
              </div>
              <p className="text-sky text-sm">{outcomeData.organizationInfo.name}</p>
            </div>

            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Globe size={18} className="text-sky" />
                <h4 className="font-medium text-stratosphere">Project</h4>
              </div>
              <p className="text-sky text-sm">{outcomeData.projectInfo.name}</p>
            </div>

            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target size={18} className="text-ochre" />
                <h4 className="font-medium text-stratosphere">Scope</h4>
              </div>
              <p className="text-sky text-sm capitalize">{outcomeData.scope.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Add Framework Selector */}
        <FrameworkSelector 
          selectedFramework={selectedFramework}
          onFrameworkChange={setSelectedFramework}
          availableFrameworks={outcomeData.outcomes?.availableFrameworks}
        />

        {/* Theory of Change Visualization */}
        <TheoryOfChangeVisualization 
          reportData={reportData}
          reportType="outcome"
          selectedFramework={selectedFramework} // ✅ PASS selected framework
          onFrameworkChange={setSelectedFramework} // ✅ PASS handler
        />

        {/* Impacts by Stakeholder */}
        {renderSection(
          'Impacts by Stakeholder',
          'stakeholders',
          renderImpactsByStakeholder(outcomeData.outcomes.byStakeholder),
          outcomeData.outcomes.byStakeholder.length
        )}

        {/* Framework Outcomes - ✅ UPDATED to use selected framework */}
        {renderSection(
          `Outcomes by ${selectedFramework.charAt(0).toUpperCase() + selectedFramework.slice(1)}`,
          'outcomes',
          renderOutcomeFrameworks(currentFrameworkData),
          currentFrameworkData.length
        )}

        {/* Risk Register */}
        {renderSection(
          'Risk Register',
          'risks',
          renderRiskRegister(outcomeData.outcomes.riskRegister),
          outcomeData.outcomes.riskRegister.totalRisks
        )}

        {/* Site Breakdown if multi-site */}
        {outcomeData.siteBreakdown && outcomeData.siteBreakdown.length > 0 && renderSection(
          'Site Breakdown',
          'sites',
          renderSiteBreakdown(outcomeData.siteBreakdown),
          outcomeData.siteBreakdown.length
        )}
      </div>
    );
  };

  // FULL REPORT RENDERER

  const renderFullReport = () => {
    const fullData = reportData as any;
    
    // ✅ Get the selected framework data for Stage 2
    const currentFrameworkData = fullData.stage2?.outcomes?.byFramework?.[selectedFramework] || [];
    
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Full Overview */}
        <div className="bg-gradient-to-r from-sky-tint to-grass-tint rounded-lg p-6 mb-8 border border-sky">
          <h2 className="text-xl font-semibold text-stratosphere mb-6">Theory of Change - Full Report</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Stage 1 Summary Card */}
            {fullData.stage1.summary.exists && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-stratosphere">Stage 1: Actions</h3>
                  <Activity className="text-sky" size={24} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-concrete">Total Actions</span>
                    <span className="text-lg font-bold text-stratosphere">{fullData.stage1.summary.totalActions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-concrete">With Dates</span>
                    <span className="text-lg font-bold text-stratosphere">{fullData.stage1.summary.actionsWithDates}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-concrete">Progress</span>
                    <span className="text-lg font-bold text-stratosphere">{fullData.stage1.summary.averageProgress}%</span>
                  </div>
                  <div className="w-full bg-sky-tint rounded-full h-2">
                    <div 
                      className="bg-sky h-2 rounded-full transition-all"
                      style={{ width: `${fullData.stage1.summary.averageProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 2 Summary Card */}
            {fullData.stage2.summary.exists && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-stratosphere">Stage 2: Outcomes</h3>
                  <Target className="text-grass" size={24} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-concrete">Total Impacts</span>
                    <span className="text-lg font-bold text-stratosphere">{fullData.stage2.summary.totalImpacts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-concrete">With Risks</span>
                    <span className="text-lg font-bold text-stratosphere">{fullData.stage2.summary.impactsWithRisks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-concrete">Achievement Rate</span>
                    <span className="text-lg font-bold text-stratosphere">{fullData.stage2.summary.averageAchievementRate}%</span>
                  </div>
                  <div className="w-full bg-grass-tint rounded-full h-2">
                    <div 
                      className="bg-grass h-2 rounded-full transition-all"
                      style={{ width: `${fullData.stage2.summary.averageAchievementRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Building size={18} className="text-sky" />
                <h4 className="font-medium text-stratosphere">Organization</h4>
              </div>
              <p className="text-sky text-sm">{fullData.organizationInfo.name}</p>
            </div>

            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Globe size={18} className="text-sky" />
                <h4 className="font-medium text-stratosphere">Project</h4>
              </div>
              <p className="text-sky text-sm">{fullData.projectInfo.name}</p>
            </div>

            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target size={18} className="text-ochre" />
                <h4 className="font-medium text-stratosphere">Scope</h4>
              </div>
              <p className="text-sky text-sm capitalize">{fullData.scope.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Add Framework Selector for Stage 2 */}
        {fullData.stage2.summary.exists && (
          <FrameworkSelector 
            selectedFramework={selectedFramework}
            onFrameworkChange={setSelectedFramework}
            availableFrameworks={fullData.stage2.outcomes?.availableFrameworks}
          />
        )}

        {/* Theory of Change Visualization */}
        <TheoryOfChangeVisualization 
          reportData={reportData}
          reportType="full"
          selectedFramework={selectedFramework}
          onFrameworkChange={setSelectedFramework}
        />

        {/* ============================================================================ */}
        {/* ✅ STAGE 1 DATA BREAKDOWNS (NO GANTT CHART) */}
        {/* ============================================================================ */}
        {fullData.stage1.summary.exists && (
          <>
            {/* Stage 1 Header */}
            <div className="bg-sky-tint rounded-lg p-4 border-l-4 border-sky">
              <h3 className="text-lg font-semibold text-stratosphere">Stage 1: Actions Data</h3>
              <p className="text-sm text-sky mt-1">Detailed breakdown of stakeholder actions and activities</p>
            </div>

            {/* Actions by Status */}
            {renderSection(
              'Actions by Status',
              'status',
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(fullData.stage1.outputs.ganttTimeline.reduce((acc: Record<string, number>, item: any) => {
                  acc[item.status] = (acc[item.status] || 0) + 1;
                  return acc;
                }, {})).map(([status, count]: [string, any]) => (
                  <div key={status} className="bg-sky-tint rounded-lg p-4 text-center">
                    <div className="mb-2">{getStatusIcon(status)}</div>
                    <div className="text-2xl font-bold text-stratosphere">{count}</div>
                    <div className="text-xs text-sky capitalize">{status.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>,
              fullData.stage1.outputs.ganttTimeline.length
            )}

            {/* Actions by Priority */}
            {renderSection(
              'Actions by Priority',
              'priority',
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(fullData.stage1.outputs.ganttTimeline.reduce((acc: Record<string, number>, item: any) => {
                  acc[item.priority] = (acc[item.priority] || 0) + 1;
                  return acc;
                }, {})).map(([priority, count]: [string, any]) => (
                  <div key={priority} className={`rounded-lg p-4 text-center ${
                    priority === 'critical' ? 'bg-red-100' :
                    priority === 'high' ? 'bg-orange-100' :
                    priority === 'medium' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    <div className="text-2xl font-bold text-stratosphere">{count}</div>
                    <div className="text-xs text-sky capitalize">{priority}</div>
                  </div>
                ))}
              </div>,
              fullData.stage1.outputs.ganttTimeline.length
            )}

            {/* Actions by Stakeholder */}
            {renderSection(
              'Actions by Stakeholder',
              'stakeholders',
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-sky-tint">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-stratosphere">Stakeholder</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-stratosphere">Actions</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-stratosphere">Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullData.stage1.outputs.workloadDistribution?.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-sky-tint/50 hover:bg-sky-tint/20">
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <User size={16} className="text-sky flex-shrink-0" />
                            <span className="font-medium text-stratosphere">{item.stakeholder.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-stratosphere">{item.activityCount}</td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-semibold text-stratosphere mb-1">{item.completionRate}%</span>
                            <div className="w-24 bg-sky-tint rounded-full h-2">
                              <div 
                                className="bg-grass h-2 rounded-full"
                                style={{ width: `${item.completionRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>,
              fullData.stage1.outputs.workloadDistribution?.length || 0
            )}

            {/* Actions by Theme */}
            {renderSection(
              'Actions by Theme',
              'themes',
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  // Group actions by theme
                  const themeMap = new Map();
                  fullData.stage1.outputs.ganttTimeline.forEach((item: any) => {
                    item.themes?.forEach((theme: any) => {
                      const tid = theme._id;
                      if (!themeMap.has(tid)) {
                        themeMap.set(tid, {
                          theme,
                          count: 0,
                          completed: 0
                        });
                      }
                      const data = themeMap.get(tid);
                      data.count++;
                      if (item.status === 'completed') data.completed++;
                    });
                  });
                  
                  return Array.from(themeMap.values()).map((item: any, index: number) => (
                    <div key={index} className="bg-sky-tint rounded-lg p-4 border border-sky">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-stratosphere">{item.theme.name}</h4>
                        <Target className="text-ochre" size={20} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-stratosphere">{item.count}</div>
                          <div className="text-xs text-sky">Actions</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-stratosphere">
                            {Math.round((item.completed / item.count) * 100)}%
                          </div>
                          <div className="text-xs text-sky">Complete</div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>,
              fullData.stage1.outputs.ganttTimeline.length
            )}

            {/* Timeline Summary */}
            {fullData.stage1.outputs.timelineAnalysis && renderSection(
              'Timeline Summary',
              'timeline',
              <div className="bg-sky-tint rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm text-sky mb-2">Project Start</div>
                    <div className="text-lg font-bold text-stratosphere">
                      {fullData.stage1.outputs.timelineAnalysis.projectStartDate 
                        ? new Date(fullData.stage1.outputs.timelineAnalysis.projectStartDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-sky mb-2">Total Duration</div>
                    <div className="text-lg font-bold text-stratosphere">
                      {fullData.stage1.outputs.timelineAnalysis.totalDuration} days
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-sky mb-2">Project End</div>
                    <div className="text-lg font-bold text-stratosphere">
                      {fullData.stage1.outputs.timelineAnalysis.projectEndDate 
                        ? new Date(fullData.stage1.outputs.timelineAnalysis.projectEndDate).toLocaleDateString()
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================================ */}
        {/* STAGE 2 SECTIONS */}
        {/* ============================================================================ */}
        {fullData.stage2.summary.exists && (
          <>
            {/* Stage 2 Header */}
            <div className="bg-grass-tint rounded-lg p-4 border-l-4 border-grass">
              <h3 className="text-lg font-semibold text-stratosphere">Stage 2: Outcomes Data</h3>
              <p className="text-sm text-sky mt-1">Social impacts and outcomes by framework</p>
            </div>

            {renderSection(
              `Stage 2: Outcomes by ${selectedFramework.charAt(0).toUpperCase() + selectedFramework.slice(1)}`,
              'outcomes',
              renderOutcomeFrameworks(currentFrameworkData),
              currentFrameworkData.length
            )}

            {renderSection(
              'Stage 2: Risk Register',
              'risks',
              renderRiskRegister(fullData.stage2.outcomes.riskRegister),
              fullData.stage2.outcomes.riskRegister.totalRisks
            )}
          </>
        )}

        {/* ✅ NO MORE SITE BREAKDOWN SECTIONS */}
      </div>
    );
  };


  // CONSULTATION PLAN REPORT RENDERER
  const renderConsultationPlanReport = () => {
    const consultationData = reportData as any;
    const plan = consultationData.consultationPlan;
    
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Consultation Plan Overview */}
        <div className="bg-gradient-to-r from-sky-tint to-sky-tint/50 rounded-lg p-6 mb-8 border border-sky">
          <h2 className="text-xl font-semibold text-stratosphere mb-6">
            Consultation Plan Report - Site Selection Phase
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stratosphere">Stakeholders</h3>
                <Users className="text-sky" size={24} />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-stratosphere">
                  {plan.selectedStakeholders.length}
                </div>
                <div className="text-xs text-sky">Selected Groups</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stratosphere">Status</h3>
                <CheckCircle className={plan.isCompleted ? "text-green-600" : "text-ochre"} size={24} />
              </div>
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${plan.isCompleted ? 'text-green-600' : 'text-ochre'}`}>
                  {plan.isCompleted ? 'Complete' : 'In Progress'}
                </div>
                <div className="text-xs text-sky">{plan.completionStatus.completionPercentage}% Complete</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stratosphere">Timeline</h3>
                <Calendar className="text-grass" size={24} />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-stratosphere">
                  {plan.timeline.duration || 'TBD'}
                </div>
                <div className="text-xs text-sky">{plan.timeline.duration ? 'Days' : 'Not Set'}</div>
              </div>
            </div>
          </div>

          {/* Site and Project Context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Building size={18} className="text-sky" />
                <h4 className="font-medium text-stratosphere">Project</h4>
              </div>
              <p className="text-sky text-sm">{consultationData.projectInfo.name}</p>
            </div>

            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin size={18} className="text-ochre" />
                <h4 className="font-medium text-stratosphere">Site</h4>
              </div>
              <p className="text-sky text-sm">{consultationData.siteInfo.name}</p>
            </div>

            <div className="bg-sky-tint rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target size={18} className="text-grass" />
                <h4 className="font-medium text-stratosphere">Plan Status</h4>
              </div>
              <p className="text-sky text-sm capitalize">{plan.status.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Selected Stakeholders */}
        {renderSection(
          'Selected Stakeholder Groups',
          'stakeholders',
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.selectedStakeholders.map((sg: any, index: number) => (
              <div key={index} className="bg-sky-tint rounded-lg p-4 border border-sky">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="text-sky flex-shrink-0" size={20} />
                  <h4 className="font-semibold text-stratosphere">{sg.stakeholderGroup.name}</h4>
                </div>
                {sg.stakeholderGroup.description && (
                  <p className="text-sm text-sky mb-2">{sg.stakeholderGroup.description}</p>
                )}
                {sg.notes && (
                  <div className="mt-2 p-2 bg-white rounded text-xs text-sky">
                    <span className="font-medium">Notes:</span> {sg.notes}
                  </div>
                )}
              </div>
            ))}
          </div>,
          plan.selectedStakeholders.length
        )}

        {/* Planning Details */}
        {renderSection(
          'Planning Details',
          'overview',
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-sky-tint rounded-lg p-6">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center space-x-2">
                <Users size={18} className="text-sky" />
                <span>Participants</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-sky mb-1">Expected Participants</div>
                  <div className="text-sm text-stratosphere">{plan.planning.expectedParticipants || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-xs text-sky mb-1">Underrepresented Groups</div>
                  <div className="text-sm text-stratosphere">{plan.planning.underrepresentedGroups || 'Not specified'}</div>
                </div>
              </div>
            </div>

            <div className="bg-sky-tint rounded-lg p-6">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center space-x-2">
                <MapPin size={18} className="text-ochre" />
                <span>Logistics</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-sky mb-1">Venue & Method</div>
                  <div className="text-sm text-stratosphere">{plan.planning.venue || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-xs text-sky mb-1">Invitation Strategy</div>
                  <div className="text-sm text-stratosphere">{plan.planning.invitationStrategy || 'Not specified'}</div>
                </div>
              </div>
            </div>

            <div className="bg-sky-tint rounded-lg p-6">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center space-x-2">
                <Activity size={18} className="text-grass" />
                <span>Budget & Resources</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-sky mb-1">Budget & Costs</div>
                  <div className="text-sm text-stratosphere">{plan.planning.budget || 'Not specified'}</div>
                </div>
              </div>
            </div>

            <div className="bg-sky-tint rounded-lg p-6">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center space-x-2">
                <CheckCircle size={18} className="text-green-600" />
                <span>Permissions</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-sky mb-1">Approvals & Permissions</div>
                  <div className="text-sm text-stratosphere">{plan.planning.permissions || 'Not specified'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {renderSection(
          'Consultation Timeline',
          'gantt',
          <div className="bg-sky-tint rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-sky mb-2">Start Date</div>
                <div className="text-lg font-semibold text-stratosphere">
                  {plan.timeline.startDate ? new Date(plan.timeline.startDate).toLocaleDateString() : 'Not set'}
                </div>
              </div>
              <div>
                <div className="text-xs text-sky mb-2">End Date</div>
                <div className="text-lg font-semibold text-stratosphere">
                  {plan.timeline.endDate ? new Date(plan.timeline.endDate).toLocaleDateString() : 'Not set'}
                </div>
              </div>
              <div>
                <div className="text-xs text-sky mb-2">Duration</div>
                <div className="text-lg font-semibold text-stratosphere">
                  {plan.timeline.duration ? `${plan.timeline.duration} days` : 'TBD'}
                </div>
              </div>
            </div>
            {plan.timeline.description && (
              <div className="mt-4 p-4 bg-white rounded">
                <div className="text-xs text-sky mb-1">Timeline Description</div>
                <div className="text-sm text-stratosphere">{plan.timeline.description}</div>
              </div>
            )}
          </div>
        )}

        {/* Completion Status */}
        {renderSection(
          'Completion Status',
          'overview',
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stratosphere">Overall Completion</span>
              <span className="text-lg font-bold text-stratosphere">{plan.completionStatus.completionPercentage}%</span>
            </div>
            <div className="w-full bg-sky-tint rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-sky to-grass h-3 rounded-full transition-all"
                style={{ width: `${plan.completionStatus.completionPercentage}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h5 className="font-medium text-green-800 mb-2">Completed Sections</h5>
                <div className="space-y-1">
                  {plan.completionStatus.completedSections.map((section: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle size={14} className="text-green-600" />
                      <span className="text-sm text-green-700 capitalize">{section.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {plan.completionStatus.missingSections.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <h5 className="font-medium text-amber-800 mb-2">Missing Sections</h5>
                  <div className="space-y-1">
                    {plan.completionStatus.missingSections.map((section: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertCircle size={14} className="text-amber-600" />
                        <span className="text-sm text-amber-700 capitalize">{section.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // HELPER RENDER FUNCTIONS
  const renderGanttChart = (ganttTimeline: any[], timelineAnalysis?: any) => {
    if (!ganttTimeline || ganttTimeline.length === 0) {
      return (
        <div className="text-center py-8">
          <Calendar size={48} className="mx-auto text-sky mb-4" />
          <p className="text-sky">No timeline data available</p>
        </div>
      );
    }

    const itemsWithDates = ganttTimeline.filter(item => item.startDate && item.endDate);
    
    if (itemsWithDates.length === 0) {
      return (
        <div className="text-center py-8">
          <Calendar size={48} className="mx-auto text-sky mb-4" />
          <p className="text-sky">No scheduled activities with dates</p>
        </div>
      );
    }

    const allDates = itemsWithDates.flatMap(item => [
      new Date(item.startDate), 
      new Date(item.endDate)
    ]);
    
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    return (
      <div className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-sky-tint rounded p-4 text-center">
            <div className="text-lg font-bold text-stratosphere">
              {ganttTimeline.filter(item => item.startDate && item.endDate && !item.isEstimated).length}
            </div>
            <div className="text-sm text-sky">Scheduled</div>
          </div>
          <div className="bg-sky-tint rounded p-4 text-center">
            <div className="text-lg font-bold text-stratosphere">
              {ganttTimeline.filter(item => item.isEstimated).length}
            </div>
            <div className="text-sm text-sky">Estimated</div>
          </div>
          <div className="bg-sky-tint rounded p-4 text-center">
            <div className="text-lg font-bold text-stratosphere">
              {Math.round(ganttTimeline.reduce((sum, item) => sum + (item.progress || 0), 0) / ganttTimeline.length) || 0}%
            </div>
            <div className="text-sm text-sky">Avg Progress</div>
          </div>
        </div>

        {/* GANTT CHART - with proper horizontal scroll */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Timeline header */}
            <div className="flex mb-4 border-b-2 border-sky pb-2">
              <div className="w-48 flex-shrink-0 font-semibold text-sm text-stratosphere pr-4">Activity</div>
              <div className="flex-1 min-w-[300px] relative">
                <div className="flex justify-between text-xs text-sky px-2">
                  <span>{minDate.toLocaleDateString()}</span>
                  <span className="text-center">{totalDays} days</span>
                  <span>{maxDate.toLocaleDateString()}</span>
                </div>
              </div>
              <div className="w-24 text-center font-semibold text-sm text-stratosphere flex-shrink-0">Status</div>
            </div>

            {/* Gantt rows */}
            {itemsWithDates.slice(0, 15).map((item) => {
              const start = new Date(item.startDate);
              const end = new Date(item.endDate);
              const leftOffset = ((start.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100;
              const width = Math.max(((end.getTime() - start.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100, 2);

              return (
                <div key={item.id} className="flex items-center py-3 border-b border-sky-tint/30 hover:bg-sky-tint/10 transition-colors">
                  {/* Activity info */}
                  <div className="w-48 flex-shrink-0 pr-4">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium text-stratosphere truncate">
                        {item.name}
                      </span>
                      {item.isEstimated && (
                        <span className="text-xs bg-ochre/20 text-ochre px-1.5 py-0.5 rounded flex-shrink-0">Est.</span>
                      )}
                    </div>
                    <div className="text-xs text-sky ml-6 truncate">{item.stakeholder.name}</div>
                    <div className="text-xs text-ochre ml-6 mt-0.5 truncate">
                      {item.type === 'action' ? 'Action' : 'Impact'}
                      {item.duration && ` • ${item.duration} days`}
                    </div>
                  </div>
                  
                  {/* Gantt bar container */}
                  <div className="flex-1 min-w-[300px] relative h-10 px-2">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {[0, 25, 50, 75, 100].map(pos => (
                        <div 
                          key={pos}
                          className="absolute h-full border-l border-sky-tint/30"
                          style={{ left: `${pos}%` }}
                        />
                      ))}
                    </div>

                    {/* Gantt bar */}
                    <div 
                      className={`absolute h-7 rounded shadow-sm hover:shadow-md transition-all group cursor-pointer ${getStatusColor(item.status)}`}
                      style={{ 
                        left: `${leftOffset}%`, 
                        width: `${width}%`,
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    >
                      {/* Hover tooltip */}
                      <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-stratosphere text-white text-xs rounded py-2 px-3 whitespace-nowrap z-20 shadow-lg">
                        <div className="font-semibold mb-1">{item.name}</div>
                        <div className="text-sky-tint">{item.stakeholder.name}</div>
                        <div className="mt-1 pt-1 border-t border-white/20">
                          <div>{start.toLocaleDateString()} → {end.toLocaleDateString()}</div>
                          <div>Duration: {item.duration || 0} days</div>
                          <div>Status: <span className="capitalize">{item.status.replace('_', ' ')}</span></div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                          <div className="border-4 border-transparent border-t-stratosphere"></div>
                        </div>
                      </div>
                      
                      {/* Bar label - show status */}
                      {width > 10 && (
                        <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium px-2 truncate capitalize">
                          {item.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="w-24 text-center flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(item.status)} text-white`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Show more indicator */}
        {itemsWithDates.length > 15 && (
          <div className="text-center py-2 bg-sky-tint/20 rounded">
            <span className="text-sm text-sky">
              Showing 15 of {itemsWithDates.length} scheduled activities
            </span>
          </div>
        )}

        {/* Unscheduled activities */}
        {ganttTimeline.filter(item => !item.startDate || !item.endDate).length > 0 && (
          <div className="p-4 bg-ochre/5 rounded border border-ochre/20">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle size={16} className="text-ochre" />
              <h5 className="font-medium text-stratosphere">Unscheduled Activities</h5>
            </div>
            <p className="text-sm text-sky">
              {ganttTimeline.filter(item => !item.startDate || !item.endDate).length} activities don't have dates assigned yet
            </p>
          </div>
        )}
      </div>
    );
  };

  // Around line 1050, update renderStakeholderWorkloads:
  const renderStakeholderWorkloads = (workloads: any[]) => {
    // Helper function to get status from completion rate
    const getStatus = (completionRate: number): string => {
      if (completionRate === 0) return 'Planned';
      if (completionRate === 100) return 'Complete';
      return 'In Progress';
    };

    const getStatusColor = (status: string): string => {
      switch (status) {
        case 'Complete': return 'bg-green-100 text-green-800';
        case 'In Progress': return 'bg-blue-100 text-blue-800';
        case 'Planned': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-sky-tint">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stratosphere">Stakeholder</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-stratosphere">Activities</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-stratosphere">Duration</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-stratosphere">Status</th> {/* CHANGED */}
              <th className="px-4 py-3 text-center text-sm font-semibold text-stratosphere">Deadlines</th>
            </tr>
          </thead>
          <tbody>
            {workloads && workloads.map((workload, index) => {
              const status = getStatus(workload.completionRate);
              return (
                <tr key={index} className="border-b border-sky-tint/50 hover:bg-sky-tint/20">
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-sky flex-shrink-0" />
                      <span className="font-medium text-stratosphere">{workload.stakeholder.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-stratosphere">{workload.activityCount}</td>
                  <td className="px-4 py-4 text-center text-stratosphere whitespace-nowrap">{workload.totalDuration} days</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {workload.upcomingDeadlines > 0 ? (
                      <div className="flex items-center justify-center text-ochre">
                        <AlertCircle size={14} className="mr-1" />
                        <span className="text-sm">{workload.upcomingDeadlines}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Around line 1100, update renderImpactsByStakeholder:
  const renderImpactsByStakeholder = (byStakeholder: any[]) => {
    // Helper function to get status
    const getStatus = (achievementRate: number): string => {
      if (achievementRate === 0) return 'Planned';
      if (achievementRate === 100) return 'Complete';
      return 'In Progress';
    };

    const getStatusColor = (status: string): string => {
      switch (status) {
        case 'Complete': return 'bg-green-100 text-green-800';
        case 'In Progress': return 'bg-blue-100 text-blue-800';
        case 'Planned': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="space-y-6">
        {byStakeholder && byStakeholder.slice(0, 5).map((group, index) => {
          const status = getStatus(group.achievementRate);
          return (
            <div key={index} className="bg-sky-tint rounded-lg p-6 border border-sky">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-stratosphere">{group.stakeholder.name}</h5>
                <Users className="text-sky" size={20} />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-lg font-bold text-stratosphere">{group.impacts.length}</div>
                  <div className="text-xs text-sky">Impacts</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-stratosphere">{group.totalRisks}</div>
                  <div className="text-xs text-sky">Risks</div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Around line 1150, update renderOutcomeFrameworks:
  const renderOutcomeFrameworks = (frameworks: any[]) => {
    // Helper function to get display name based on framework type
    const getDisplayName = (outcome: any): string => {
      const frameworkType = selectedFramework;
      const item = outcome.framework;
      
      switch (frameworkType) {
        case 'resilience':
          // Display capacity_type instead of name
          return item.capacityTypes && item.capacityTypes.length > 0
            ? item.capacityTypes.map((ct: string) => 
                ct.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
              ).join(', ')
            : item.name;
        
        case 'standards':
          // Display issuing body instead of standard name
          return item.issuingBody || item.name;
        
        default:
          // For themes, sdgs, indicators, esg - show name as usual
          return item.name;
      }
    };

    // Helper function to get secondary info
    const getSecondaryInfo = (outcome: any): string | null => {
      const frameworkType = selectedFramework;
      const item = outcome.framework;
      
      switch (frameworkType) {
        case 'resilience':
          // Show category as secondary info
          console.log(item)
          return item.capacityType || null;
        
        case 'standards':
          // Show standard name as secondary info
          return item.name || null;
        
        default:
          return null;
      }
    };

    // Helper function to get status
    const getStatus = (achievementRate: number): string => {
      if (achievementRate === 0) return 'Planned';
      if (achievementRate === 100) return 'Complete';
      return 'In Progress';
    };

    const getStatusColor = (status: string): string => {
      switch (status) {
        case 'Complete': return 'bg-green-100 text-green-800';
        case 'In Progress': return 'bg-blue-100 text-blue-800';
        case 'Planned': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-sky-tint">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-stratosphere">
                {selectedFramework === 'resilience' ? 'Capacity Type' : 
                selectedFramework === 'standards' ? 'Issuing Body' : 
                'Framework'}
              </th>
              {/* ✅ Show secondary column for resilience and standards */}
              {(selectedFramework === 'resilience' || selectedFramework === 'standards') && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-stratosphere">
                  {selectedFramework === 'resilience' ? 'Capacity Type' : 'Standard Name'}
                </th>
              )}
              <th className="px-4 py-3 text-center text-sm font-semibold text-stratosphere">Code</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-stratosphere">Impacts</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-stratosphere">Status</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-stratosphere">Risks</th>
            </tr>
          </thead>
          <tbody>
            {frameworks && frameworks.slice(0, 20).map((outcome, index) => {
              const status = getStatus(outcome.metrics.achievementRate);
              const displayName = getDisplayName(outcome);
              const secondaryInfo = getSecondaryInfo(outcome);
              
              return (
                <tr key={index} className="border-b border-sky-tint/50 hover:bg-sky-tint/20">
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Award size={16} className="text-ochre flex-shrink-0" />
                      <span className="font-medium text-stratosphere">{displayName}</span>
                    </div>
                  </td>
                  {/* ✅ Show secondary info column */}
                  {(selectedFramework === 'resilience' || selectedFramework === 'standards') && (
                    <td className="px-4 py-4">
                      <span className="text-sm text-sky">{secondaryInfo || '—'}</span>
                    </td>
                  )}
                  <td className="px-4 py-4 text-center">
                    <span className="px-2 py-1 bg-ochre-100 text-ochre-800 rounded text-xs font-medium whitespace-nowrap">
                      {outcome.framework.code || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-stratosphere">{outcome.impacts?.length || 0}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-stratosphere">{outcome.metrics.riskCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Show if there are more items */}
        {frameworks && frameworks.length > 20 && (
          <div className="text-center py-3 bg-sky-tint/20 rounded-b text-sm text-sky">
            Showing 20 of {frameworks.length} {selectedFramework} items
          </div>
        )}
      </div>
    );
  };
  const renderRiskRegister = (riskRegister: any) => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded text-center">
          <div className="text-2xl font-bold text-red-600">{riskRegister.bySeverity.high}</div>
          <div className="text-sm text-red-700">High Severity</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded text-center">
          <div className="text-2xl font-bold text-yellow-600">{riskRegister.bySeverity.medium}</div>
          <div className="text-sm text-yellow-700">Medium Severity</div>
        </div>
        <div className="bg-green-50 p-4 rounded text-center">
          <div className="text-2xl font-bold text-green-600">{riskRegister.bySeverity.low}</div>
          <div className="text-sm text-green-700">Low Severity</div>
        </div>
      </div>

      {riskRegister.topRisks && riskRegister.topRisks.length > 0 && (
        <div className="bg-sky-tint rounded-lg p-6">
          <h4 className="font-semibold text-stratosphere mb-4">Top Risks</h4>
          <div className="space-y-3">
            {riskRegister.topRisks.slice(0, 5).map((riskItem: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded border">
                <AlertTriangle className="text-red-500 flex-shrink-0" size={16} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stratosphere truncate">
                    {riskItem.risk.description}
                  </div>
                  <div className="text-xs text-sky">{riskItem.stakeholder.name}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  riskItem.risk.severity === 'high' ? 'bg-red-100 text-red-800' :
                  riskItem.risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {riskItem.risk.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSiteBreakdown = (siteBreakdown: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {siteBreakdown.map((site, index) => (
        <div key={site.siteId} className="bg-sky-tint rounded-lg p-6 border border-sky">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-stratosphere">{site.siteName}</h5>
            <MapPin className="text-ochre" size={20} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center mb-4">
            <div>
              <div className="text-lg font-bold text-stratosphere">{site.actionCount}</div>
              <div className="text-xs text-sky">Actions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-stratosphere">{site.impactCount}</div>
              <div className="text-xs text-sky">Impacts</div>
            </div>
          </div>

          {site.completionRate !== undefined && (
            <>
              <div className="w-full bg-white rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-sky to-grass h-2 rounded-full transition-all"
                  style={{ width: `${site.completionRate}%` }}
                ></div>
              </div>
              <div className="text-center text-xs text-sky">{site.completionRate}% complete</div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  // Main render - route based on report type
  return (
    <>
      {reportType === 'stage1' && renderStage1Report()} {/* ✅ NEW */}
      {reportType === 'workplan' && renderWorkplanReport()}
      {reportType === 'outcome' && renderOutcomeReport()}
      {reportType === 'full' && renderFullReport()}
      {reportType === 'consultation' && renderConsultationPlanReport()}
    </>
  );
};

export default TheoryOfChangeReportContent;