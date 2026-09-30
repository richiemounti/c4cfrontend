// app/dashboard/project/[id]/results/surveys/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BarChart3, Building2, MapPin, Search, FileText, ChevronRight, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getProject } from '@/lib/api/project';
import * as surveyApi from '@/lib/api/survey';
import { Project } from '@/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ProjectSidebar from '@/components/project/ProjectSidebar';

interface PageParams {
  id: string;
}

interface SurveySummary {
  _id: string;
  title: string;
  status: string;
  category: string;
  customCategoryName?: string;
  sequenceNumber: number;
  archived?: boolean;
  createdAt: string;
}

interface SurveyWithCounts extends SurveySummary {
  questionCount: number;
  responseCount: number;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-c4c-grey-bg text-c4c-petrol',
  pretest: 'bg-c4c-tint-gold text-c4c-petrol',
  published: 'bg-c4c-tint-sage text-black',
  closed: 'bg-c4c-rule text-c4c-petrol',
  archived: 'bg-c4c-grey-bg text-c4c-petrol',
};

export default function ResultsSurveysPage({ params }: { params: PageParams }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: projectId } = params;

  const siteId = searchParams.get('siteId');
  const siteName = searchParams.get('siteName');

  const [project, setProject] = useState<Project | null>(null);
  const [surveys, setSurveys] = useState<SurveyWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showLegacy, setShowLegacy] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectResponse, surveysResponse] = await Promise.all([
        getProject(projectId),
        surveyApi.getSurveysByProject(projectId, siteId ?? 'none', { page: 1, limit: 100, includeArchived: showLegacy }),
      ]);
      setProject(projectResponse.data);
      const surveysData: SurveySummary[] = surveysResponse.success ? surveysResponse.data.surveys || [] : [];

      // totalQuestions on the Survey document itself is a denormalized counter
      // that isn't reliably kept in sync — read the real counts instead.
      const withCounts = await Promise.all(
        surveysData.map(async (survey) => {
          const [questionsRes, statsRes] = await Promise.all([
            surveyApi.getSurveyQuestions(survey._id).catch(() => null),
            surveyApi.getSurveyStatistics(survey._id).catch(() => null),
          ]);
          return {
            ...survey,
            questionCount: questionsRes?.success ? questionsRes.count ?? 0 : 0,
            responseCount: statsRes?.data?.totalResponses ?? 0,
          };
        })
      );
      setSurveys(withCounts);
    } catch (error) {
      console.error('Error fetching results surveys:', error);
      toast({ title: 'Error', description: 'Failed to load surveys', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [projectId, siteId, showLegacy, toast]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, authLoading, fetchData, router]);

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        {project && <ProjectSidebar projectId={project._id} projectName={project.name} />}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c4c-coral"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-c4c-grey-bg">
      {project && <ProjectSidebar projectId={project._id} projectName={project.name} />}

      <div className="flex-1">
        <div className="bg-white px-8 py-6 border-b border-c4c-rule">
          <button
            onClick={() => router.push(`/dashboard/project/${projectId}/results`)}
            className="flex items-center text-c4c-petrol hover:text-black mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to scope selection
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-c4c-petrol/10 flex items-center justify-center">
              <BarChart3 className="text-c4c-petrol" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-medium text-black">Survey Results</h1>
              <p className="text-black/70 mt-1 flex items-center gap-1.5">
                {siteId ? <MapPin size={14} /> : <Building2 size={14} />}
                {siteId ? `Site: ${siteName || 'Selected site'}` : 'Project-level'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-c4c-petrol" />
              <Input
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pretest">Pretest</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 sm:pl-2">
              <Switch id="show-legacy" checked={showLegacy} onCheckedChange={setShowLegacy} />
              <Label htmlFor="show-legacy" className="text-sm text-black flex items-center gap-1 cursor-pointer">
                <History size={14} className="text-c4c-petrol" />
                Show legacy surveys
              </Label>
            </div>
          </div>

          {filteredSurveys.length === 0 ? (
            <div className="bg-white rounded-lg border border-c4c-rule p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-c4c-petrol" />
              <h3 className="text-lg font-medium text-black mb-1">No surveys found</h3>
              <p className="text-sm text-c4c-petrol">
                {siteId ? 'This site has no surveys yet.' : 'This project has no surveys yet.'}
                {!showLegacy && ' Older, superseded survey drafts are hidden — toggle "Show legacy surveys" to include them.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSurveys.map((survey) => (
                <Card
                  key={survey._id}
                  className="border-c4c-rule hover:border-c4c-petrol hover:shadow-md cursor-pointer transition-all"
                  onClick={() => {
                    const query = siteId ? `?siteId=${siteId}&siteName=${encodeURIComponent(siteName || '')}` : '';
                    router.push(`/dashboard/project/${projectId}/results/surveys/${survey._id}${query}`);
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base text-black leading-snug">{survey.title}</CardTitle>
                      <ChevronRight className="h-5 w-5 text-c4c-petrol shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={STATUS_COLORS[survey.status] || 'bg-c4c-grey-bg text-c4c-petrol'}>{survey.status}</Badge>
                      {survey.archived && (
                        <Badge variant="outline" className="border-c4c-yellow text-c4c-petrol flex items-center gap-1">
                          <History size={12} />
                          Legacy
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-c4c-rule text-c4c-petrol">
                        {survey.category === 'custom' ? survey.customCategoryName : survey.category}
                      </Badge>
                      {survey.sequenceNumber > 1 && (
                        <Badge variant="outline" className="border-c4c-rule text-c4c-petrol">
                          Round {survey.sequenceNumber}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-c4c-petrol mt-2">
                      {survey.questionCount} questions · {survey.responseCount} responses
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
