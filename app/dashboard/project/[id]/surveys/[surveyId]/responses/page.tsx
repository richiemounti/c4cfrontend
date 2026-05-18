// app/dashboard/project/[id]/surveys/[surveyId]/responses/page.tsx - FINAL FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  Eye,
  MoreVertical,
  RefreshCw,
  PlayCircle,
  Target,
  Zap,
  TrendingDown,
  AlertCircle,
  Award,
  Percent,
  MousePointer,
  Timer,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileCheck,
  ShieldCheck,
  AlertTriangle 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { useSurvey } from '@/hooks/useSurvey';
import * as surveyApi from '@/lib/api/survey';
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';

interface PageParams {
  id: string;
  surveyId: string;
}

interface SurveyResponse {
  _id: string;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  respondent?: {
    name: string;
    email: string;
  };
  startedAt: string;
  completedAt?: string;
  completionTimeMs?: number;
  progress: number;
  ipAddress?: string;
  answers?: any[];

  // ADD THESE CONSENT FIELDS
  consentGiven?: boolean;
  consentFormVersion?: string;
  consentTimestamp?: string;
  consentFormSnapshot?: {
    _id: string;
    name: string;
    description: string;
    version: string;
  };
}

import { SurveyStatistics } from '@/types';

// Enhanced Statistics Card Component - NO TRANSITIONS
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  color = "sky",
  gradient = false 
}: any) => {
  const colorClasses = {
    sky: {
      bg: 'from-sky-500 to-stratosphere-500',
      icon: 'bg-sky-100 text-sky-600',
      text: 'text-sky-600',
      border: 'border-sky-500/20'
    },
    forest: {
      bg: 'from-forest-500 to-grass-500',
      icon: 'bg-forest-100 text-forest-600',
      text: 'text-forest-600',
      border: 'border-forest-500/20'
    },
    ochre: {
      bg: 'from-ochre-500 to-sand-500',
      icon: 'bg-ochre-100 text-ochre-600',
      text: 'text-ochre-600',
      border: 'border-ochre-500/20'
    },
    grass: {
      bg: 'from-grass-500 to-forest-500',
      icon: 'bg-grass-100 text-grass-600',
      text: 'text-grass-600',
      border: 'border-grass-500/20'
    },
    sand: {
      bg: 'from-sand-500 to-ochre-500',
      icon: 'bg-sand-100 text-sand-600',
      text: 'text-sand-600',
      border: 'border-sand-500/20'
    }
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.sky;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`bg-white border-2 ${colors.border} shadow-lg overflow-hidden`}>
        {gradient && (
          <div className={`h-1.5 bg-gradient-to-r ${colors.bg}`} />
        )}
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-sky-500 mb-2">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-stratosphere-900">{value}</h3>
                {trend && (
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    trend === 'up' ? 'text-forest-500' : 
                    trend === 'down' ? 'text-ochre-500' : 
                    'text-sky-500'
                  }`}>
                    {trend === 'up' && <ArrowUpRight className="h-4 w-4" />}
                    {trend === 'down' && <ArrowDownRight className="h-4 w-4" />}
                    {trend === 'neutral' && <Minus className="h-4 w-4" />}
                    {trendValue}
                  </div>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-sky-500 mt-2">{subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-xl ${colors.icon}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const SurveyResponsesPage = ({ params }: { params: PageParams }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { id: projectId, surveyId } = params;
  
  const { survey, loading: surveyLoading, error: surveyError, fetchSurvey } = useSurvey(surveyId);
  
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [statistics, setStatistics] = useState<SurveyStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (surveyId) {
      fetchSurvey();
      fetchResponses();
      fetchStatistics();
    }
  }, [surveyId, statusFilter, currentPage]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };
      
      const response = await surveyApi.getSurveyResponses(surveyId, params);
      
      if (response.success) {
        setResponses(response.data);
        setTotalCount(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / 10));
      }
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError('Failed to fetch responses');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      console.log('=== FETCHING STATISTICS ===');
      console.log('Survey ID:', surveyId);
      
      const response = await surveyApi.getSurveyStatistics(surveyId);
      
      console.log('Full Statistics API Response:', JSON.stringify(response, null, 2));
      console.log('Response.data structure:', response.data);
      console.log('responsesByStatus:', response.data?.responsesByStatus);
      console.log('responsesPerDay:', response.data?.responsesPerDay);
      console.log('timeStatistics:', response.data?.timeStatistics);
      
      if (response && response.data) {
        setStatistics(response.data);
        console.log('Statistics set successfully');
      } else {
        console.warn('No statistics data in response');
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await surveyApi.exportSurveyResponses(surveyId);
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${survey?.title || 'survey'}-responses.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Complete',
        description: 'Survey responses have been exported successfully',
      });
    } catch (err) {
      console.error('Error exporting responses:', err);
      toast({
        title: 'Export Failed',
        description: 'Failed to export survey responses',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-forest-500" />;
      case 'in_progress': return <PauseCircle className="h-4 w-4 text-ochre-500" />;
      case 'abandoned': return <XCircle className="h-4 w-4 text-concrete-500" />;
      default: return <PlayCircle className="h-4 w-4 text-sky-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-forest-50 text-forest-600 border-forest-500/30';
      case 'in_progress': return 'bg-ochre-50 text-ochre-600 border-ochre-500/30';
      case 'abandoned': return 'bg-concrete-50 text-concrete-600 border-concrete-500/30';
      default: return 'bg-sky-50 text-sky-600 border-sky-500/30';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Enhanced chart data preparation with detailed logging
  console.log('=== PREPARING CHART DATA ===');
  console.log('Statistics object:', statistics);
  
  const pieChartData = statistics ? [
    { name: 'Completed', value: statistics.responsesByStatus?.completed || 0, color: '#10B981' },
    { name: 'In Progress', value: statistics.responsesByStatus?.in_progress || 0, color: '#F59E0B' },
    { name: 'Abandoned', value: statistics.responsesByStatus?.abandoned || 0, color: '#6B7280' },
    { name: 'Started', value: statistics.responsesByStatus?.started || 0, color: '#3B82F6' }
  ].filter(item => item.value > 0) : [];
  
  console.log('Pie Chart Data:', pieChartData);

  const lineChartData = statistics?.responsesPerDay?.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    responses: day.count,
    completed: Math.floor(day.count * (statistics.completionRate / 100))
  })) || [];
  
  console.log('Line Chart Data:', lineChartData);

  // Calculate additional statistics
  const dropOffRate = statistics ? 100 - statistics.completionRate : 0;
  const avgProgressPercentage = responses.length > 0 
    ? Math.round(responses.reduce((sum, r) => sum + (r.progress || 0), 0) / responses.length)
    : 0;
  
  // Response rate by day of week
  const responsesByDayOfWeek = statistics?.responsesPerDay?.reduce((acc: any, day: any) => {
    const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
    acc[dayName] = (acc[dayName] || 0) + day.count;
    return acc;
  }, {}) || {};

  const dayOfWeekData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    responses: responsesByDayOfWeek[day] || 0
  }));
  
  console.log('Day of Week Data:', dayOfWeekData);

  // Completion funnel data
  const completedCount = statistics?.responsesByStatus?.completed || 0;
  const inProgressCount = statistics?.responsesByStatus?.in_progress || 0;
  const funnelData = statistics ? [
    { stage: 'Started', count: statistics.totalResponses, percentage: 100 },
    { stage: 'In Progress', count: inProgressCount, percentage: statistics.totalResponses > 0 ? Math.round((inProgressCount / statistics.totalResponses) * 100) : 0 },
    { stage: 'Completed', count: completedCount, percentage: Math.round(statistics.completionRate) }
  ] : [];
  
  console.log('Funnel Data:', funnelData);

  if (surveyLoading || loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-stratosphere-50 via-sky-50/30 to-grass-50/20">
        <ProjectSidebar 
          projectId={projectId}
          projectName="Loading..."
        />
        <div className="flex-1 flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-forest-500 border-t-transparent rounded-full mx-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-stratosphere-900 mb-2">Loading Analytics</h2>
            <p className="text-sky-500">Preparing your response data...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (surveyError || error || !survey) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-stratosphere-50 via-sky-50/30 to-grass-50/20">
        <ProjectSidebar 
          projectId={projectId}
          projectName="Project"
        />
        <div className="flex-1 flex justify-center items-center p-6">
          <Card className="w-full max-w-md border-ochre-500/30 shadow-2xl">
            <CardContent className="text-center p-10">
              <AlertCircle className="h-20 w-20 text-ochre-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-stratosphere-900 mb-3">Unable to Load Analytics</h2>
              <p className="text-sky-500 mb-6">{surveyError || error || 'Survey not found'}</p>
              <Link href={`/dashboard/project/${projectId}/surveys`}>
                <Button className="bg-forest-500 text-white">
                  Back to Surveys
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stratosphere-50 via-sky-50/30 to-grass-50/20">
      {/* Sidebar */}
      <ProjectSidebar 
        projectId={projectId}
        projectName={typeof survey.project === 'object' ? survey.project?.name : 'Project'}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Enhanced Header */}
        <div className="bg-white/95 backdrop-blur-md px-8 py-6 border-b border-concrete-500/20 sticky top-0 z-10 shadow-lg">
          <Link 
            href={`/dashboard/project/${projectId}/surveys/${surveyId}`}
            className="flex items-center text-sky-500 hover:text-forest-500 mb-4 font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Survey Details
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-stratosphere-900 mb-2">Response Analytics</h1>
              <p className="text-sky-500 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {survey.title}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  fetchResponses();
                  fetchStatistics();
                }}
                className="border-2 border-sky-500/30 text-sky-500 hover:bg-sky-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-gradient-to-r from-forest-500 to-grass-500 text-white shadow-lg"
              >
                {isExporting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Debug Info - REMOVE IN PRODUCTION */}
          {statistics && (
            <Card className="bg-yellow-50 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-sm">Debug: Statistics Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(statistics, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Statistics Grid */}
          {statistics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard
                title="Total Responses"
                value={statistics.totalResponses}
                subtitle={`${statistics.responsesByStatus?.completed || 0} completed`}
                icon={Activity}
                color="sky"
                gradient
              />
              
              <StatCard
                title="Completion Rate"
                value={`${Math.round(statistics.completionRate)}%`}
                subtitle={`${dropOffRate.toFixed(1)}% drop-off rate`}
                icon={Target}
                trend={statistics.completionRate > 70 ? 'up' : statistics.completionRate > 40 ? 'neutral' : 'down'}
                trendValue={`${statistics.completionRate > 70 ? 'Excellent' : statistics.completionRate > 40 ? 'Good' : 'Needs improvement'}`}
                color="forest"
                gradient
              />
              
              <StatCard
                title="Avg. Time"
                value={statistics.timeStatistics?.averageTimeSeconds ? formatDuration(statistics.timeStatistics.averageTimeSeconds) : 'N/A'}
                subtitle="Average completion time"
                icon={Timer}
                color="ochre"
                gradient
              />
              
              <StatCard
                title="In Progress"
                value={statistics.responsesByStatus?.in_progress || 0}
                subtitle={`${statistics.responsesByStatus?.abandoned || 0} abandoned`}
                icon={Clock}
                color="grass"
                gradient
              />
            </motion.div>
          )}

          {/* Additional Insights Cards */}
          {statistics && statistics.totalResponses > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="bg-gradient-to-br from-sky-50 to-stratosphere-50 border-2 border-sky-500/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <Percent className="h-6 w-6 text-sky-500" />
                    </div>
                    <Badge className="bg-sky-100 text-sky-600 border-sky-500/30">
                      Engagement
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-stratosphere-900 mb-2">
                    {avgProgressPercentage}%
                  </h3>
                  <p className="text-sm text-sky-600">Average Progress</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-grass-50 to-forest-50 border-2 border-forest-500/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <Award className="h-6 w-6 text-forest-500" />
                    </div>
                    <Badge className="bg-forest-100 text-forest-600 border-forest-500/30">
                      Quality
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-stratosphere-900 mb-2">
                    {statistics.responsesByStatus?.completed || 0}
                  </h3>
                  <p className="text-sm text-forest-600">Complete Responses</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-sand-50 to-ochre-50 border-2 border-ochre-500/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <Zap className="h-6 w-6 text-ochre-500" />
                    </div>
                    <Badge className="bg-ochre-100 text-ochre-600 border-ochre-500/30">
                      Activity
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-stratosphere-900 mb-2">
                    {statistics.responsesByStatus?.in_progress || 0}
                  </h3>
                  <p className="text-sm text-ochre-600">Active Sessions</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Consent Form Status */}
          {survey.consentForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white border-2 border-clay-500/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-clay-100 rounded-xl">
                        <FileCheck className="h-6 w-6 text-clay-500" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-stratosphere-900">
                          Consent Form Status
                        </CardTitle>
                        <CardDescription>
                          Tracking consent acceptance for this survey
                        </CardDescription>
                      </div>
                    </div>
                    <Link href={`/dashboard/project/${projectId}/surveys/${surveyId}/consent`}>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-clay-500/30 text-clay-500 hover:bg-clay-50"
                      >
                        Manage Consent
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Consent Form Info */}
                    <div className="p-4 bg-stratosphere-50 rounded-lg border border-concrete-500/20">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-stratosphere-900 mb-1">
                            {typeof survey.consentForm === 'object' && survey.consentForm?.name
                              ? survey.consentForm.name
                              : 'Consent Form Attached'}
                          </h4>
                          {typeof survey.consentForm === 'object' && survey.consentForm?.description && (
                            <p className="text-sm text-sky-500 line-clamp-2 mb-2">
                              {survey.consentForm.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-sky-500">
                            {typeof survey.consentForm === 'object' && survey.consentForm?.version && (
                              <span className="flex items-center gap-1">
                                <FileCheck className="h-3 w-3" />
                                Version {survey.consentForm.version}
                              </span>
                            )}
                            <Badge 
                              variant="outline"
                              className={survey.consentRequired 
                                ? "bg-coral-50 text-coral-500 border-coral-500/20" 
                                : "bg-sky-50 text-sky-500 border-sky-500/20"
                              }
                            >
                              {survey.consentRequired ? 'Required' : 'Optional'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Consent Statistics */}
                    {statistics && statistics.totalResponses > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-grass-50 to-forest-50 rounded-lg border border-forest-500/20">
                          <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="h-5 w-5 text-forest-500" />
                            <span className="text-sm font-medium text-sky-500">Consent Given</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-stratosphere-900">
                              {statistics.consentStatistics?.consentGivenCount || 0}
                            </span>
                            <span className="text-sm text-sky-500">
                              ({statistics.consentStatistics?.consentGivenPercentage || 0}%)
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-ochre-50 to-sand-50 rounded-lg border border-ochre-500/20">
                          <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="h-5 w-5 text-ochre-500" />
                            <span className="text-sm font-medium text-sky-500">Consent Declined</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-stratosphere-900">
                              {statistics.consentStatistics?.consentDeclinedCount || 0}
                            </span>
                            <span className="text-sm text-sky-500">
                              ({statistics.consentStatistics?.consentDeclinedPercentage || 0}%)
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-sky-50 to-stratosphere-50 rounded-lg border border-sky-500/20">
                          <div className="flex items-center gap-3 mb-2">
                            <Clock className="h-5 w-5 text-sky-500" />
                            <span className="text-sm font-medium text-sky-500">Pending</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-stratosphere-900">
                              {statistics.consentStatistics?.consentPendingCount || 0}
                            </span>
                            <span className="text-sm text-sky-500">
                              ({statistics.consentStatistics?.consentPendingPercentage || 0}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tabbed Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border-2 border-concrete-500/20 p-1.5 shadow-lg">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest-500 data-[state=active]:to-grass-500 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-stratosphere-500 data-[state=active]:text-white"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="responses"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-ochre-500 data-[state=active]:to-sand-500 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Responses
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Debug: Show what data we have */}
              <Card className="bg-blue-50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-sm">Chart Data Debug</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2">
                  <div>Pie Chart Items: {pieChartData.length}</div>
                  <div>Funnel Data Items: {funnelData.length}</div>
                  <pre>{JSON.stringify({ pieChartData, funnelData }, null, 2)}</pre>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Response Status Distribution */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="bg-white border-2 border-concrete-500/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-stratosphere-900 flex items-center gap-2">
                        <PieChart className="h-6 w-6 text-forest-500" />
                        Response Status
                      </CardTitle>
                      <CardDescription>Distribution of response statuses</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {pieChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(props: any) => {
                                const { name, percent } = props;
                                return `${name} ${(percent * 100).toFixed(0)}%`;
                              }}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <PieChart className="h-12 w-12 text-concrete-400 mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-sky-500">No response data available</p>
                            <p className="text-xs text-sky-400 mt-2">Check console for data structure</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Completion Funnel */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="bg-white border-2 border-concrete-500/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-stratosphere-900 flex items-center gap-2">
                        <Target className="h-6 w-6 text-sky-500" />
                        Completion Funnel
                      </CardTitle>
                      <CardDescription>Survey completion journey</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 flex items-center justify-center">
                      {funnelData.length > 0 ? (
                        <div className="w-full space-y-6">
                          {funnelData.map((stage, index) => (
                            <motion.div
                              key={stage.stage}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-stratosphere-900">
                                  {stage.stage}
                                </span>
                                <span className="text-sm font-bold text-forest-500">
                                  {stage.count} ({stage.percentage}%)
                                </span>
                              </div>
                              <div className="relative h-12 bg-concrete-100 rounded-xl overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${stage.percentage}%` }}
                                  transition={{ duration: 1, delay: index * 0.2 }}
                                  className={`h-full rounded-xl ${
                                    index === 0 ? 'bg-gradient-to-r from-sky-500 to-stratosphere-500' :
                                    index === 1 ? 'bg-gradient-to-r from-ochre-500 to-sand-500' :
                                    'bg-gradient-to-r from-forest-500 to-grass-500'
                                  }`}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center">
                          <Target className="h-12 w-12 text-concrete-400 mx-auto mb-3 opacity-50" />
                          <p className="text-sm text-sky-500">No funnel data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Responses Over Time */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-white border-2 border-concrete-500/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-stratosphere-900 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-sky-500" />
                        Response Trends
                      </CardTitle>
                      <CardDescription>Daily response volume and completion rate (Data points: {lineChartData.length})</CardDescription>
                    </CardHeader>
                    <CardContent className="h-96">
                      {lineChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={lineChartData}>
                            <defs>
                              <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '12px'
                              }}
                            />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="responses" 
                              stroke="#3B82F6" 
                              fillOpacity={1} 
                              fill="url(#colorResponses)"
                              strokeWidth={3}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="completed" 
                              stroke="#10B981" 
                              fillOpacity={1} 
                              fill="url(#colorCompleted)"
                              strokeWidth={3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <TrendingUp className="h-12 w-12 text-concrete-400 mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-sky-500">No timeline data available</p>
                            <p className="text-xs text-sky-400 mt-2">responsesPerDay: {statistics?.responsesPerDay?.length || 0} items</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Day of Week Analysis */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-white border-2 border-concrete-500/20 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-stratosphere-900 flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-grass-500" />
                        Response by Day of Week
                      </CardTitle>
                      <CardDescription>Which days get the most responses</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {dayOfWeekData.some(d => d.responses > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dayOfWeekData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="day" 
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                              stroke="#6b7280"
                              style={{ fontSize: '12px' }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '12px'
                              }}
                            />
                            <Bar 
                              dataKey="responses" 
                              fill="#10B981"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <CalendarDays className="h-12 w-12 text-concrete-400 mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-sky-500">No weekly data available</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Responses Tab - Keep existing code, just remove transitions from buttons */}
            <TabsContent value="responses" className="space-y-6">
              <Card className="bg-white border-2 border-concrete-500/20 shadow-xl">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-bold text-stratosphere-900">
                        Individual Responses
                      </CardTitle>
                      <CardDescription>
                        Detailed view of all survey responses
                      </CardDescription>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
                        <Input
                          placeholder="Search by respondent..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-2 border-concrete-500/30 focus:border-sky-500"
                        />
                      </div>
                      
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48 border-2 border-concrete-500/30">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="started">Started</SelectItem>
                          <SelectItem value="abandoned">Abandoned</SelectItem>
                          {survey.consentForm && (
                            <>
                              <SelectItem value="consent_given">Consent Accepted</SelectItem>
                              <SelectItem value="consent_declined">Consent Declined</SelectItem>
                              <SelectItem value="consent_pending">Consent Pending</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {responses.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-16"
                    >
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-sky-100 to-stratosphere-100 rounded-full mb-6">
                        <FileText className="h-12 w-12 text-sky-500" />
                      </div>
                      <h3 className="text-xl font-bold text-stratosphere-900 mb-2">No Responses Found</h3>
                      <p className="text-sky-500 max-w-md mx-auto">
                        {statusFilter === 'all' 
                          ? "No one has started this survey yet. Share your survey link to start collecting responses."
                          : `No responses with status "${statusFilter}". Try adjusting your filters.`
                        }
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-stratosphere-50 to-sky-50 border-b-2 border-concrete-500/20">
                              <TableHead className="font-bold">Respondent</TableHead>
                              <TableHead className="font-bold">Status</TableHead>
                              <TableHead className="font-bold">Started</TableHead>
                              <TableHead className="font-bold">Completed</TableHead>
                              <TableHead className="font-bold">Duration</TableHead>
                              <TableHead className="font-bold">Progress</TableHead>
                              <TableHead className="font-bold">Consent</TableHead>
                              <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {responses.map((response, index) => (
                              <motion.tr
                                key={response._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-concrete-500/10 hover:bg-sky-50/50"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-forest-500 to-grass-500 rounded-full flex items-center justify-center text-white font-bold">
                                      {(response.respondent?.name || 'Anonymous')[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-stratosphere-900">
                                        {response.respondent?.name || 'Anonymous'}
                                      </div>
                                      {response.respondent?.email && (
                                        <div className="text-sm text-sky-500">
                                          {response.respondent.email}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(response.status)}
                                    <Badge className={`capitalize ${getStatusBadgeColor(response.status)}`}>
                                      {response.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-sm text-stratosphere-900">
                                    <Calendar className="h-4 w-4 text-sky-500" />
                                    {formatDate(response.startedAt)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-sm text-stratosphere-900">
                                    {response.completedAt ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 text-forest-500" />
                                        {formatDate(response.completedAt)}
                                      </>
                                    ) : (
                                      <span className="text-sky-500">-</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-sm text-stratosphere-900">
                                    <Timer className="h-4 w-4 text-ochre-500" />
                                    {response.completionTimeMs ? 
                                      formatDuration(Math.round(response.completionTimeMs / 1000)) : 
                                      '-'
                                    }
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Progress 
                                      value={response.progress || 0} 
                                      className="h-2.5 w-20 bg-concrete-100" 
                                    />
                                    <span className="text-sm font-bold text-forest-500 min-w-[48px]">
                                      {Math.round(response.progress || 0)}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {response.consentGiven !== undefined ? (
                                    <div className="flex items-center gap-2">
                                      {response.consentGiven ? (
                                        <>
                                          <ShieldCheck className="h-4 w-4 text-forest-500" />
                                          <Badge className="bg-forest-50 text-forest-600 border-forest-500/30">
                                            Accepted
                                          </Badge>
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="h-4 w-4 text-ochre-500" />
                                          <Badge className="bg-ochre-50 text-ochre-600 border-ochre-500/30">
                                            Declined
                                          </Badge>
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="bg-concrete-50 text-concrete-500 border-concrete-500/30">
                                      N/A
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="hover:bg-sky-50"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem className="cursor-pointer">
                                        <Eye className="h-4 w-4 mr-2 text-sky-500" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="cursor-pointer">
                                        <Download className="h-4 w-4 mr-2 text-forest-500" />
                                        Export Individual
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </motion.tr>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Enhanced Pagination - NO TRANSITIONS */}
                      {totalPages > 1 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between mt-8 pt-6 border-t-2 border-concrete-500/20"
                        >
                          <div className="text-sm text-sky-500 font-medium">
                            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} responses
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="border-2 border-sky-500/30 text-sky-500 hover:bg-sky-50 disabled:opacity-30"
                            >
                              Previous
                            </Button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum :any;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={currentPage === pageNum 
                                      ? "bg-gradient-to-r from-forest-500 to-grass-500 text-white" 
                                      : "border-2 border-concrete-500/30 text-sky-500 hover:bg-sky-50"
                                    }
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                              className="border-2 border-sky-500/30 text-sky-500 hover:bg-sky-50 disabled:opacity-30"
                            >
                              Next
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SurveyResponsesPage;