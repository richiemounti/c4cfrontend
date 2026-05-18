// app/admin/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  FolderOpen, 
  MessageSquare, 
  BarChart3, 
  Filter, 
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Search,
  Eye,
  Edit,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Timer,
  ArrowRight,
  Plus,
  Shield,
  Activity,
  RefreshCw,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  Package,
  MapPin
} from 'lucide-react';

// Import the API functions
import { 
  getDashboardOverview, 
  getOrganizationsSummary, 
} from '@/lib/api/adminDashboard';
import { getEscalatedReviews } from '@/lib/api/reviews';
import { getPulseSurveyStats } from '@/lib/api/pulseSurvey';
import { 
  getWorkloadSummary, 
  getSupportEscalationStats, 
  getIncidentStats,
  markItemCompleted 
} from '@/lib/api/workload';
import { DashboardOverview, OrganizationSummary, WorkloadSummary, SupportEscalationStats, IncidentStats } from '@/types/adminDashboard';
import NotificationBell from '@/components/inbox/NotificationBell';
import { Review } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, eulaStatus, eulaLoading, checkEulaAndRedirect } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [escalatedReviews, setEscalatedReviews] = useState<Review[]>([]);
  const [pulseSurveyStats, setPulseSurveyStats] = useState<any>(null);
  const [workloadData, setWorkloadData] = useState<WorkloadSummary | null>(null);
  const [supportStats, setSupportStats] = useState<SupportEscalationStats | null>(null);
  const [incidentStats, setIncidentStats] = useState<IncidentStats | null>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    stage: 'all',
    geography: 'all',
    organization: 'all'
  });
  const [isCheckingEula, setIsCheckingEula] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/account/login');
    }
  }, [isAuthenticated, loading, router]);

  // Check if user is admin
  useEffect(() => {
    if (!loading && isAuthenticated && user && !user.isConnectGoStaff) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, user, router]);

  // Check EULA status once user is authenticated and loaded
  useEffect(() => {
    const performEulaCheck = async () => {
      if (isAuthenticated && user?.isConnectGoStaff && !loading) {
        setIsCheckingEula(true);
        try {
          const canProceed = await checkEulaAndRedirect();
          if (!canProceed) {
            return;
          }
        } catch (error) {
          console.error('EULA check error:', error);
        } finally {
          setIsCheckingEula(false);
        }
      } else if (!loading && isAuthenticated) {
        setIsCheckingEula(false);
      }
    };

    performEulaCheck();
  }, [isAuthenticated, user, loading]); 

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          overviewData, 
          organizationsData, 
          escalatedReviewsData,
          pulseData,
          workload,
          support,
          incidents
        ] = await Promise.all([
          getDashboardOverview(),
          getOrganizationsSummary(selectedFilters.stage !== 'all' ? { stage: selectedFilters.stage } : {}),
          getEscalatedReviews({ page: 1, limit: 10 }),
          getPulseSurveyStats(),
          getWorkloadSummary(),
          getSupportEscalationStats(),
          getIncidentStats()
        ]);

        setOverview(overviewData);
        setOrganizations(organizationsData);
        setEscalatedReviews(escalatedReviewsData.data || []);
        setPulseSurveyStats(pulseData);
        setWorkloadData(workload);
        setSupportStats(support);
        setIncidentStats(incidents);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedFilters.stage, refreshTrigger]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_review':
        return <Timer className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'onboarding':
        return 'text-purple-600 bg-purple-100';
      case 'design':
        return 'text-blue-600 bg-blue-100';
      case 'measure':
        return 'text-green-600 bg-green-100';
      case 'learn':
        return 'text-orange-600 bg-orange-100';
      case 'tell':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCapacityColor = (status: 'green' | 'orange' | 'red') => {
    switch (status) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSatisfactionEmoji = (percentage: number) => {
    if (percentage >= 80) return <Smile className="h-5 w-5 text-green-600" />;
    if (percentage >= 60) return <Meh className="h-5 w-5 text-yellow-600" />;
    return <Frown className="h-5 w-5 text-red-600" />;
  };

  // Navigation handlers
  const handleOrganizationClick = (organizationId: string) => {
    router.push(`/admin/dashboard/organization/${organizationId}`);
  };

  const handleReviewsClick = () => {
    router.push('/admin/dashboard/review');
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const filteredOrganizations = organizations.filter(org => {
    if (selectedFilters.stage !== 'all' && org.stage !== selectedFilters.stage) return false;
    if (selectedFilters.geography !== 'all' && org.country !== selectedFilters.geography) return false;
    return true;
  });

  if (loading || (isCheckingEula && isAuthenticated)) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Failed to load dashboard</h1>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show EULA warning if status indicates signature is required
  if (eulaStatus?.requiresSignature) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-grey-600 mb-2">
              Admin Access - Terms Required
            </h3>
            <p className="text-grey-500 text-sm">
              As a ConnectGo staff member, you need to sign the Terms & Conditions to access the admin dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/terms')}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-stratosphere-500 hover:bg-stratosphere-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stratosphere-500"
            >
              <FileText className="h-5 w-5 mr-2" />
              Review & Sign Terms
            </button>
            
            <button
              onClick={() => router.push('/account/login')}
              className="w-full flex justify-center py-2 px-4 border border-grey-300 rounded-md text-grey-700 bg-white hover:bg-grey-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grey-500"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-sky-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of all organizations and pending reviews</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>

          {/* ← add this */}
          <NotificationBell />

          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/dashboard/')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Client Dashboard
          </button>
        </div>
      </div>

      {/* EULA Status Indicator */}
      {eulaStatus && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <p className="text-green-800 font-medium">Terms & Conditions Signed</p>
              <p className="text-green-700 text-sm">
                Admin access granted - Version {eulaStatus.currentVersion}
                {eulaStatus.latestSignature && (
                  <span> signed on {new Date(eulaStatus.latestSignature.signedAt).toLocaleDateString()}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/admin/dashboard/organizations')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Organizations</dt>
                <dd className="text-2xl font-semibold text-gray-900">{overview?.summary?.totalOrganizations || 0}</dd>
              </dl>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/admin/dashboard/projects')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderOpen className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Projects</dt>
                <dd className="text-2xl font-semibold text-gray-900">{overview?.summary?.totalProjects || 0}</dd>
              </dl>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pulse Survey Responses</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {pulseSurveyStats?.totalResponses || 0}
                </dd>
                <dd className="text-xs text-gray-500 mt-1">
                  {pulseSurveyStats?.satisfactionPercentage || 0}% satisfaction
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">No. of Incidents</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {incidentStats?.totalIncidents || 0}
                </dd>
                <dd className="text-xs text-gray-500 mt-1">
                  {incidentStats?.openIncidents || 0} open
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Workload Management */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Workload Management</h3>
            <p className="text-sm text-gray-500 mt-1">
              Account Manager capacity and active assignments
            </p>
          </div>
          {workloadData && (
            <div className={`px-4 py-2 rounded-lg border-2 font-medium ${getCapacityColor(workloadData.capacityStatus)}`}>
              Capacity: {workloadData.capacityPercentage}%
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {workloadData?.activeProjects || 0}
            </div>
            <div className="text-sm text-gray-500">Active Projects</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {workloadData?.activeSites || 0}
            </div>
            <div className="text-sm text-gray-500">Active Sites</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {workloadData?.totalItems || 0}
            </div>
            <div className="text-sm text-gray-500">Total Workload</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {workloadData?.completedItems || 0}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">5</div>
            <div className="text-sm text-gray-500">Optimum Capacity</div>
          </div>
        </div>

        {/* Traffic Light Indicator */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">0-5 (Optimal)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">6-7 (Near Capacity)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">8+ (Over Capacity)</span>
              </div>
            </div>
            <button 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => router.push('/admin/dashboard/workload')}
            >
              View Details →
            </button>
          </div>
        </div>

        {/* Stage Breakdown */}
        {workloadData && workloadData.itemsByStage && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">By Stage</h4>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(workloadData.itemsByStage).map(([stage, count]) => (
                <div key={stage} className="text-center">
                  <div className={`px-2 py-1 rounded text-sm font-medium ${getStageColor(stage)}`}>
                    {count}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 capitalize">{stage}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Support/Escalation Types */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Support & Escalation Types</h3>
            <p className="text-sm text-gray-500">Client support requests and satisfaction metrics</p>
          </div>
          {supportStats && (
            <div className="flex items-center space-x-2">
              {getSatisfactionEmoji(supportStats.overallSatisfaction)}
              <span className="text-lg font-semibold text-gray-900">
                {supportStats.overallSatisfaction}%
              </span>
              <span className="text-sm text-gray-500">Satisfaction</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {supportStats?.chatbotQuestions || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Chatbot Questions</div>
            <div className="text-xs text-gray-500 mt-2">Auto-support requests</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {supportStats?.clientIncidents || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Needs your Response</div>
            <div className="text-xs text-gray-500 mt-2">Escalated issues</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {supportStats?.satisfactionSurveys || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Pulse Surveys</div>
            <div className="text-xs text-gray-500 mt-2">
              {pulseSurveyStats?.satisfactionPercentage || 0}% positive
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Organizations Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Organizations Portfolio</h3>
                <div className="flex space-x-2">
                  <select 
                    className="text-sm border-gray-300 rounded-md"
                    value={selectedFilters.stage}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, stage: e.target.value }))}
                  >
                    <option value="all">All Stages</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="design">Design</option>
                    <option value="measure">Measure</option>
                    <option value="learn">Learn</option>
                    <option value="tell">Tell</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredOrganizations.map((org) => (
                <div 
                  key={org._id} 
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleOrganizationClick(org._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-900">{org.name}</h4>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          org.status === 'active' ? 'bg-green-100 text-green-800' :
                          org.status === 'onboarding' ? 'bg-yellow-100 text-yellow-800' :
                          org.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {org.status}
                        </span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(org.stage)}`}>
                          {org.stage}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {org.city}, {org.country} • {org.projectCount} projects • {org.siteCount} sites
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-2">Progress:</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${org.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">{org.progress}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Escalated Review Queue */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Escalated Reviews</h3>
              <p className="text-sm text-gray-500">Reviews requiring Account Manager attention</p>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {escalatedReviews.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p className="text-sm">No escalated reviews</p>
                  <p className="text-xs mt-1">All reviews are being handled normally</p>
                </div>
              ) : (
                escalatedReviews.slice(0, 10).map((item) => (
                  <div 
                    key={item._id} 
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={handleReviewsClick}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.organizationId.name} • {item.projectId.name}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        
                        {item.escalatedAt && (
                          <p className="text-xs text-red-600 mt-1">
                            Escalated: {new Date(item.escalatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 mt-1" />
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {escalatedReviews.length > 0 && (
              <div className="px-6 py-3 bg-gray-50">
                <button 
                  onClick={handleReviewsClick}
                  className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Escalated Reviews →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-500">Latest updates across all organizations</p>
        </div>
        
        <div className="p-6">
          {overview?.recentActivity && overview.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {overview.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.organization} • {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      activity.status === 'active' ? 'bg-green-100 text-green-800' :
                      activity.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;