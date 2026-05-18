// components/reports/TheoryOfChangeVisualization.tsx
'use client';

import { useState } from 'react';
import { 
  TrendingUp, Target, Activity, Users, AlertTriangle,
  CheckCircle, Clock, Award, Zap, Brain, Eye
} from 'lucide-react';

interface TheoryOfChangeVisualizationProps {
  reportData: any;
  reportType: 'full' | 'workplan' | 'outcome';
  selectedFramework?: 'themes' | 'sdgs' | 'resilience' | 'indicators' | 'esg' | 'standards'; // ✅ NEW
  onFrameworkChange?: (framework: 'themes' | 'sdgs' | 'resilience' | 'indicators' | 'esg' | 'standards') => void; // ✅ NEW
}

const TheoryOfChangeVisualization: React.FC<TheoryOfChangeVisualizationProps> = ({
  reportData,
  reportType,
  selectedFramework = 'themes', // ✅ NEW: Default to themes
  onFrameworkChange // ✅ NEW
}) => {
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  // ============================================================================
  // DATA EXTRACTION & AGGREGATION
  // ============================================================================

  // IMPACT LEVEL - Stage 2 aggregated by frameworks (SDGs, Themes, etc.)
  const extractImpactLevel = () => {
    if (reportType === 'workplan') return null;

    const impacts = reportType === 'full' 
      ? reportData.stage2?.outcomes 
      : reportData.outcomes;

    if (!impacts) return null;

    // ✅ Get data for the SELECTED framework only
    const selectedFrameworkData = impacts.byFramework?.[selectedFramework] || [];
    
    // Helper to get display name based on framework
    const getDisplayName = (item: any): string => {
      switch (selectedFramework) {
        case 'resilience':
          return item.capacityTypes && item.capacityTypes.length > 0
            ? item.capacityTypes.map((ct: string) => 
                ct.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
              ).join(', ')
            : item.name;
        case 'standards':
          return item.issuingBody || item.name;
        default:
          return item.name;
      }
    };

    const frameworkContributions = selectedFrameworkData.map((outcome: any) => ({
      name: getDisplayName(outcome.framework),
      code: outcome.framework.code,
      impactCount: outcome.impacts?.length || 0,
      achievementRate: outcome.metrics.achievementRate,
      riskCount: outcome.metrics.riskCount,
      // Include original for secondary display if needed
      secondaryInfo: selectedFramework === 'resilience' 
        ? outcome.framework.category 
        : selectedFramework === 'standards' 
          ? outcome.framework.name 
          : null
    }));

    return {
      totalImpacts: impacts.totalImpacts || 0,
      frameworkContributions,
      description: `Long-term ${selectedFramework} contributions`,
      currentFramework: selectedFramework
    };
  };

  // OUTCOME LEVEL - Stage 2 impacts grouped by themes/categories
    const extractOutcomeLevel = () => {
    if (reportType === 'workplan') return null;

    const impacts = reportType === 'full' 
        ? reportData.stage2?.outcomes 
        : reportData.outcomes;

    if (!impacts) return null;

    // Define interface for outcome category
    interface OutcomeCategory {
        impacts: any[];
        icon: string;
        description: string;
    }

    // Map Stage 2 impacts to outcome categories with proper typing
    const outcomeCategories: Record<string, OutcomeCategory> = {
        'Improved Systems': {
        impacts: [] as any[],  // Explicitly type as any[]
        icon: '⚖️',
        description: 'Enhanced ESIA and SEA systems'
        },
        'Better Processes': {
        impacts: [] as any[],  // Explicitly type as any[]
        icon: '🔄',
        description: 'Streamlined and effective processes'
        },
        'Enabling Conditions': {
        impacts: [] as any[],  // Explicitly type as any[]
        icon: '🌱',
        description: 'Favorable conditions for change'
        },
        'Enhanced Capacities': {
        impacts: [] as any[],  // Explicitly type as any[]
        icon: '👥',
        description: 'Strengthened stakeholder capacities'
        }
    };

    // Categorize impacts based on themes or keywords
    impacts.byStakeholder?.forEach((group: any) => {
        group.impacts.forEach((impact: any) => {
        // Simple categorization logic - you can enhance this
        const impactName = impact.impact?.toLowerCase() || '';
        
        if (impactName.includes('system') || impactName.includes('governance')) {
            outcomeCategories['Improved Systems'].impacts.push(impact);
        } else if (impactName.includes('process') || impactName.includes('procedure')) {
            outcomeCategories['Better Processes'].impacts.push(impact);
        } else if (impactName.includes('condition') || impactName.includes('environment')) {
            outcomeCategories['Enabling Conditions'].impacts.push(impact);
        } else {
            outcomeCategories['Enhanced Capacities'].impacts.push(impact);
        }
        });
    });

    return {
        categories: outcomeCategories,
        totalOutcomes: impacts.totalImpacts || 0,
        achievementRate: impacts.byStakeholder?.reduce((sum: number, g: any) => 
        sum + g.achievementRate, 0) / (impacts.byStakeholder?.length || 1)
    };
    };

  // ACTIVITIES LEVEL - Stage 1 actions + stakeholder engagement
  const extractActivitiesLevel = () => {
    const actions = reportType === 'full' 
      ? reportData.stage1?.outputs 
      : reportType === 'workplan' 
        ? reportData.outputs 
        : null;

    if (!actions) return null;

    // Group activities by type
    const activityCategories = {
      'Stakeholder Actions': {
        items: actions.actions || [],
        icon: '👥',
        description: 'Direct stakeholder-driven activities'
      },
      'Engagement Activities': {
        items: actions.ganttTimeline?.filter((item: any) => 
          item.type === 'action' && item.stakeholder
        ) || [],
        icon: '🤝',
        description: 'Stakeholder engagement and consultation'
      },
      'Capacity Building': {
        items: actions.actions?.filter((action: any) => 
          action.action?.toLowerCase().includes('training') ||
          action.action?.toLowerCase().includes('capacity') ||
          action.action?.toLowerCase().includes('workshop')
        ) || [],
        icon: '📚',
        description: 'Skills development and knowledge transfer'
      }
    };

    return {
      categories: activityCategories,
      totalActivities: actions.totalActions || 0,
      averageProgress: actions.timelineAnalysis?.averageProgress || 0,
      scheduledActivities: actions.actionsWithDates || 0
    };
  };

  // INPUT LEVEL - Stakeholders + resources
  const extractInputLevel = () => {
    const workloads = reportType === 'full' 
      ? reportData.stage1?.outputs?.workloadDistribution 
      : reportType === 'workplan' 
        ? reportData.outputs?.workloadDistribution 
        : null;

    const stakeholders = reportType === 'outcome' || reportType === 'full'
      ? (reportType === 'full' 
          ? reportData.stage2?.outcomes?.byStakeholder 
          : reportData.outcomes?.byStakeholder)
      : workloads;

    if (!stakeholders || stakeholders.length === 0) return null;

    // Extract unique stakeholder expertise
    const stakeholderInputs = stakeholders.map((item: any) => ({
      name: item.stakeholder?.name || item.name,
      type: 'Stakeholder Group',
      capacity: item.activityCount || item.impacts?.length || 0,
      engagement: item.completionRate || item.achievementRate || 0
    }));

    return {
      stakeholders: stakeholderInputs,
      totalStakeholders: stakeholderInputs.length,
      expertise: ['ESIA & SEA expertise', 'Process management', 'Community engagement'],
      resources: stakeholderInputs.reduce((sum: number, s: any) => sum + s.capacity, 0)
    };
  };

  // ASSUMPTIONS - Placeholder (since you don't have this field)
  const extractAssumptions = () => {
    return {
      items: [
        'Good practice ESIA and SEA improves information basis',
        'NCEA contribution will be part of bigger systemic change',
        'Local commitment and ownership are essential'
      ]
    };
  };

  // BARRIERS - From risk register
  const extractBarriers = () => {
    const risks = reportType === 'full' 
      ? reportData.stage2?.outcomes?.riskRegister 
      : reportType === 'outcome' 
        ? reportData.outcomes?.riskRegister 
        : null;

    if (!risks) return null;

    // Extract high and medium severity risks as barriers
    const barriers = risks.topRisks?.slice(0, 3).map((riskItem: any) => ({
      description: riskItem.risk.description,
      severity: riskItem.risk.severity,
      mitigation: riskItem.risk.mitigation,
      stakeholder: riskItem.stakeholder.name
    })) || [];

    return {
      barriers,
      totalRisks: risks.totalRisks || 0,
      highSeverity: risks.bySeverity?.high || 0,
      mitigationCoverage: risks.mitigationCoverage || 0
    };
  };

  // CHALLENGE - Derived from overall context
  const extractChallenge = () => {
    return {
      title: 'How to realise sustainable projects and plans through informed, inclusive and transparent processes',
      context: reportType === 'full' 
        ? `${reportData.projectInfo?.name || 'Project'} - Full Theory of Change`
        : reportType === 'workplan'
          ? `${reportData.projectInfo?.name || 'Project'} - Work Plan`
          : `${reportData.projectInfo?.name || 'Project'} - Outcome Framework`
    };
  };

  // ============================================================================
  // EXTRACTED DATA
  // ============================================================================
  const impactData = extractImpactLevel();
  const outcomeData = extractOutcomeLevel();
  const activitiesData = extractActivitiesLevel();
  const inputData = extractInputLevel();
  const assumptionsData = extractAssumptions();
  const barriersData = extractBarriers();
  const challengeData = extractChallenge();

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      impact: 'from-[#8B9D5F] to-[#A8B87A]',
      outcome: 'from-[#C85A54] to-[#D89B97]',
      activities: 'from-[#8B6B8F] to-[#B39AB5]',
      input: 'from-[#5B95AC] to-[#8BB4C5]'
    };
    return colors[level] || 'from-gray-400 to-gray-500';
  };

  const renderImpactLevel = () => {
    if (!impactData) return null;

    const frameworks = [
      { value: 'themes', label: 'Themes', icon: '🎯' },
      { value: 'sdgs', label: 'SDGs', icon: '🌍' },
      { value: 'resilience', label: 'Resilience', icon: '💪' },
      { value: 'indicators', label: 'Indicators', icon: '📊' },
      { value: 'esg', label: 'ESG', icon: '🌱' },
      { value: 'standards', label: 'Standards', icon: '⭐' }
    ];

    return (
      <div className="bg-gradient-to-r from-[#8B9D5F] to-[#A8B87A] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">LONG TERM IMPACT</h3>
              <p className="text-sm opacity-90">{impactData.description}</p>
            </div>
          </div>
          <button
            onClick={() => setExpandedLevel(expandedLevel === 'impact' ? null : 'impact')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            {expandedLevel === 'impact' ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {/* ✅ NEW: Framework Selector inside Impact section */}
        {onFrameworkChange && (
          <div className="mb-4 pb-4 border-b border-white/20">
            <div className="flex flex-wrap gap-2">
              {frameworks.map((fw) => (
                <button
                  key={fw.value}
                  onClick={() => onFrameworkChange(fw.value as any)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    selectedFramework === fw.value
                      ? 'bg-white text-[#8B9D5F]'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <span className="mr-1">{fw.icon}</span>
                  {fw.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {expandedLevel === 'impact' && (
          <div className="mt-6 space-y-4">
            {/* Framework Contributions */}
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Award className="text-white" size={20} />
                <h4 className="font-semibold">
                  {selectedFramework === 'resilience' ? 'Resilience Capacities' :
                  selectedFramework === 'standards' ? 'Standard Bodies' :
                  `${selectedFramework.charAt(0).toUpperCase() + selectedFramework.slice(1)} Framework`}
                </h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {impactData.frameworkContributions.slice(0, 8).map((contrib: any, index: number) => (
                  <div key={index} className="bg-white/20 rounded p-3">
                    <div className="text-lg font-bold mb-1">
                      {contrib.code || contrib.name.substring(0, 3).toUpperCase()}
                    </div>
                    <div className="text-xs opacity-90 mb-1">{contrib.name}</div>
                    {contrib.secondaryInfo && (
                      <div className="text-xs opacity-75 mb-2 italic">{contrib.secondaryInfo}</div>
                    )}
                    <div className="text-sm font-semibold">
                      {contrib.impactCount} impacts
                    </div>
                    <div className="text-xs opacity-90">
                      {contrib.achievementRate}% achieved
                    </div>
                  </div>
                ))}
              </div>
              
              {impactData.frameworkContributions.length > 8 && (
                <div className="mt-3 text-center text-sm opacity-75">
                  Showing 8 of {impactData.frameworkContributions.length} {selectedFramework} items
                </div>
              )}
            </div>

            {/* Stats remain the same */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded p-3">
                <div className="text-2xl font-bold">{impactData.totalImpacts}</div>
                <div className="text-xs opacity-90">Total Impacts</div>
              </div>
              <div className="bg-white/10 rounded p-3">
                <div className="text-2xl font-bold">{impactData.frameworkContributions.length}</div>
                <div className="text-xs opacity-90">Framework Items</div>
              </div>
              <div className="bg-white/10 rounded p-3">
                <div className="text-2xl font-bold">
                  {Math.round(impactData.frameworkContributions.reduce((sum: number, c: any) => 
                    sum + c.achievementRate, 0) / (impactData.frameworkContributions.length || 1))}%
                </div>
                <div className="text-xs opacity-90">Avg Achievement</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOutcomeLevel = () => {
    if (!outcomeData) return null;

    return (
      <div className="bg-gradient-to-r from-[#C85A54] to-[#D89B97] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <Target size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">OUTCOME</h3>
              <p className="text-sm opacity-90">Short to medium term results</p>
            </div>
          </div>
          <button
            onClick={() => setExpandedLevel(expandedLevel === 'outcome' ? null : 'outcome')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            {expandedLevel === 'outcome' ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {expandedLevel === 'outcome' && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(outcomeData.categories).map(([category, data]: [string, any]) => (
                <div key={category} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{data.icon}</span>
                    <h4 className="font-semibold">{category}</h4>
                  </div>
                  <p className="text-xs opacity-90 mb-3">{data.description}</p>
                  <div className="text-lg font-bold">{data.impacts.length} impacts</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded p-3">
                <div className="text-2xl font-bold">{outcomeData.totalOutcomes}</div>
                <div className="text-xs opacity-90">Total Outcomes</div>
              </div>
              <div className="bg-white/10 rounded p-3">
                <div className="text-2xl font-bold">{Math.round(outcomeData.achievementRate)}%</div>
                <div className="text-xs opacity-90">Achievement Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActivitiesLevel = () => {
    if (!activitiesData) return null;

    return (
      <div className="bg-gradient-to-r from-[#8B6B8F] to-[#B39AB5] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">OUTPUTS (STAGE 1)</h3>
              <p className="text-sm opacity-90">Actions and interventions</p>
            </div>
          </div>
          <button
            onClick={() => setExpandedLevel(expandedLevel === 'activities' ? null : 'activities')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            {expandedLevel === 'activities' ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {expandedLevel === 'activities' && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(activitiesData.categories).map(([category, data]: [string, any]) => (
                <div key={category} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{data.icon}</span>
                    <h4 className="font-semibold text-sm">{category}</h4>
                  </div>
                  <p className="text-xs opacity-90 mb-3">{data.description}</p>
                  <div className="text-lg font-bold">{data.items.length} activities</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded p-3">
                <div className="text-2xl font-bold">{activitiesData.totalActivities}</div>
                <div className="text-xs opacity-90">Total Activities</div>
              </div>
              <div className="bg-white/10 rounded p-3">
                <div className="text-2xl font-bold">{activitiesData.scheduledActivities}</div>
                <div className="text-xs opacity-90">Scheduled</div>
              </div>
              <div className="bg-white/10 rounded p-3">
                <div className="text-2xl font-bold">{Math.round(activitiesData.averageProgress)}%</div>
                <div className="text-xs opacity-90">Avg Progress</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInputLevel = () => {
    if (!inputData) return null;

    return (
      <div className="bg-gradient-to-r from-[#5B95AC] to-[#8BB4C5] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">INPUTS & ACTIVITIES</h3>
              <p className="text-sm opacity-90">Resources, stakeholders and actions</p>
            </div>
          </div>
          <button
            onClick={() => setExpandedLevel(expandedLevel === 'input' ? null : 'input')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            {expandedLevel === 'input' ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {expandedLevel === 'input' && (
          <div className="mt-6 space-y-4">
            {/* Stakeholder List */}
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Stakeholder Groups</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {inputData.stakeholders.slice(0, 6).map((stakeholder: any, index: number) => (
                  <div key={index} className="bg-white/10 rounded p-2 text-sm">
                    <div className="font-medium">{stakeholder.name}</div>
                    <div className="text-xs opacity-90">
                      {stakeholder.capacity} activities • {Math.round(stakeholder.engagement)}% engagement
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expertise Areas */}
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Expertise & Resources</h4>
              <div className="flex flex-wrap gap-2">
                {inputData.expertise.map((exp: string, index: number) => (
                  <span key={index} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/10 rounded p-3">
                <div className="text-2xl font-bold">{inputData.totalStakeholders}</div>
                <div className="text-xs opacity-90">Stakeholder Groups</div>
              </div>
              <div className="bg-white/10 rounded p-3">
                <div className="text-2xl font-bold">{inputData.resources}</div>
                <div className="text-xs opacity-90">Total Activities</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSidePanel = () => {
    return (
      <div className="space-y-4">
        {/* Stakeholder Groups */}
        {inputData && (
          <div className="bg-white border border-sky rounded-lg p-6 shadow-sm">
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-sky/10 p-2 rounded">
                <Users className="text-sky" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-stratosphere text-sm mb-1">STAKEHOLDER GROUPS</h4>
                <p className="text-xs text-sky">Key actors and participants</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {inputData.stakeholders.slice(0, 5).map((stakeholder: any, index: number) => (
                <div key={index} className="bg-sky-tint rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stratosphere">{stakeholder.name}</span>
                    <span className="text-xs bg-sky text-white px-2 py-1 rounded">
                      {stakeholder.capacity}
                    </span>
                  </div>
                  <div className="text-xs text-sky mt-1">
                    {Math.round(stakeholder.engagement)}% engagement
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-sky-tint rounded p-2">
                <div className="text-lg font-bold text-sky">{inputData.totalStakeholders}</div>
                <div className="text-xs text-stratosphere">Total Groups</div>
              </div>
              <div className="bg-sky-tint rounded p-2">
                <div className="text-lg font-bold text-sky">{inputData.resources}</div>
                <div className="text-xs text-stratosphere">Activities</div>
              </div>
            </div>
          </div>
        )}

        {/* Barriers */}
        {barriersData && (
          <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start space-x-3 mb-3">
              <div className="bg-red-50 p-2 rounded">
                <AlertTriangle className="text-red-500" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-stratosphere text-sm mb-1">BARRIERS</h4>
                <p className="text-xs text-sky">Risks and challenges identified</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              {barriersData.barriers.map((barrier: any, index: number) => (
                <div key={index} className="bg-red-50 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      barrier.severity === 'high' ? 'bg-red-200 text-red-800' :
                      barrier.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {barrier.severity}
                    </span>
                  </div>
                  <p className="text-xs text-stratosphere">{barrier.description}</p>
                  {barrier.mitigation && (
                    <p className="text-xs text-sky mt-1">
                      <span className="font-medium">Mitigation:</span> {barrier.mitigation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-red-50 rounded p-2">
                <div className="text-lg font-bold text-red-600">{barriersData.highSeverity}</div>
                <div className="text-xs text-red-700">High Risks</div>
              </div>
              <div className="bg-green-50 rounded p-2">
                <div className="text-lg font-bold text-green-600">{barriersData.mitigationCoverage}%</div>
                <div className="text-xs text-green-700">Mitigated</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="bg-white rounded-lg p-6 border border-sky">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stratosphere mb-2">THEORY OF CHANGE</h2>
          <p className="text-sm text-sky">Visual representation of change pathway</p>
        </div>
        <div className="flex items-center space-x-2 bg-sky-tint px-4 py-2 rounded-lg">
          <Eye size={16} className="text-sky" />
          <span className="text-sm font-medium text-stratosphere capitalize">
            {reportType.replace('_', ' ')} View
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Flow - Left Side (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          {impactData && renderImpactLevel()}
          {outcomeData && renderOutcomeLevel()}
          {activitiesData && renderActivitiesLevel()}
          {inputData && renderInputLevel()}
        </div>

        {/* Side Panel - Right Side (1 column) */}
        <div className="lg:col-span-1">
          {renderSidePanel()}
        </div>
      </div>
    </div>
  );
};

export default TheoryOfChangeVisualization;