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
        return <Clock className="h-4 w-4 text-c4c-yellow" />;
      case 'in_review':
        return <Timer className="h-4 w-4 text-c4c-cobalt" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-c4c-sage" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-c4c-burgundy" />;
      default:
        return <Clock className="h-4 w-4 text-c4c-petrol" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'critical':
        return 'bg-destructive text-destructive-foreground border-transparent';
      case 'medium':
        return 'bg-c4c-tint-gold text-black border-transparent';
      case 'low':
        return 'bg-c4c-tint-sage text-black border-transparent';
      default:
        return 'bg-c4c-grey-bg text-black border-transparent';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'onboarding':
        return 'text-black bg-c4c-tint-gold';
      case 'design':
        return 'text-c4c-petrol bg-c4c-tint-cyan';
      case 'measure':
        return 'text-c4c-sage bg-c4c-tint-sage';
      case 'learn':
        return 'text-c4c-petrol bg-c4c-grey-bg';
      case 'tell':
        return 'text-c4c-petrol bg-c4c-tint-cyan';
      default:
        return 'text-c4c-petrol bg-c4c-grey-bg';
    }
  };

  const getCapacityColor = (status: 'green' | 'orange' | 'red') => {
    switch (status) {
      case 'green':
        return 'bg-c4c-tint-sage text-black border-c4c-sage';
      case 'orange':
        return 'bg-c4c-tint-gold text-black border-c4c-yellow';
      case 'red':
        return 'bg-destructive text-destructive-foreground border-transparent';
      default:
        return 'bg-c4c-grey-bg text-black border-c4c-rule';
    }
  };

  const getSatisfactionEmoji = (percentage: number) => {
    if (percentage >= 80) return <Smile className="h-5 w-5 text-c4c-sage" />;
    if (percentage >= 60) return <Meh className="h-5 w-5 text-c4c-yellow" />;
    return <Frown className="h-5 w-5 text-c4c-burgundy" />;
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
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-c4c-grey-bg">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-c4c-petrol border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-c4c-grey-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black">Failed to load dashboard</h1>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-c4c-coral text-black rounded-md hover:bg-c4c-petrol hover:text-white"
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
      <div className="min-h-screen flex items-center justify-center bg-c4c-grey-bg p-4">
        <div className="max-w-md w-full bg-white rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-c4c-tint-gold mb-4">
              <AlertTriangle className="h-6 w-6 text-c4c-petrol" />
            </div>
            <h3 className="text-lg font-semibold text-c4c-petrol mb-2">
              Admin Access - Terms Required
            </h3>
            <p className="text-c4c-petrol text-sm">
              As a ConnectGo staff member, you need to sign the Terms & Conditions to access the admin dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/terms')}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-black bg-c4c-coral hover:bg-c4c-petrol hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-c4c-coral"
            >
              <FileText className="h-5 w-5 mr-2" />
              Review & Sign Terms
            </button>
            
            <button
              onClick={() => router.push('/account/login')}
              className="w-full flex justify-center py-2 px-4 border border-c4c-rule rounded-md text-c4c-petrol bg-white hover:bg-c4c-grey-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-c4c-cobalt"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 min-h-screen bg-c4c-grey-bg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Account Management Dashboard</h1>
          <p className="text-c4c-petrol mt-1">Overview of all organizations and pending reviews</p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-c4c-grey-bg transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={18} className="text-c4c-petrol" />
          </button>

          {/* ← add this */}
          <NotificationBell />

          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-c4c-coral hover:bg-c4c-petrol hover:text-white"
            onClick={() => router.push('/dashboard/')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Client Dashboard
          </button>
        </div>
      </div>

      {/* EULA Status Indicator */}
      {eulaStatus && (
        <div className="bg-c4c-tint-sage border border-c4c-sage rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-c4c-sage mr-3" />
            <div>
              <p className="text-black font-medium">Terms & Conditions Signed</p>
              <p className="text-c4c-petrol text-sm">
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
          className="bg-white rounded-lg shadow p-6 cursor-pointer transition-shadow"
          onClick={() => router.push('/admin/dashboard/organizations')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-c4c-petrol" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-c4c-petrol truncate">Organizations</dt>
                <dd className="text-2xl font-semibold text-black">{overview?.summary?.totalOrganizations || 0}</dd>
              </dl>
            </div>
            <ArrowRight className="h-5 w-5 text-c4c-petrol" />
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow p-6 cursor-pointer transition-shadow"
          onClick={() => router.push('/admin/dashboard/projects')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderOpen className="h-8 w-8 text-c4c-sage" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-c4c-petrol truncate">Projects</dt>
                <dd className="text-2xl font-semibold text-black">{overview?.summary?.totalProjects || 0}</dd>
              </dl>
            </div>
            <ArrowRight className="h-5 w-5 text-c4c-petrol" />
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow p-6 cursor-pointer transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-c4c-petrol" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-c4c-petrol truncate">Pulse Survey Responses</dt>
                <dd className="text-2xl font-semibold text-black">
                  {pulseSurveyStats?.totalResponses || 0}
                </dd>
                <dd className="text-xs text-c4c-petrol mt-1">
                  {pulseSurveyStats?.satisfactionPercentage || 0}% satisfaction
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow p-6 cursor-pointer transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-c4c-burgundy" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-c4c-petrol truncate">No. of Incidents</dt>
                <dd className="text-2xl font-semibold text-black">
                  {incidentStats?.totalIncidents || 0}
                </dd>
                <dd className="text-xs text-c4c-petrol mt-1">
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
            <h3 className="text-lg font-medium text-black">Workload Management</h3>
            <p className="text-sm text-c4c-petrol mt-1">
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
          <div className="text-center p-4 bg-c4c-grey-bg rounded-lg">
            <div className="text-2xl font-bold text-black">
              {workloadData?.activeProjects || 0}
            </div>
            <div className="text-sm text-c4c-petrol">Active Projects</div>
          </div>
          <div className="text-center p-4 bg-c4c-grey-bg rounded-lg">
            <div className="text-2xl font-bold text-black">
              {workloadData?.activeSites || 0}
            </div>
            <div className="text-sm text-c4c-petrol">Active Sites</div>
          </div>
          <div className="text-center p-4 bg-c4c-grey-bg rounded-lg">
            <div className="text-2xl font-bold text-black">
              {workloadData?.totalItems || 0}
            </div>
            <div className="text-sm text-c4c-petrol">Total Workload</div>
          </div>
          <div className="text-center p-4 bg-c4c-grey-bg rounded-lg">
            <div className="text-2xl font-bold text-c4c-sage">
              {workloadData?.completedItems || 0}
            </div>
            <div className="text-sm text-c4c-petrol">Completed</div>
          </div>
          <div className="text-center p-4 bg-c4c-grey-bg rounded-lg">
            <div className="text-2xl font-bold text-black">5</div>
            <div className="text-sm text-c4c-petrol">Optimum Capacity</div>
          </div>
        </div>

        {/* Traffic Light Indicator */}
        <div className="bg-c4c-grey-bg rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-c4c-sage rounded-full"></div>
                <span className="text-sm text-c4c-petrol">0-5 (Optimal)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-c4c-yellow rounded-full"></div>
                <span className="text-sm text-c4c-petrol">6-7 (Near Capacity)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-c4c-burgundy rounded-full"></div>
                <span className="text-sm text-c4c-petrol">8+ (Over Capacity)</span>
              </div>
            </div>
            <button
              className="text-sm text-c4c-petrol hover:text-black font-medium"
              onClick={() => router.push('/admin/dashboard/workload')}
            >
              View Details →
            </button>
          </div>
        </div>

        {/* Stage Breakdown */}
        {workloadData && workloadData.itemsByStage && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-c4c-petrol mb-3">By Stage</h4>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(workloadData.itemsByStage).map(([stage, count]) => (
                <div key={stage} className="text-center">
                  <div className={`px-2 py-1 rounded text-sm font-medium ${getStageColor(stage)}`}>
                    {count}
                  </div>
                  <div className="text-xs text-c4c-petrol mt-1 capitalize">{stage}</div>
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
            <h3 className="text-lg font-medium text-black">Support & Escalation Types</h3>
            <p className="text-sm text-c4c-petrol">Client support requests and satisfaction metrics</p>
          </div>
          {supportStats && (
            <div className="flex items-center space-x-2">
              {getSatisfactionEmoji(supportStats.overallSatisfaction)}
              <span className="text-lg font-semibold text-black">
                {supportStats.overallSatisfaction}%
              </span>
              <span className="text-sm text-c4c-petrol">Satisfaction</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-c4c-tint-cyan rounded-lg border border-c4c-cobalt">
            <div className="text-2xl font-bold text-c4c-cobalt">
              {supportStats?.chatbotQuestions || 0}
            </div>
            <div className="text-sm text-c4c-petrol mt-1">Chatbot Questions</div>
            <div className="text-xs text-c4c-petrol mt-2">Auto-support requests</div>
          </div>
          <div className="text-center p-4 bg-c4c-tint-coral rounded-lg border border-c4c-burgundy">
            <div className="text-2xl font-bold text-c4c-burgundy">
              {supportStats?.clientIncidents || 0}
            </div>
            <div className="text-sm text-c4c-petrol mt-1">Needs your Response</div>
            <div className="text-xs text-c4c-petrol mt-2">Escalated issues</div>
          </div>
          <div className="text-center p-4 bg-c4c-tint-sage rounded-lg border border-c4c-sage">
            <div className="text-2xl font-bold text-c4c-sage">
              {supportStats?.satisfactionSurveys || 0}
            </div>
            <div className="text-sm text-c4c-petrol mt-1">Pulse Surveys</div>
            <div className="text-xs text-c4c-petrol mt-2">
              {pulseSurveyStats?.satisfactionPercentage || 0}% positive
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Organizations Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-c4c-rule">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-black">Organizations Portfolio</h3>
                <div className="flex space-x-2">
                  <select
                    className="text-sm border-c4c-rule rounded-md"
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

            <div className="divide-y divide-c4c-rule max-h-96 overflow-y-auto">
              {filteredOrganizations.map((org) => (
                <div
                  key={org._id}
                  className="px-6 py-4 hover:bg-c4c-grey-bg cursor-pointer transition-colors"
                  onClick={() => handleOrganizationClick(org._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-black">{org.name}</h4>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          org.status === 'active' ? 'bg-c4c-tint-sage text-black' :
                          org.status === 'onboarding' ? 'bg-c4c-tint-gold text-black' :
                          org.status === 'completed' ? 'bg-c4c-tint-cyan text-c4c-cobalt' :
                          'bg-c4c-grey-bg text-black'
                        }`}>
                          {org.status}
                        </span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(org.stage)}`}>
                          {org.stage}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-c4c-petrol">
                        {org.city}, {org.country} • {org.projectCount} projects • {org.siteCount} sites
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center">
                          <span className="text-xs text-c4c-petrol mr-2">Progress:</span>
                          <div className="w-32 bg-c4c-rule rounded-full h-2">
                            <div
                              className="bg-c4c-petrol h-2 rounded-full"
                              style={{ width: `${org.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-c4c-petrol ml-2">{org.progress}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ArrowRight className="h-4 w-4 text-c4c-petrol" />
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
            <div className="px-6 py-4 border-b border-c4c-rule">
              <h3 className="text-lg font-medium text-black">Escalated Reviews</h3>
              <p className="text-sm text-c4c-petrol">Reviews requiring Account Manager attention</p>
            </div>

            <div className="divide-y divide-c4c-rule max-h-96 overflow-y-auto">
              {escalatedReviews.length === 0 ? (
                <div className="px-6 py-8 text-center text-c4c-petrol">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-c4c-sage" />
                  <p className="text-sm">No escalated reviews</p>
                  <p className="text-xs mt-1">All reviews are being handled normally</p>
                </div>
              ) : (
                escalatedReviews.slice(0, 10).map((item) => (
                  <div
                    key={item._id}
                    className="px-6 py-4 hover:bg-c4c-grey-bg cursor-pointer transition-colors"
                    onClick={handleReviewsClick}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-c4c-petrol">
                          {item.organizationId.name} • {item.projectId.name}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>

                        {item.escalatedAt && (
                          <p className="text-xs text-c4c-burgundy mt-1">
                            Escalated: {new Date(item.escalatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-c4c-petrol mt-1" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {escalatedReviews.length > 0 && (
              <div className="px-6 py-3 bg-c4c-grey-bg">
                <button
                  onClick={handleReviewsClick}
                  className="w-full text-sm text-c4c-petrol hover:text-black font-medium"
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
        <div className="px-6 py-4 border-b border-c4c-rule">
          <h3 className="text-lg font-medium text-black">Recent Activity</h3>
          <p className="text-sm text-c4c-petrol">Latest updates across all organizations</p>
        </div>

        <div className="p-6">
          {overview?.recentActivity && overview.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {overview.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-c4c-sage rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black">
                      {activity.title}
                    </p>
                    <p className="text-xs text-c4c-petrol">
                      {activity.organization} • {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      activity.status === 'active' ? 'bg-c4c-tint-sage text-black' :
                      activity.status === 'planning' ? 'bg-c4c-tint-gold text-black' :
                      activity.status === 'completed' ? 'bg-c4c-tint-cyan text-c4c-cobalt' :
                      'bg-c4c-grey-bg text-black'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-c4c-petrol">
              <Activity className="h-12 w-12 mx-auto mb-3 text-c4c-petrol" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;