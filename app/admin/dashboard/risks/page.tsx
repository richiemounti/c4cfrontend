// app/admin/dashboard/risks/page.tsx - Fixed with proper types

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Building2,
  FolderOpen
} from 'lucide-react';

import { 
  getRiskRegisterSummary,
  createRiskItem,
  getRiskDetails,
  updateRiskItem,
  addMitigationAction,
} from '@/lib/api/riskManagement';
import { RiskItem } from '@/types';

// Define types locally to avoid import issues
interface Organization {
  _id: string;
  name: string;
  country: string;
  city: string;
}

interface Project {
  _id: string;
  name: string;
  status: string;
}

interface ProjectSite {
  _id: string;
  name: string;
  status: string;
}

interface RiskOwner {
  _id: string;
  name: string;
  email: string;
}

interface RiskStats {
  total: number;
  byScore: {
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    open: number;
    monitoring: number;
    closed: number;
    transferred: number;
  };
  byType: Record<string, number>;
  reviewOverdue: number;
  dueForReviewSoon: number;
}

interface RiskFilters {
  organizationId?: string;
  projectId?: string;
  projectSiteId?: string;
  riskScore?: string;
  status?: string;
  riskType?: string;
}

function RiskManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [stats, setStats] = useState<RiskStats | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<RiskFilters>({
    organizationId: searchParams.get('organizationId') || undefined,
    projectId: searchParams.get('projectId') || undefined,
    projectSiteId: searchParams.get('projectSiteId') || undefined
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRisks();
  }, [filters]);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const riskData = await getRiskRegisterSummary(filters);
      
      // Handle different possible data structures
      if (riskData.stats && riskData.risks) {
        setStats(riskData.stats);
        setRisks(riskData.risks);
      } else {
        // Fallback if structure is different
        setRisks(Array.isArray(riskData) ? riskData : []);
        setStats(null);
      }
    } catch (error: any) {
      console.error('Error fetching risks:', error);
      setError(error.message || 'Failed to load risks');
      setRisks([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRiskClick = async (riskId: string) => {
    try {
      // Navigate to detailed risk page instead of showing in sidebar
      router.push(`/admin/dashboard/risks/${riskId}`);
    } catch (error: any) {
      console.error('Error navigating to risk details:', error);
    }
  };

  const handleCreateRisk = () => {
    // Navigate to create risk page with current filters as context
    const createUrl = new URLSearchParams();
    if (filters.projectId) createUrl.append('projectId', filters.projectId);
    if (filters.projectSiteId) createUrl.append('projectSiteId', filters.projectSiteId);
    if (filters.organizationId) createUrl.append('organizationId', filters.organizationId);
    
    router.push(`/admin/dashboard/risks/create?${createUrl.toString()}`);
  };

  const getRiskScoreColor = (score: string) => {
    switch (score) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-stone-100 text-ink-400 border-stone-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'transferred':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-stone-100 text-ink-400';
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case 'operational':
        return <Shield className="h-4 w-4" />;
      case 'financial':
        return <TrendingDown className="h-4 w-4" />;
      case 'environmental':
        return <AlertTriangle className="h-4 w-4" />;
      case 'social':
        return <User className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const filteredRisks = risks.filter(risk => {
    if (searchTerm && 
        !risk.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !risk.riskDescription.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-neutral-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-coral-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-ink">Risk Register</h1>
            <p className="text-neutral-600">Monitor and manage project risks</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-stone-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-stone-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button 
            onClick={handleCreateRisk}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-coral-500 hover:bg-coral-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Risk
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={fetchRisks}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-neutral-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Total Risks</p>
                <p className="text-2xl font-semibold text-ink">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">High Risk</p>
                <p className="text-2xl font-semibold text-red-900">{stats.byScore.high}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Minus className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Medium Risk</p>
                <p className="text-2xl font-semibold text-yellow-900">{stats.byScore.medium}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Low Risk</p>
                <p className="text-2xl font-semibold text-green-900">{stats.byScore.low}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-500">Review Overdue</p>
                <p className="text-2xl font-semibold text-orange-900">{stats.reviewOverdue}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk List */}
      <div className="bg-white rounded-lg shadow">
        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-ink">Risk Register</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-1 border border-stone-300 rounded-md text-sm text-neutral-700 bg-white hover:bg-stone-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search risks..."
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:ring-coral-500 focus:border-coral-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <select 
                className="border border-stone-300 rounded-md text-sm"
                value={filters.riskScore || 'all'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  riskScore: e.target.value === 'all' ? undefined : e.target.value 
                }))}
              >
                <option value="all">All Risk Scores</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select 
                className="border border-stone-300 rounded-md text-sm"
                value={filters.status || 'all'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  status: e.target.value === 'all' ? undefined : e.target.value 
                }))}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="monitoring">Monitoring</option>
                <option value="closed">Closed</option>
                <option value="transferred">Transferred</option>
              </select>

              <select 
                className="border border-stone-300 rounded-md text-sm"
                value={filters.riskType || 'all'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  riskType: e.target.value === 'all' ? undefined : e.target.value 
                }))}
              >
                <option value="all">All Types</option>
                <option value="operational">Operational</option>
                <option value="financial">Financial</option>
                <option value="environmental">Environmental</option>
                <option value="social">Social</option>
                <option value="technical">Technical</option>
                <option value="compliance">Compliance</option>
                <option value="strategic">Strategic</option>
                <option value="reputational">Reputational</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Risk List Content */}
        <div className="divide-y divide-stone-200">
          {filteredRisks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-neutral-400" />
              <h3 className="mt-2 text-sm font-medium text-ink">No risks found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                {risks.length === 0 
                  ? 'Get started by creating a new risk item.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {risks.length === 0 && (
                <div className="mt-6">
                  <button
                    onClick={handleCreateRisk}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-coral-500 hover:bg-coral-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Risk
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredRisks.map((risk) => (
              <div 
                key={risk._id} 
                className="px-6 py-4 hover:bg-stone-50 cursor-pointer transition-colors"
                onClick={() => handleRiskClick(risk._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getRiskTypeIcon(risk.riskType)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-ink hover:text-coral-600">
                          {risk.name}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-1">
                          {risk.organization?.name} • {risk.project?.name}
                          {risk.projectSite && ` • ${risk.projectSite.name}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskScoreColor(risk.riskScore)}`}>
                        {risk.riskScore} risk
                      </span>
                      
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(risk.status)}`}>
                        {risk.status}
                      </span>

                      <span className="text-xs text-neutral-500 capitalize">
                        {risk.riskType}
                      </span>
                      
                      {risk.isReviewOverdue && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          Review Overdue
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-neutral-600 mt-2 line-clamp-2">
                      {risk.riskDescription}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-neutral-500">
                        <User className="h-3 w-3" />
                        <span>{risk.owner?.name || 'Unassigned'}</span>
                      </div>
                      {risk.reviewDate && (
                        <div className="flex items-center space-x-1 text-xs text-neutral-500">
                          <Calendar className="h-3 w-3" />
                          <span>Review: {new Date(risk.reviewDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRiskClick(risk._id);
                      }}
                      className="inline-flex items-center px-3 py-1 border border-stone-300 text-xs font-medium rounded-md text-neutral-700 bg-white hover:bg-stone-50"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Risk Type Distribution Chart */}
      {stats && Object.keys(stats.byType).length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-ink mb-4">Risk Distribution by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getRiskTypeIcon(type)}
                </div>
                <div className="text-lg font-semibold text-ink">{count}</div>
                <div className="text-sm text-neutral-500 capitalize">{type}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RiskManagementPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-neutral-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-coral-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    }>
      <RiskManagementContent />
    </Suspense>
  );
}