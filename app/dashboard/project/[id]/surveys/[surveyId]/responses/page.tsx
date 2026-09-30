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
  AlertTriangle,
  FlaskConical
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
  isTestResponse?: boolean;

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
  color = "neutral",
  gradient = false 
}: any) => {
  const colorClasses = {
    neutral: {
      bg: 'from-c4c-petrol to-black',
      icon: 'bg-c4c-rule text-c4c-petrol',
      text: 'text-c4c-petrol',
      border: 'border-c4c-petrol/20'
    },
    petrol: {
      bg: 'from-c4c-petrol to-c4c-sage',
      icon: 'bg-c4c-tint-cyan text-c4c-petrol',
      text: 'text-c4c-petrol',
      border: 'border-c4c-petrol/20'
    },
    gold: {
      // Coral/gold adjacency is a banned pairing, so this gradient stays
      // gold-to-petrol rather than gold-to-coral.
      bg: 'from-c4c-yellow to-c4c-petrol',
      icon: 'bg-c4c-tint-gold text-c4c-petrol',
      text: 'text-c4c-petrol',
      border: 'border-c4c-yellow/20'
    },
    sage: {
      bg: 'from-c4c-sage to-c4c-petrol',
      icon: 'bg-c4c-tint-sage text-c4c-petrol',
      text: 'text-c4c-petrol',
      border: 'border-c4c-sage/20'
    },
    coral: {
      bg: 'from-c4c-burgundy to-c4c-petrol',
      icon: 'bg-c4c-tint-coral text-c4c-burgundy',
      text: 'text-c4c-burgundy',
      border: 'border-c4c-burgundy/20'
    }
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`bg-white border-2 ${colors.border} overflow-hidden`}>
        {gradient && (
          <div className={`h-1.5 bg-gradient-to-r ${colors.bg}`} />
        )}
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-c4c-petrol mb-2">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-black">{value}</h3>
                {trend && (
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    trend === 'up' ? 'text-c4c-petrol' :
                    trend === 'down' ? 'text-c4c-yellow' :
                    'text-c4c-petrol'
                  }`}>
                    {trend === 'up' && <ArrowUpRight className="h-4 w-4" />}
                    {trend === 'down' && <ArrowDownRight className="h-4 w-4" />}
                    {trend === 'neutral' && <Minus className="h-4 w-4" />}
                    {trendValue}
                  </div>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-c4c-petrol mt-2">{subtitle}</p>
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
      
      const params: Record<string, any> = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter === 'test') {
        params.isTestResponse = true;
      } else if (statusFilter === 'live') {
        params.isTestResponse = false;
      } else if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

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
      const response = await surveyApi.getSurveyStatistics(surveyId);

      if (response && response.data) {
        setStatistics(response.data);
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
      const csvData = await surveyApi.exportSurveyResponses(surveyId, 'csv');

      const blob = new Blob([csvData], { type: 'text/csv' });
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
      case 'completed': return <CheckCircle className="h-4 w-4 text-c4c-sage" />;
      case 'in_progress': return <PauseCircle className="h-4 w-4 text-c4c-yellow" />;
      case 'abandoned': return <XCircle className="h-4 w-4 text-c4c-petrol" />;
      default: return <PlayCircle className="h-4 w-4 text-c4c-petrol" />;
    }
  };

  // Repeating status badges map to petrol/gold/sage per real semantic
  // meaning (done=sage, pending/attention=gold) rather than coral, which is
  // reserved for a single spotlight CTA per screen.
  const getStatusVariant = (status: string): 'done' | 'attention' | 'quiet' | 'phase' => {
    switch (status) {
      case 'completed': return 'done';
      case 'in_progress': return 'attention';
      case 'abandoned': return 'quiet';
      default: return 'phase';
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

  // Enhanced chart data preparation
  const pieChartData = statistics ? [
    { name: 'Completed', value: statistics.responsesByStatus?.completed || 0, color: '#00415a' },
    { name: 'In Progress', value: statistics.responsesByStatus?.in_progress || 0, color: '#f7dc88' },
    { name: 'Abandoned', value: statistics.responsesByStatus?.abandoned || 0, color: '#b9cdc5' },
    { name: 'Started', value: statistics.responsesByStatus?.started || 0, color: '#79d4dd' }
  ].filter(item => item.value > 0) : [];

  const lineChartData = statistics?.responsesPerDay?.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    responses: day.count,
    completed: Math.floor(day.count * (statistics.completionRate / 100))
  })) || [];

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

  // Completion funnel data
  const completedCount = statistics?.responsesByStatus?.completed || 0;
  const inProgressCount = statistics?.responsesByStatus?.in_progress || 0;
  const funnelData = statistics ? [
    { stage: 'Started', count: statistics.totalResponses, percentage: 100 },
    { stage: 'In Progress', count: inProgressCount, percentage: statistics.totalResponses > 0 ? Math.round((inProgressCount / statistics.totalResponses) * 100) : 0 },
    { stage: 'Completed', count: completedCount, percentage: Math.round(statistics.completionRate) }
  ] : [];

  if (surveyLoading || loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-c4c-grey-bg via-c4c-grey-bg/30 to-c4c-tint-sage/20">
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
              className="w-20 h-20 border-4 border-c4c-petrol border-t-transparent rounded-full mx-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-black mb-2">Loading Analytics</h2>
            <p className="text-c4c-petrol">Preparing your response data...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (surveyError || error || !survey) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-c4c-grey-bg via-c4c-grey-bg/30 to-c4c-tint-sage/20">
        <ProjectSidebar
          projectId={projectId}
          projectName="Project"
        />
        <div className="flex-1 flex justify-center items-center p-6">
          <Card className="w-full max-w-md border-c4c-burgundy/30">
            <CardContent className="text-center p-10">
              <AlertCircle className="h-20 w-20 text-c4c-burgundy mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-black mb-3">Unable to Load Analytics</h2>
              <p className="text-c4c-petrol mb-6">{surveyError || error || 'Survey not found'}</p>
              <Link href={`/dashboard/project/${projectId}/surveys`}>
                <Button className="bg-c4c-petrol text-white">
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
    <div className="flex min-h-screen bg-gradient-to-br from-c4c-grey-bg via-c4c-grey-bg/30 to-c4c-tint-sage/20">
      {/* Sidebar */}
      <ProjectSidebar
        projectId={projectId}
        projectName={typeof survey.project === 'object' ? survey.project?.name : 'Project'}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Enhanced Header */}
        <div className="bg-white/95 backdrop-blur-md px-8 py-6 border-b border-c4c-rule sticky top-0 z-10">
          <Link
            href={`/dashboard/project/${projectId}/surveys/${surveyId}`}
            className="flex items-center text-c4c-petrol hover:text-black mb-4 font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Survey Details
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Response Analytics</h1>
              <p className="text-c4c-petrol flex items-center gap-2">
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
                className="border-2 border-c4c-petrol/30 text-c4c-petrol hover:bg-c4c-grey-bg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-gradient-to-r from-c4c-petrol to-c4c-sage text-white"
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
            <Card className="bg-c4c-tint-gold border-c4c-yellow/30">
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
                color="neutral"
                gradient
              />
              
              <StatCard
                title="Completion Rate"
                value={`${Math.round(statistics.completionRate)}%`}
                subtitle={`${dropOffRate.toFixed(1)}% drop-off rate`}
                icon={Target}
                trend={statistics.completionRate > 70 ? 'up' : statistics.completionRate > 40 ? 'neutral' : 'down'}
                trendValue={`${statistics.completionRate > 70 ? 'Excellent' : statistics.completionRate > 40 ? 'Good' : 'Needs improvement'}`}
                color="petrol"
                gradient
              />
              
              <StatCard
                title="Avg. Time"
                value={statistics.timeStatistics?.averageTimeSeconds ? formatDuration(statistics.timeStatistics.averageTimeSeconds) : 'N/A'}
                subtitle="Average completion time"
                icon={Timer}
                color="gold"
                gradient
              />
              
              <StatCard
                title="In Progress"
                value={statistics.responsesByStatus?.in_progress || 0}
                subtitle={`${statistics.responsesByStatus?.abandoned || 0} abandoned`}
                icon={Clock}
                color="sage"
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
              <Card className="bg-c4c-grey-bg border-2 border-c4c-petrol/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <Percent className="h-6 w-6 text-c4c-petrol" />
                    </div>
                    <Badge className="bg-c4c-rule text-c4c-petrol border-c4c-petrol/30">
                      Engagement
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">
                    {avgProgressPercentage}%
                  </h3>
                  <p className="text-sm text-c4c-petrol">Average Progress</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-c4c-tint-sage to-c4c-tint-cyan border-2 border-c4c-petrol/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <Award className="h-6 w-6 text-c4c-petrol" />
                    </div>
                    <Badge className="bg-c4c-tint-cyan text-c4c-petrol border-c4c-petrol/30">
                      Quality
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">
                    {statistics.responsesByStatus?.completed || 0}
                  </h3>
                  <p className="text-sm text-c4c-petrol">Complete Responses</p>
                </CardContent>
              </Card>

              {/* Coral/burgundy is never placed adjacent to a gold tint, so
                  this card's container is flat grey instead of a
                  coral-to-gold gradient. */}
              <Card className="bg-c4c-grey-bg border-2 border-c4c-yellow/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <Zap className="h-6 w-6 text-c4c-yellow" />
                    </div>
                    <Badge className="bg-c4c-tint-gold text-c4c-petrol border-c4c-yellow/30">
                      Activity
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">
                    {statistics.responsesByStatus?.in_progress || 0}
                  </h3>
                  <p className="text-sm text-c4c-petrol">Active Sessions</p>
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
              <Card className="bg-white border-2 border-c4c-petrol/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-c4c-tint-cyan rounded-xl">
                        <FileCheck className="h-6 w-6 text-c4c-petrol" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-black">
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
                        className="border-c4c-petrol/30 text-c4c-petrol hover:bg-c4c-grey-bg"
                      >
                        Manage Consent
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Consent Form Info */}
                    <div className="p-4 bg-c4c-grey-bg rounded-lg border border-c4c-rule">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-black mb-1">
                            {typeof survey.consentForm === 'object' && survey.consentForm?.name
                              ? survey.consentForm.name
                              : 'Consent Form Attached'}
                          </h4>
                          {typeof survey.consentForm === 'object' && survey.consentForm?.description && (
                            <p className="text-sm text-c4c-petrol line-clamp-2 mb-2">
                              {survey.consentForm.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-c4c-petrol">
                            {typeof survey.consentForm === 'object' && survey.consentForm?.version && (
                              <span className="flex items-center gap-1">
                                <FileCheck className="h-3 w-3" />
                                Version {survey.consentForm.version}
                              </span>
                            )}
                            <Badge variant={survey.consentRequired ? 'attention' : 'quiet'}>
                              {survey.consentRequired ? 'Required' : 'Optional'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Consent Statistics */}
                    {statistics && statistics.totalResponses > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-c4c-tint-sage to-c4c-tint-cyan rounded-lg border border-c4c-petrol/20">
                          <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="h-5 w-5 text-c4c-petrol" />
                            <span className="text-sm font-medium text-c4c-petrol">Consent Given</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-black">
                              {statistics.consentStatistics?.consentGivenCount || 0}
                            </span>
                            <span className="text-sm text-c4c-petrol">
                              ({statistics.consentStatistics?.consentGivenPercentage || 0}%)
                            </span>
                          </div>
                        </div>

                        {/* Flat grey container, not a gold/coral tint
                            gradient — that adjacency is banned. */}
                        <div className="p-4 bg-c4c-grey-bg rounded-lg border border-c4c-yellow/20">
                          <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="h-5 w-5 text-c4c-yellow" />
                            <span className="text-sm font-medium text-c4c-petrol">Consent Declined</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-black">
                              {statistics.consentStatistics?.consentDeclinedCount || 0}
                            </span>
                            <span className="text-sm text-c4c-petrol">
                              ({statistics.consentStatistics?.consentDeclinedPercentage || 0}%)
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-c4c-grey-bg rounded-lg border border-c4c-petrol/20">
                          <div className="flex items-center gap-3 mb-2">
                            <Clock className="h-5 w-5 text-c4c-petrol" />
                            <span className="text-sm font-medium text-c4c-petrol">Pending</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-black">
                              {statistics.consentStatistics?.consentPendingCount || 0}
                            </span>
                            <span className="text-sm text-c4c-petrol">
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
            <TabsList className="bg-white border-2 border-c4c-rule p-1.5">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-c4c-petrol data-[state=active]:to-c4c-sage data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-c4c-petrol data-[state=active]:to-black data-[state=active]:text-white"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              {/* Gold-to-coral would be a banned adjacency, so this active
                  state stays gold-to-petrol. */}
              <TabsTrigger
                value="responses"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-c4c-yellow data-[state=active]:to-c4c-petrol data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Responses
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Debug: Show what data we have */}
              <Card className="bg-c4c-tint-cyan border-c4c-petrol/30">
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
                  <Card className="bg-white border-2 border-c4c-rule">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
                        <PieChart className="h-6 w-6 text-c4c-petrol" />
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
                              fill="#00415a"
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
                            <PieChart className="h-12 w-12 text-c4c-petrol mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-c4c-petrol">No response data available</p>
                            <p className="text-xs text-c4c-petrol mt-2">Check console for data structure</p>
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
                  <Card className="bg-white border-2 border-c4c-rule">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
                        <Target className="h-6 w-6 text-c4c-petrol" />
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
                                <span className="text-sm font-semibold text-black">
                                  {stage.stage}
                                </span>
                                <span className="text-sm font-bold text-c4c-petrol">
                                  {stage.count} ({stage.percentage}%)
                                </span>
                              </div>
                              <div className="relative h-12 bg-c4c-grey-bg rounded-xl overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${stage.percentage}%` }}
                                  transition={{ duration: 1, delay: index * 0.2 }}
                                  className={`h-full rounded-xl ${
                                    index === 0 ? 'bg-gradient-to-r from-c4c-petrol to-black' :
                                    index === 1 ? 'bg-gradient-to-r from-c4c-yellow to-c4c-petrol' :
                                    'bg-gradient-to-r from-c4c-petrol to-c4c-sage'
                                  }`}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center">
                          <Target className="h-12 w-12 text-c4c-petrol mx-auto mb-3 opacity-50" />
                          <p className="text-sm text-c4c-petrol">No funnel data available</p>
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
                  <Card className="bg-white border-2 border-c4c-rule">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-c4c-petrol" />
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
                                <stop offset="5%" stopColor="#79d4dd" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#79d4dd" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00415a" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#00415a" stopOpacity={0}/>
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
                              stroke="#79d4dd"
                              fillOpacity={1}
                              fill="url(#colorResponses)"
                              strokeWidth={3}
                            />
                            <Area
                              type="monotone"
                              dataKey="completed"
                              stroke="#00415a"
                              fillOpacity={1}
                              fill="url(#colorCompleted)"
                              strokeWidth={3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <TrendingUp className="h-12 w-12 text-c4c-petrol mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-c4c-petrol">No timeline data available</p>
                            <p className="text-xs text-c4c-petrol mt-2">responsesPerDay: {statistics?.responsesPerDay?.length || 0} items</p>
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
                  <Card className="bg-white border-2 border-c4c-rule">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-black flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-c4c-sage" />
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
                              fill="#79d4dd"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <CalendarDays className="h-12 w-12 text-c4c-petrol mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-c4c-petrol">No weekly data available</p>
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
              <Card className="bg-white border-2 border-c4c-rule">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-bold text-black">
                        Individual Responses
                      </CardTitle>
                      <CardDescription>
                        Detailed view of all survey responses
                      </CardDescription>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-c4c-petrol" />
                        <Input
                          placeholder="Search by respondent..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-2 border-c4c-rule focus:border-c4c-cobalt"
                        />
                      </div>

                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48 border-2 border-c4c-rule">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="started">Started</SelectItem>
                          <SelectItem value="abandoned">Abandoned</SelectItem>
                          <SelectItem value="test">Test Responses</SelectItem>
                          <SelectItem value="live">Live Responses</SelectItem>
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
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-c4c-rule rounded-full mb-6">
                        <FileText className="h-12 w-12 text-c4c-petrol" />
                      </div>
                      <h3 className="text-xl font-bold text-black mb-2">No Responses Found</h3>
                      <p className="text-c4c-petrol max-w-md mx-auto">
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
                            <TableRow className="bg-c4c-grey-bg border-b-2 border-c4c-rule">
                              <TableHead className="font-bold">Respondent</TableHead>
                              <TableHead className="font-bold">Status</TableHead>
                              <TableHead className="font-bold">Type</TableHead>
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
                                className="border-b border-c4c-rule hover:bg-c4c-grey-bg/50"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-c4c-petrol to-c4c-sage rounded-full flex items-center justify-center text-white font-bold">
                                      {(response.respondent?.name || 'Anonymous')[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-black">
                                        {response.respondent?.name || 'Anonymous'}
                                      </div>
                                      {response.respondent?.email && (
                                        <div className="text-sm text-c4c-petrol">
                                          {response.respondent.email}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(response.status)}
                                    <Badge variant={getStatusVariant(response.status)} className="capitalize">
                                      {response.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {response.isTestResponse ? (
                                    <Badge variant="attention" className="flex items-center gap-1 w-fit">
                                      <FlaskConical className="h-3 w-3" />
                                      Test
                                    </Badge>
                                  ) : (
                                    <Badge variant="done" className="flex items-center gap-1 w-fit">
                                      <CheckCircle className="h-3 w-3" />
                                      Live
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-sm text-black">
                                    <Calendar className="h-4 w-4 text-c4c-petrol" />
                                    {formatDate(response.startedAt)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-sm text-black">
                                    {response.completedAt ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 text-c4c-sage" />
                                        {formatDate(response.completedAt)}
                                      </>
                                    ) : (
                                      <span className="text-c4c-petrol">-</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-sm text-black">
                                    <Timer className="h-4 w-4 text-c4c-petrol" />
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
                                      className="h-2.5 w-20 bg-c4c-grey-bg"
                                    />
                                    <span className="text-sm font-bold text-c4c-petrol min-w-[48px]">
                                      {Math.round(response.progress || 0)}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {response.consentGiven !== undefined ? (
                                    <div className="flex items-center gap-2">
                                      {response.consentGiven ? (
                                        <>
                                          <ShieldCheck className="h-4 w-4 text-c4c-sage" />
                                          <Badge variant="done">
                                            Accepted
                                          </Badge>
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="h-4 w-4 text-c4c-yellow" />
                                          <Badge variant="attention">
                                            Declined
                                          </Badge>
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <Badge variant="quiet">
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
                                        className="hover:bg-c4c-grey-bg"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem className="cursor-pointer">
                                        <Eye className="h-4 w-4 mr-2 text-c4c-petrol" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="cursor-pointer">
                                        <Download className="h-4 w-4 mr-2 text-c4c-petrol" />
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
                          className="flex items-center justify-between mt-8 pt-6 border-t-2 border-c4c-rule"
                        >
                          <div className="text-sm text-c4c-petrol font-medium">
                            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} responses
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="border-2 border-c4c-petrol/30 text-c4c-petrol hover:bg-c4c-grey-bg disabled:opacity-30"
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
                                      ? "bg-gradient-to-r from-c4c-petrol to-c4c-sage text-white"
                                      : "border-2 border-c4c-petrol/30 text-c4c-petrol hover:bg-c4c-grey-bg"
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
                              className="border-2 border-c4c-petrol/30 text-c4c-petrol hover:bg-c4c-grey-bg disabled:opacity-30"
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