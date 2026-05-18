'use client';

import { useState } from 'react';
import { 
  AlertTriangle, Shield, Clock, TrendingUp, Users,
  ChevronDown, ChevronRight, Eye, EyeOff, BarChart3,
  Calendar, MapPin, CheckCircle, AlertCircle, XCircle,
  ArrowUp, ArrowDown, Minus, Building, Globe,
  FileText, User, Target, Activity, Filter,
  Timer, Zap, Bell, Archive
} from 'lucide-react';
import { BaseReportData, RiskRegisterReportData } from '@/types/reports';

interface RiskRegisterReportContentProps {
  report: BaseReportData;
  onUpdate?: () => void;
}

const RiskRegisterReportContent: React.FC<RiskRegisterReportContentProps> = ({ 
  report, 
  onUpdate 
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    summary: false,
    risks: false,
    overdue: false,
    highPriority: false,
    categories: false,
    owners: false,
    sites: false
  });

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low' | 'overdue'>('all');
  const [selectedView, setSelectedView] = useState<'grid' | 'table'>('grid');

  // Cast to specific report type
  const riskReport = report as RiskRegisterReportData;
  const reportData = riskReport.reportData;

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
      summary: <BarChart3 className={iconColor} size={20} />,
      risks: <AlertTriangle className={iconColor} size={20} />,
      overdue: <Clock className={iconColor} size={20} />,
      highPriority: <Zap className={iconColor} size={20} />,
      categories: <Filter className={iconColor} size={20} />,
      owners: <Users className={iconColor} size={20} />,
      sites: <MapPin className={iconColor} size={20} />
    };
    return icons[section];
  };

  const getRiskScoreColor = (score: string) => {
    switch (score.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getRiskScoreBadge = (score: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[score.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return <AlertCircle className="text-red-500" size={16} />;
      case 'monitoring': return <Eye className="text-yellow-500" size={16} />;
      case 'closed': return <CheckCircle className="text-green-500" size={16} />;
      case 'transferred': return <ArrowUp className="text-blue-500" size={16} />;
      default: return <Minus className="text-gray-500" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-red-100 text-red-800',
      monitoring: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-green-100 text-green-800',
      transferred: 'bg-blue-100 text-blue-800'
    };
    return colors[status.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderExecutiveSummary = () => (
    <div className="bg-gradient-to-r from-sky-tint to-sky-tint/50 rounded-lg p-6 mb-8 border border-sky">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-stratosphere">Risk Register Executive Summary</h2>
        <div className="flex space-x-2">
          {['all', 'high', 'medium', 'low', 'overdue'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter as any)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedFilter === filter
                  ? 'bg-sky text-white'
                  : 'bg-white text-sky border border-sky hover:bg-sky-tint'
              }`}
            >
              {filter === 'overdue' ? 'Overdue' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          <AlertTriangle className="mx-auto text-stratosphere mb-2" size={32} />
          <div className="text-3xl font-bold text-stratosphere">{reportData.executiveSummary.totalRisks}</div>
          <div className="text-sm text-sky">Total Risks</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          <Shield className="mx-auto text-green-600 mb-2" size={32} />
          <div className="text-3xl font-bold text-green-600">{reportData.executiveSummary.risksByStatus.closed}</div>
          <div className="text-sm text-sky">Closed</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          <Eye className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="text-3xl font-bold text-yellow-600">{reportData.executiveSummary.risksByStatus.monitoring}</div>
          <div className="text-sm text-sky">Monitoring</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          <Clock className="mx-auto text-red-600 mb-2" size={32} />
          <div className="text-3xl font-bold text-red-600">{reportData.executiveSummary.reviewMetrics.reviewOverdue}</div>
          <div className="text-sm text-sky">Overdue</div>
        </div>
      </div>

      {/* Risk Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-stratosphere mb-4">Risk Score Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-stratosphere">High Risk</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-stratosphere">{reportData.executiveSummary.risksByScore.high}</span>
                <div className="w-24 bg-sky-tint rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(reportData.executiveSummary.risksByScore.high / reportData.executiveSummary.totalRisks) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-stratosphere">Medium Risk</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-stratosphere">{reportData.executiveSummary.risksByScore.medium}</span>
                <div className="w-24 bg-sky-tint rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(reportData.executiveSummary.risksByScore.medium / reportData.executiveSummary.totalRisks) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-stratosphere">Low Risk</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-stratosphere">{reportData.executiveSummary.risksByScore.low}</span>
                <div className="w-24 bg-sky-tint rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(reportData.executiveSummary.risksByScore.low / reportData.executiveSummary.totalRisks) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-stratosphere mb-4">Mitigation Progress</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-stratosphere mb-2">
                {Math.round(reportData.executiveSummary.mitigationMetrics.averageProgress)}%
              </div>
              <div className="text-sm text-sky">Average Mitigation Progress</div>
            </div>
            
            <div className="w-full bg-sky-tint rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-ochre to-grass h-4 rounded-full transition-all duration-1000"
                style={{ width: `${reportData.executiveSummary.mitigationMetrics.averageProgress}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-stratosphere">{reportData.executiveSummary.mitigationMetrics.totalActions}</div>
                <div className="text-xs text-sky">Total Actions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-stratosphere">{reportData.executiveSummary.mitigationMetrics.completedActions}</div>
                <div className="text-xs text-sky">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-sky-tint rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Building size={18} className="text-sky" />
            <h4 className="font-medium text-stratosphere">Organization</h4>
          </div>
          <p className="text-sky text-sm">{reportData.organizationInfo.name}</p>
        </div>

        <div className="bg-sky-tint rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Globe size={18} className="text-sky" />
            <h4 className="font-medium text-stratosphere">Project</h4>
          </div>
          <p className="text-sky text-sm">{reportData.projectInfo.name}</p>
        </div>

        <div className="bg-sky-tint rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin size={18} className="text-ochre" />
            <h4 className="font-medium text-stratosphere">Coverage</h4>
          </div>
          <p className="text-sky text-sm">
            {reportData.executiveSummary.risksByScope.project} project-wide, {reportData.executiveSummary.risksByScope.site} site-specific
          </p>
        </div>
      </div>
    </div>
  );

  const renderRiskCard = (risk: any) => (
    <div key={risk._id} className={`rounded-lg p-6 border-2 transition-all duration-200 hover:shadow-lg ${
      risk.riskScore.toLowerCase() === 'high' ? 'bg-red-50 border-red-200' :
      risk.riskScore.toLowerCase() === 'medium' ? 'bg-yellow-50 border-yellow-200' :
      'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h5 className="font-semibold text-stratosphere mb-2">{risk.name}</h5>
          <p className="text-sm text-sky mb-3 line-clamp-2">{risk.riskDescription}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getRiskScoreBadge(risk.riskScore)}`}>
            {risk.riskScore}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(risk.status)}`}>
            {risk.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-xs text-sky font-medium">Risk Type:</span>
          <p className="text-sm text-stratosphere">{risk.riskType}</p>
        </div>
        <div>
          <span className="text-xs text-sky font-medium">Category:</span>
          <p className="text-sm text-stratosphere">{risk.category}</p>
        </div>
        <div>
          <span className="text-xs text-sky font-medium">Owner:</span>
          <p className="text-sm text-stratosphere">{risk.owner.name}</p>
        </div>
        <div>
          <span className="text-xs text-sky font-medium">Identified:</span>
          <p className="text-sm text-stratosphere">{new Date(risk.identifiedDate).toLocaleDateString()}</p>
        </div>
      </div>

      {risk.mitigationProgress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-sky font-medium">Mitigation Progress:</span>
            <span className="text-xs text-stratosphere font-medium">{risk.mitigationProgress}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                risk.mitigationProgress >= 75 ? 'bg-green-500' :
                risk.mitigationProgress >= 50 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${risk.mitigationProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {risk.isReviewOverdue && (
        <div className="flex items-center space-x-2 p-2 bg-red-100 border border-red-200 rounded text-red-800 text-sm">
          <Bell size={14} />
          <span>Review overdue</span>
        </div>
      )}

      {risk.daysUntilReview !== null && risk.daysUntilReview <= 7 && !risk.isReviewOverdue && (
        <div className="flex items-center space-x-2 p-2 bg-yellow-100 border border-yellow-200 rounded text-yellow-800 text-sm">
          <Timer size={14} />
          <span>Review due in {risk.daysUntilReview} days</span>
        </div>
      )}
    </div>
  );

  const renderRisksByCategory = () => (
    <div className="space-y-6">
      {Object.entries(reportData.risksByCategory).map(([category, risks]) => (
        <div key={category} className="bg-sky-tint rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-stratosphere">{category}</h4>
            <span className="px-3 py-1 bg-sky text-white text-sm rounded-full">
              {risks.length} risks
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {risks.slice(0, 6).map(risk => (
              <div key={risk._id} className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-stratosphere truncate">{risk.name}</span>
                  <span className={`w-3 h-3 rounded-full ${getRiskScoreColor(risk.riskScore)}`}></span>
                </div>
                <p className="text-xs text-sky mb-2 line-clamp-2">{risk.riskDescription}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky">{risk.owner.name}</span>
                  <span className={`px-2 py-1 rounded-full ${getStatusBadge(risk.status)}`}>
                    {risk.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {risks.length > 6 && (
            <div className="text-center mt-4">
              <span className="text-sm text-sky">+{risks.length - 6} more risks in this category</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderRisksByOwner = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(reportData.risksByOwner).slice(0, 9).map(([owner, risks]) => (
        <div key={owner} className="bg-sky-tint rounded-lg p-6 border border-sky">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <User className="text-sky" size={20} />
              <h5 className="font-semibold text-stratosphere">{owner}</h5>
            </div>
            <span className="px-2 py-1 bg-sky text-white text-xs rounded-full">
              {risks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {/* Risk score breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-red-600">
                  {risks.filter(r => r.riskScore.toLowerCase() === 'high').length}
                </div>
                <div className="text-xs text-sky">High</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {risks.filter(r => r.riskScore.toLowerCase() === 'medium').length}
                </div>
                <div className="text-xs text-sky">Medium</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {risks.filter(r => r.riskScore.toLowerCase() === 'low').length}
                </div>
                <div className="text-xs text-sky">Low</div>
              </div>
            </div>

            {/* Average mitigation progress */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-sky">Avg Progress:</span>
                <span className="text-xs text-stratosphere font-medium">
                  {Math.round(risks.reduce((sum, r) => sum + (r.mitigationProgress || 0), 0) / risks.length)}%
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-sky to-grass h-2 rounded-full transition-all duration-500"
                  style={{ width: `${risks.reduce((sum, r) => sum + (r.mitigationProgress || 0), 0) / risks.length}%` }}
                ></div>
              </div>
            </div>

            {/* Overdue count */}
            {risks.some(r => r.isReviewOverdue) && (
              <div className="flex items-center justify-between p-2 bg-red-100 border border-red-200 rounded">
                <span className="text-xs text-red-800">Overdue Reviews:</span>
                <span className="text-xs font-medium text-red-800">
                  {risks.filter(r => r.isReviewOverdue).length}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const getFilteredRisks = () => {
    let filtered = reportData.riskDetails;
    
    switch (selectedFilter) {
      case 'high':
        filtered = filtered.filter(risk => risk.riskScore.toLowerCase() === 'high');
        break;
      case 'medium':
        filtered = filtered.filter(risk => risk.riskScore.toLowerCase() === 'medium');
        break;
      case 'low':
        filtered = filtered.filter(risk => risk.riskScore.toLowerCase() === 'low');
        break;
      case 'overdue':
        filtered = filtered.filter(risk => risk.isReviewOverdue);
        break;
    }
    
    return filtered;
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
          <div className="p-6 bg-white border-t border-sky/20">
            {content}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Executive Summary */}
      {renderExecutiveSummary()}

      {/* Risk Details */}
      {renderSection(
        'Risk Details',
        'risks',
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-stratosphere">
              {selectedFilter === 'all' ? 'All Risks' : 
               selectedFilter === 'overdue' ? 'Overdue Risks' :
               `${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Risk Risks`}
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedView('grid')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedView === 'grid' ? 'bg-sky text-white' : 'bg-sky-tint text-sky'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setSelectedView('table')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedView === 'table' ? 'bg-sky text-white' : 'bg-sky-tint text-sky'
                }`}
              >
                Table
              </button>
            </div>
          </div>
          
          <div className={selectedView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {getFilteredRisks().slice(0, 12).map(risk => renderRiskCard(risk))}
          </div>
          
          {getFilteredRisks().length > 12 && (
            <div className="text-center">
              <span className="text-sm text-sky">
                Showing 12 of {getFilteredRisks().length} risks
              </span>
            </div>
          )}
        </div>,
        getFilteredRisks().length
      )}

      {/* High Priority Risks */}
      {reportData.highPriorityRisks.length > 0 && renderSection(
        'High Priority Risks',
        'highPriority',
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportData.highPriorityRisks.map(risk => renderRiskCard(risk))}
        </div>,
        reportData.highPriorityRisks.length
      )}

      {/* Overdue Risks */}
      {reportData.overdueRisks.length > 0 && renderSection(
        'Overdue Review Risks',
        'overdue',
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="text-red-600" size={20} />
              <h4 className="font-semibold text-red-800">Attention Required</h4>
            </div>
            <p className="text-red-700 text-sm">
              These risks have overdue reviews and require immediate attention from risk owners.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportData.overdueRisks.map(risk => renderRiskCard(risk))}
          </div>
        </div>,
        reportData.overdueRisks.length
      )}

      {/* Risks by Category */}
      {renderSection(
        'Risks by Category',
        'categories',
        renderRisksByCategory(),
        Object.keys(reportData.risksByCategory).length
      )}

      {/* Risks by Owner */}
      {renderSection(
        'Risks by Owner',
        'owners',
        renderRisksByOwner(),
        Object.keys(reportData.risksByOwner).length
      )}

      {/* Available Sites */}
      {reportData.availableSites.length > 0 && renderSection(
        'Risk Distribution by Site',
        'sites',
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportData.availableSites.map((site, index) => (
            <div key={site._id} className="bg-sky-tint rounded-lg p-6 border border-sky">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-stratosphere">{site.name}</h5>
                <MapPin className="text-ochre" size={20} />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-sky">Total Risks:</span>
                  <span className="text-sm font-medium text-stratosphere">
                    {site.riskCount || 0}
                  </span>
                </div>

                {/* Risk breakdown for this site - simplified version */}
                <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                    <div className="text-sm font-bold text-red-600">
                    {reportData.riskDetails.filter(r => 
                        r.projectSite?.name === site.name && r.riskScore.toLowerCase() === 'high'
                    ).length}
                    </div>
                    <div className="text-xs text-sky">High</div>
                </div>
                <div>
                    <div className="text-sm font-bold text-yellow-600">
                    {reportData.riskDetails.filter(r => 
                        r.projectSite?.name === site.name && r.riskScore.toLowerCase() === 'medium'
                    ).length}
                    </div>
                    <div className="text-xs text-sky">Medium</div>
                </div>
                <div>
                    <div className="text-sm font-bold text-green-600">
                    {reportData.riskDetails.filter(r => 
                        r.projectSite?.name === site.name && r.riskScore.toLowerCase() === 'low'
                    ).length}
                    </div>
                    <div className="text-xs text-sky">Low</div>
                </div>
                </div>

                {/* Site risk progress indicator */}
                <div className="w-full bg-white rounded-full h-2">
                <div 
                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                    width: `${((reportData.riskDetails.filter(r => 
                        r.projectSite?.name === site.name && r.status.toLowerCase() === 'closed'
                    ).length) / (site.riskCount || 1)) * 100}%` 
                    }}
                ></div>
                </div>
              </div>
            </div>
          ))}
        </div>,
        reportData.availableSites.length
      )}

      {/* Risk Types Overview */}
      {Object.keys(reportData.risksByType).length > 0 && renderSection(
        'Risk Types Distribution',
        'types',
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(reportData.risksByType).map(([type, risks]) => (
            <div key={type} className="bg-sky-tint rounded-lg p-6 text-center">
              <div className="mb-4">
                <AlertTriangle className="mx-auto text-sky" size={32} />
              </div>
              <h5 className="font-semibold text-stratosphere mb-2">{type}</h5>
              <div className="text-2xl font-bold text-stratosphere mb-2">{risks.length}</div>
              <div className="text-sm text-sky">risks</div>
              
              {/* Mini risk score breakdown */}
              <div className="grid grid-cols-3 gap-1 mt-3">
                <div className="bg-red-100 rounded p-1">
                  <div className="text-xs font-medium text-red-800">
                    {risks.filter(r => r.riskScore.toLowerCase() === 'high').length}
                  </div>
                </div>
                <div className="bg-yellow-100 rounded p-1">
                  <div className="text-xs font-medium text-yellow-800">
                    {risks.filter(r => r.riskScore.toLowerCase() === 'medium').length}
                  </div>
                </div>
                <div className="bg-green-100 rounded p-1">
                  <div className="text-xs font-medium text-green-800">
                    {risks.filter(r => r.riskScore.toLowerCase() === 'low').length}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>,
        Object.keys(reportData.risksByType).length
      )}
    </div>
  );
};

export default RiskRegisterReportContent;