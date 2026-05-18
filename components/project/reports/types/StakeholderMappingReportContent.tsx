// components/reports/types/StakeholderMappingReportContent.tsx
'use client';

import { useState } from 'react';
import { 
  Users, Network, BarChart3, TrendingUp, Eye, EyeOff,
  ChevronDown, ChevronRight, CheckCircle, Clock, Star,
  MapPin, Building, Award, AlertTriangle, FileText,
  Target, Shield, Heart, Zap, Calendar, User, Sparkles,
  TrendingDown, Filter
} from 'lucide-react';
import { BaseReportData, StakeholderMappingReportData, KeyInsightAnalysis } from '@/types/reports';

interface StakeholderMappingReportContentProps {
  report: BaseReportData;
  onUpdate?: () => void;
}

const StakeholderMappingReportContent: React.FC<StakeholderMappingReportContentProps> = ({ 
  report, 
  onUpdate 
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    summary: false,
    keyInsights: false, // NEW section
    stakeholders: false,
    categories: false,
    influence: false,
    sites: false,
    tags: false // Renamed from insights
  });

  const [selectedTaskType, setSelectedTaskType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const setupReport = report as StakeholderMappingReportData;
  const reportData = setupReport.reportData;

  const hasKeyInsights = reportData.keyInsights && typeof reportData.keyInsights === 'object';
  const hasTagInsights = reportData.tagInsights && typeof reportData.tagInsights === 'object';

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatTaskValue = (value: any): string => {
    if (!value) return 'Not specified';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Not specified';
      return value.join(', ');
    }
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  const getSectionIcon = (section: string, isExpanded: boolean) => {
    const iconColor = isExpanded ? 'text-white' : 'text-sky';
    const icons: Record<string, React.ReactNode> = {
      overview: <TrendingUp className={iconColor} size={20} />,
      summary: <BarChart3 className={iconColor} size={20} />,
      keyInsights: <Sparkles className={iconColor} size={20} />, // NEW
      stakeholders: <Users className={iconColor} size={20} />,
      categories: <Network className={iconColor} size={20} />,
      influence: <Star className={iconColor} size={20} />,
      sites: <MapPin className={iconColor} size={20} />,
      tags: <FileText className={iconColor} size={20} />
    };
    return icons[section];
  };

  const getInfluenceColor = (rating: number): string => {
    if (rating >= 4) return 'bg-red-500';
    if (rating >= 3) return 'bg-orange-500';
    if (rating >= 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getInfluenceLabel = (rating: number): string => {
    if (rating >= 4) return 'Very High';
    if (rating >= 3) return 'High';
    if (rating >= 2) return 'Medium';
    return 'Low';
  };

  const getCompletionColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'not_started': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getTaskIcon = (taskType: string) => {
    const icons: Record<string, React.ReactNode> = {
      connections: <Network size={14} className="mr-1" />,
      power: <Zap size={14} className="mr-1" />,
      wellbeing: <Heart size={14} className="mr-1" />,
      roles: <User size={14} className="mr-1" />,
      risks: <AlertTriangle size={14} className="mr-1" />,
      benefits: <Award size={14} className="mr-1" />
    };
    return icons[taskType] || <FileText size={14} className="mr-1" />;
  };

  const getTaskTypeLabel = (taskType: string): string => {
    const labels: Record<string, string> = {
      connections: 'Connections',
      power: 'Power & Influence',
      wellbeing: 'Well-being',
      roles: 'Roles & Responsibilities',
      risks: 'Risks',
      benefits: 'Benefits'
    };
    return labels[taskType] || taskType;
  };

  // Filter key insights based on selections
  const getFilteredInsights = (): KeyInsightAnalysis[] => {
    if (!hasKeyInsights) return [];
    
    let insights = [...reportData.keyInsights.allInsights];
    
    if (selectedTaskType !== 'all') {
      insights = insights.filter(i => i.taskType === selectedTaskType);
    }
    
    if (selectedCategory !== 'all') {
      insights = insights.filter(i => i.stakeholder.category === selectedCategory);
    }
    
    return insights;
  };

  const renderProgressOverview = () => (
    <div className="bg-gradient-to-r from-sky-tint to-sky-tint/50 rounded-lg p-6 mb-8 border border-sky">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-stratosphere">Stakeholder Mapping Progress</h2>
        <div className="flex items-center space-x-2">
          {reportData.summary.completionPercentage >= 90 ? (
            <CheckCircle className="text-grass" size={24} />
          ) : (
            <Clock className="text-sky" size={24} />
          )}
          <span className={`font-medium ${reportData.summary.completionPercentage >= 90 ? 'text-grass' : 'text-sky'}`}>
            {reportData.summary.completionPercentage >= 90 ? 'Nearly Complete' : 'In Progress'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-stratosphere">
            {reportData.summary.totalStakeholders}
          </div>
          <div className="text-sm text-sky">Total Stakeholders</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-grass">
            {reportData.summary.completedStakeholders}
          </div>
          <div className="text-sm text-sky">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">
            {reportData.summary.inProgressStakeholders}
          </div>
          <div className="text-sm text-sky">In Progress</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-stratosphere">
            {Math.round(reportData.summary.completionPercentage)}%
          </div>
          <div className="text-sm text-sky">Complete</div>
        </div>
      </div>
      
      {/* NEW: Key Insights Summary in Progress Overview */}
      {hasKeyInsights && reportData.keyInsights.totalKeyInsights > 0 && (
        <div className="mt-6 pt-6 border-t border-sky/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-stratosphere flex items-center">
              <Sparkles className="mr-2 text-ochre-500" size={16} />
              Key Insights Summary
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-ochre-200">
              <div className="text-xl font-bold text-ochre-500">
                {reportData.keyInsights.totalKeyInsights}
              </div>
              <div className="text-xs text-sky">Total Insights</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-ochre-200">
              <div className="text-xl font-bold text-ochre-500">
                {reportData.keyInsights.stakeholdersWithKeyInsights}
              </div>
              <div className="text-xs text-sky">Stakeholders</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-ochre-200">
              <div className="text-xl font-bold text-ochre-500">
                {reportData.keyInsights.averageKeyInsightsPerStakeholder.toFixed(1)}
              </div>
              <div className="text-xs text-sky">Avg per Stakeholder</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-ochre-200">
              <div className="text-xl font-bold text-ochre-500">
                {reportData.keyInsights.percentageOfStakeholdersWithKeyInsights}%
              </div>
              <div className="text-xs text-sky">Coverage</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-2 mt-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-stratosphere">Overall Progress</span>
          <span className="text-sm text-sky">{Math.round(reportData.summary.completionPercentage)}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-4 shadow-inner border">
          <div 
            className="bg-gradient-to-r from-sky to-grass h-4 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${reportData.summary.completionPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

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
          <div className="p-6 bg-white border-t border-sky/20">
            {content}
          </div>
        )}
      </div>
    );
  };

  const renderDataRow = (label: string, value: any, isHighlight?: boolean) => (
    <div className={`py-3 border-b border-sky-tint/50 last:border-b-0 ${
      isHighlight ? 'bg-sky-tint/30 rounded' : ''
    }`}>
      <div className="flex flex-col gap-1">
        <span className="text-sky text-xs font-medium uppercase tracking-wide">{label}</span>
        <span className="text-stratosphere text-sm break-words">{formatTaskValue(value)}</span>
      </div>
    </div>
  );

  // NEW: Render Key Insights Section
  const renderKeyInsightsSection = () => {
    if (!hasKeyInsights || reportData.keyInsights.totalKeyInsights === 0) {
      return (
        <div className="text-center py-12">
          <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-stratosphere mb-2">No Key Insights Yet</h4>
          <p className="text-sky mb-4 max-w-md mx-auto">
            Key insights will appear here once stakeholders have marked important responses during their assessments.
          </p>
          <div className="bg-sky-tint rounded-lg p-4 text-left max-w-md mx-auto">
            <h5 className="font-medium text-stratosphere mb-2">What are Key Insights?</h5>
            <ul className="text-sm text-sky space-y-1">
              <li>• Critical responses marked by stakeholder assessors</li>
              <li>• Most important findings across all assessment areas</li>
              <li>• Highlighted concerns, opportunities, and impacts</li>
              <li>• Prioritized for reporting and decision-making</li>
            </ul>
          </div>
        </div>
      );
    }

    const filteredInsights = getFilteredInsights();
    const taskTypes = ['all', 'connections', 'power', 'wellbeing', 'roles', 'risks', 'benefits'];
    const categories = ['all', ...Object.keys(reportData.keyInsights.byCategory)];

    return (
      <div className="space-y-6">
        {/* Key Insights Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-ochre-50 to-ochre-100 rounded-lg p-6 text-center border border-ochre-200">
            <Sparkles className="mx-auto mb-2 text-ochre-500" size={32} />
            <div className="text-3xl font-bold text-ochre-900">
              {reportData.keyInsights.totalKeyInsights}
            </div>
            <div className="text-sm text-ochre-700">Total Key Insights</div>
          </div>
          <div className="bg-sky-tint rounded-lg p-6 text-center">
            <Users className="mx-auto mb-2 text-sky" size={32} />
            <div className="text-3xl font-bold text-stratosphere">
              {reportData.keyInsights.stakeholdersWithKeyInsights}
            </div>
            <div className="text-sm text-sky">Stakeholders with Insights</div>
          </div>
          <div className="bg-sky-tint rounded-lg p-6 text-center">
            <TrendingUp className="mx-auto mb-2 text-sky" size={32} />
            <div className="text-3xl font-bold text-stratosphere">
              {reportData.keyInsights.averageKeyInsightsPerStakeholder.toFixed(1)}
            </div>
            <div className="text-sm text-sky">Average per Stakeholder</div>
          </div>
          <div className="bg-sky-tint rounded-lg p-6 text-center">
            <BarChart3 className="mx-auto mb-2 text-sky" size={32} />
            <div className="text-3xl font-bold text-stratosphere">
              {reportData.keyInsights.percentageOfStakeholdersWithKeyInsights}%
            </div>
            <div className="text-sm text-sky">Stakeholder Coverage</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-sky-tint rounded-lg p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-sky" />
              <span className="text-sm font-medium text-stratosphere">Filter Insights:</span>
            </div>
            
            <select
              value={selectedTaskType}
              onChange={(e) => setSelectedTaskType(e.target.value)}
              className="px-3 py-2 border border-sky rounded-md text-sm text-stratosphere bg-white"
            >
              {taskTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Assessment Areas' : getTaskTypeLabel(type)}
                </option>
              ))}
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-sky rounded-md text-sm text-stratosphere bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            
            {(selectedTaskType !== 'all' || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSelectedTaskType('all');
                  setSelectedCategory('all');
                }}
                className="text-sm text-sky hover:text-stratosphere underline"
              >
                Clear Filters
              </button>
            )}
            
            <div className="ml-auto text-sm text-sky">
              Showing {filteredInsights.length} of {reportData.keyInsights.totalKeyInsights} insights
            </div>
          </div>
        </div>

        {/* Top Stakeholders with Key Insights */}
        <div className="bg-white rounded-lg p-6 border border-ochre-200">
          <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
            <Award className="mr-2 text-ochre-500" size={20} />
            Top Stakeholders by Key Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.keyInsights.topStakeholders.slice(0, 9).map((entry, index) => (
              <div key={entry.stakeholder._id} className="bg-sky-tint rounded-lg p-4 border border-sky">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {index < 3 && (
                        <span className={`text-lg ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-orange-600'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                      <h5 className="font-medium text-stratosphere text-sm">
                        {entry.stakeholder.name}
                      </h5>
                    </div>
                    <p className="text-xs text-sky mb-2">{entry.stakeholder.category}</p>
                  </div>
                  <div className="flex flex-col items-center bg-ochre-100 rounded-lg px-3 py-2">
                    <Sparkles className="text-ochre-500 mb-1" size={16} />
                    <span className="text-lg font-bold text-ochre-900">{entry.keyInsightCount}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {Object.entries(entry.keyInsightsByTask).map(([taskType, count]) => (
                    count > 0 && (
                      <div key={taskType} className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                        {getTaskIcon(taskType)}
                        <span className="text-stratosphere">{count}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights by Assessment Area */}
        <div className="bg-sky-tint rounded-lg p-6">
          <h4 className="font-semibold text-stratosphere mb-4">Key Insights by Assessment Area</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(reportData.keyInsights.byTaskType).map(([taskType, data]) => (
              <div key={taskType} className="bg-white p-4 rounded border border-sky">
                <h5 className="font-medium text-stratosphere mb-3 capitalize flex items-center justify-between">
                  <span className="flex items-center">
                    {getTaskIcon(taskType)}
                    {getTaskTypeLabel(taskType)}
                  </span>
                  <span className="px-2 py-1 bg-ochre-100 text-ochre-700 text-xs rounded-full flex items-center gap-1">
                    <Sparkles size={12} />
                    {data.count}
                  </span>
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-xs">
                    <span className="text-sky">Stakeholders:</span>
                    <span className="text-stratosphere font-medium">{data.stakeholders}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-sky">Avg per Stakeholder:</span>
                    <span className="text-stratosphere font-medium">
                      {data.stakeholders > 0 ? (data.count / data.stakeholders).toFixed(1) : '0'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights by Category */}
        <div className="bg-white rounded-lg p-6 border border-sky">
          <h4 className="font-semibold text-stratosphere mb-4">Key Insights by Stakeholder Category</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(reportData.keyInsights.byCategory).map(([category, data]) => (
              <div key={category} className="bg-sky-tint p-4 rounded border">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-stratosphere">{category}</h5>
                  <span className="px-3 py-1 bg-ochre-500 text-white text-sm rounded-full flex items-center gap-1">
                    <Sparkles size={14} />
                    {data.count}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-sky">Stakeholders:</span>
                  <span className="text-stratosphere font-medium">{data.stakeholders}</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div 
                    className="bg-ochre-500 h-2 rounded-full" 
                    style={{ 
                      width: `${(data.count / reportData.keyInsights.totalKeyInsights * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-sky mt-1 text-right">
                  {((data.count / reportData.keyInsights.totalKeyInsights) * 100).toFixed(1)}% of total insights
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-sky-tint rounded-lg p-6">
          <h4 className="font-semibold text-stratosphere mb-4">Key Insights by Rating</h4>
          <div className="grid grid-cols-5 gap-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reportData.keyInsights.ratingDistribution[rating.toString()] || 0;
              const percentage = reportData.keyInsights.totalKeyInsights > 0
                ? (count / reportData.keyInsights.totalKeyInsights) * 100
                : 0;
              
              return (
                <div key={rating} className="bg-white p-4 rounded text-center">
                  <div className="flex items-center justify-center mb-2">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <div className="text-2xl font-bold text-stratosphere">{count}</div>
                  <div className="text-xs text-sky">{percentage.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Key Insights List */}
        <div className="bg-white rounded-lg p-6 border border-sky">
          <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
            <FileText className="mr-2 text-sky" size={20} />
            Detailed Key Insights
            <span className="ml-2 text-sm text-sky">({filteredInsights.length})</span>
          </h4>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredInsights.map((insight, index) => (
              <div key={index} className="bg-sky-tint p-4 rounded-lg border border-ochre-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-ochre-500 text-white text-xs rounded-full flex items-center gap-1">
                        <Sparkles size={10} />
                        Key Insight
                      </span>
                      <span className="px-2 py-1 bg-sky text-white text-xs rounded-full capitalize flex items-center gap-1">
                        {getTaskIcon(insight.taskType)}
                        {getTaskTypeLabel(insight.taskType)}
                      </span>
                      {insight.rating && (
                        <span className="flex items-center gap-1">
                          {[...Array(Math.round(insight.rating))].map((_, i) => (
                            <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </span>
                      )}
                    </div>
                    <p className="text-stratosphere mb-2">{insight.description}</p>
                    <div className="flex items-center gap-3 text-xs text-sky">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {insight.stakeholder.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Network size={12} />
                        {insight.stakeholder.category}
                      </span>
                      {insight.siteName && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {insight.siteName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {insight.tags && insight.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {insight.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white text-sky-700 text-xs rounded border border-sky-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Progress Overview */}
      {renderProgressOverview()}

      {/* Executive Summary */}
      {renderSection(
        'Executive Summary',
        'overview',
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div className="space-y-6">
            <div className="bg-sky-tint rounded-lg p-6">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
                <Building className="mr-2 text-sky" size={20} />
                Project Information
              </h4>
              <div className="space-y-3">
                {renderDataRow('Project Name', reportData.projectInfo.name, true)}
                {renderDataRow('Organization', reportData.organizationInfo.name)}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-sky-tint to-sky-tint/50 rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4">Completion Status</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <div className="text-2xl font-bold text-grass">
                    {reportData.summary.completedStakeholders}
                  </div>
                  <div className="text-sm text-sky">Completed</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600">
                    {reportData.summary.inProgressStakeholders}
                  </div>
                  <div className="text-sm text-sky">In Progress</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <div className="text-2xl font-bold text-gray-500">
                    {reportData.summary.notStartedStakeholders}
                  </div>
                  <div className="text-sm text-sky">Not Started</div>
                </div>
              </div>
            </div>

            <div className="bg-sky-tint rounded-lg p-6">
              <h4 className="font-semibold text-stratosphere mb-4">
                Average Ratings across all Stakeholders 
                {renderDataRow('Overall Average Rating', reportData.summary.averageRatings.overall.toFixed(1))} 
              </h4>
              <div className="space-y-2">
                {Object.entries(reportData.summary.averageRatings.byTaskType).map(([taskType, rating]) => (
                  <div key={taskType} className="flex items-center justify-between">
                    <span className="text-sm text-stratosphere capitalize">{taskType.replace('_', ' ')}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-white rounded-full h-2">
                        <div 
                          className="bg-sky h-2 rounded-full" 
                          style={{ width: `${(rating / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-sky">{rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Summary Statistics */}
      {renderSection(
        'Summary Statistics',
        'summary',
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-sky-tint rounded-lg p-6">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
                <BarChart3 className="mr-2 text-sky" size={20} />
                Stakeholders by Category
              </h4>
              <div className="space-y-3">
                {Object.entries(reportData.summary.stakeholdersByCategory).map(([category, data]) => (
                  <div key={category} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-stratosphere">{category}</span>
                      <span className="text-sm text-sky">{data.total} stakeholders</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-grass">Completed: {data.completed}</div>
                      <div className="text-sky">Avg Rating: {data.averageRating.toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-sky-tint rounded-lg p-6">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
                <MapPin className="mr-2 text-sky" size={20} />
                Stakeholders by Site
              </h4>
              <div className="space-y-3">
                {Object.entries(reportData.summary.stakeholdersBySite).map(([siteId, count]) => {
                  const site = reportData.availableSites.find(s => s._id === siteId);
                  return (
                    <div key={siteId} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-stratosphere">{site?.name || 'Unknown Site'}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-sky">{count} stakeholders</span>
                          {site?.keyInsightCount && site.keyInsightCount > 0 && (
                            <span className="px-2 py-1 bg-ochre-100 text-ochre-700 text-xs rounded flex items-center gap-1">
                              <Sparkles size={10} />
                              {site.keyInsightCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Key Insights Section */}
      {hasKeyInsights && renderSection(
        'Key Insights',
        'keyInsights',
        renderKeyInsightsSection(),
        reportData.keyInsights?.totalKeyInsights || 0
      )}

      {/* Categories Analysis */}
      {renderSection(
        'Category Analysis',
        'categories',
        <div className="space-y-6">
          {Object.entries(reportData.stakeholdersByCategory).map(([category, stakeholders]) => (
            <div key={category} className="bg-sky-tint rounded-lg p-6 border border-sky">
              <h4 className="font-semibold text-stratosphere mb-4 flex items-center">
                <Network className="mr-2 text-sky" size={20} />
                {category}
                <span className="ml-2 px-2 py-1 bg-sky text-white text-xs rounded-full">
                  {stakeholders.length}
                </span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stakeholders.map((stakeholder) => (
                  <div key={stakeholder._id} className="bg-white p-4 rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-stratosphere text-sm">{stakeholder.name}</h5>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getCompletionColor(stakeholder.completionStatus)}`}></div>
                        {stakeholder.keyInsightCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-ochre-500 text-white text-xs rounded flex items-center gap-0.5">
                            <Sparkles size={8} />
                            {stakeholder.keyInsightCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="text-sky">Rating: {stakeholder.averageRating.toFixed(1)}/5</div>
                      <div className="text-sky">Scope: {stakeholder.scope}</div>
                      <div className="text-sky">Tasks: {stakeholder.taskCompletionCount}/{stakeholder.tasks.length}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>,
        Object.keys(reportData.stakeholdersByCategory).length
      )}

      {/* Influence Matrix */}
      {reportData.influenceMatrix && reportData.influenceMatrix.length > 0 && renderSection(
        'Influence Matrix',
        'influence',
        <div className="space-y-6">
          <div className="bg-sky-tint rounded-lg p-6">
            <h4 className="font-semibold text-stratosphere mb-4">Stakeholder Influence Analysis</h4>
            <p className="text-sm text-sky mb-4">
              This matrix shows the relative influence and importance of each stakeholder based on their ratings across different dimensions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportData.influenceMatrix.map((entry, index) => (
              <div key={entry.stakeholder._id} className="bg-white rounded-lg p-6 border border-sky shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h5 className="font-semibold text-stratosphere">{entry.stakeholder.name}</h5>
                    {entry.stakeholder.keyInsightCount > 0 && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-ochre-100 text-ochre-700 text-xs rounded">
                        <Sparkles size={10} />
                        {entry.stakeholder.keyInsightCount} key insights
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getInfluenceColor(entry.averageInfluence)}`}></div>
                    <span className="text-sm font-medium text-stratosphere">
                      {getInfluenceLabel(entry.averageInfluence)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-stratosphere">{entry.averageInfluence.toFixed(1)}</div>
                    <div className="text-sm text-sky">Average Influence Score</div>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(entry.ratings).map(([dimension, rating]) => (
                      <div key={dimension} className="flex items-center justify-between">
                        <span className="text-sm text-sky capitalize flex items-center">
                          {dimension === 'power' && <Zap size={14} className="mr-1" />}
                          {dimension === 'connections' && <Network size={14} className="mr-1" />}
                          {dimension === 'risks' && <AlertTriangle size={14} className="mr-1" />}
                          {dimension === 'roles' && <User size={14} className="mr-1" />}
                          {dimension === 'benefits' && <Award size={14} className="mr-1" />}
                          {dimension === 'wellbeing' && <Heart size={14} className="mr-1" />}
                          {dimension}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-sky-tint rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getInfluenceColor(rating)}`}
                              style={{ width: `${(rating / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-stratosphere w-8">{rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>,
        reportData.influenceMatrix.length
      )}

      {/* Keep Tags section for backward compatibility - rename to "Additional Tags" */}
      {hasTagInsights && renderSection(
        'Additional Tags', 
        'tags',
        <div className="space-y-6">
          <div className="bg-sky-tint rounded-lg p-4">
            <p className="text-sm text-sky">
              These are additional tags that have been added to stakeholder assessments. 
              For the most important findings, see the Key Insights section above.
            </p>
          </div>
          {/* ... rest of existing tags rendering ... */}
        </div>,
        reportData.tagInsights?.totalUniqueTags || 0
      )}

      {/* Stakeholder Details */}
      {renderSection(
        'Stakeholder Details',
        'stakeholders',
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {reportData.stakeholderData.map((stakeholder, index) => (
              <div key={stakeholder._id} className="bg-sky-tint rounded-lg p-6 border border-sky">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold text-stratosphere">{stakeholder.name}</h5>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getCompletionColor(stakeholder.completionStatus)}`}></div>
                    <span className="text-xs text-sky capitalize">{stakeholder.completionStatus.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-sky font-medium">Category</div>
                    <div className="text-stratosphere">{stakeholder.category.name}</div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-sky font-medium">Scope</div>
                    <div className="text-stratosphere capitalize">{stakeholder.scope}</div>
                  </div>
                  
                  {/* NEW: Show key insights count prominently */}
                  {stakeholder.keyInsightCount > 0 ? (
                    <div className="bg-gradient-to-r from-ochre-50 to-ochre-100 p-3 rounded border border-ochre-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-ochre-900 font-medium flex items-center gap-1">
                          <Sparkles size={14} />
                          Key Insights
                        </div>
                        <span className="px-2 py-1 bg-ochre-500 text-white text-xs rounded-full">
                          {stakeholder.keyInsightCount}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {Object.entries(stakeholder.keyInsightsByTask).map(([taskType, count]) => (
                          count > 0 && (
                            <div key={taskType} className="flex items-center gap-1 bg-white px-2 py-1 rounded text-xs">
                              {getTaskIcon(taskType)}
                              <span className="text-stratosphere">{count}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded border border-dashed border-gray-300">
                      <div className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-1">
                        <Sparkles size={14} />
                        Key Insights
                      </div>
                      <div className="text-xs text-gray-400">
                        No key insights marked yet
                      </div>
                    </div>
                  )}

                  {/* Show tags if available */}
                  {stakeholder.allTags && stakeholder.allTags.length > 0 && (
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-sky font-medium mb-2">Additional Tags</div>
                      <div className="flex flex-wrap gap-1">
                        {stakeholder.allTags.slice(0, 6).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {stakeholder.allTags.length > 6 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{stakeholder.allTags.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-sky font-medium">Average Rating</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-sky-tint rounded-full h-2">
                          <div 
                            className="bg-sky h-2 rounded-full" 
                            style={{ width: `${(stakeholder.averageRating / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-stratosphere font-bold">{stakeholder.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-sky font-medium">Tasks Completed</div>
                    <div className="text-stratosphere">{stakeholder.taskCompletionCount} of {stakeholder.tasks.length}</div>
                  </div>
                  
                  {stakeholder.description && (
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-sky font-medium">Description</div>
                      <div className="text-stratosphere text-sm">{stakeholder.description}</div>
                    </div>
                  )}
                  
                  <div className="text-xs text-sky">
                    Created: {new Date(stakeholder.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>,
        reportData.stakeholderData.length
      )}
    </div>
  );
};

export default StakeholderMappingReportContent;