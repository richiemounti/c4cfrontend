// app/dashboard/project/[id]/results/surveys/[surveyId]/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getProject } from '@/lib/api/project';
import * as surveyApi from '@/lib/api/survey';
import { getSurveyAnalyticsReport } from '@/lib/api/surveyAnalytics';
import { AnalyticsReportPayload, FrameworkCategory, Project } from '@/types';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import ReportHeader from '@/components/project/results/ReportHeader';
import ExecutiveSummary from '@/components/project/results/ExecutiveSummary';
import ChartSection from '@/components/project/results/ChartSection';
import ChartCard from '@/components/project/results/ChartCard';
import IndicatorSummaryTable from '@/components/project/results/IndicatorSummaryTable';
import AnalyticsSidebar, { RoundOption } from '@/components/project/results/AnalyticsSidebar';

interface PageParams {
  id: string;
  surveyId: string;
}

export default function SurveyAnalyticsDashboardPage({ params }: { params: PageParams }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { id: projectId, surveyId } = params;

  const siteId = searchParams.get('siteId');
  const siteName = searchParams.get('siteName');

  const [project, setProject] = useState<Project | null>(null);
  const [roundOptions, setRoundOptions] = useState<RoundOption[]>([]);
  const [report, setReport] = useState<AnalyticsReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(true);

  const [demographic, setDemographic] = useState<{ questionId: string; value: string } | null>(null);
  const [framework, setFramework] = useState<FrameworkCategory | undefined>(undefined);

  const abortRef = useRef<AbortController | null>(null);

  const loadShell = useCallback(async () => {
    try {
      setLoading(true);
      // Deliberately not calling the single-survey GET endpoint here — it 410s
      // for archived surveys, which would break this page for legacy surveys.
      // getSurveysByProject (includeArchived) and the analytics report itself
      // (which also doesn't filter on archived) give us everything we need.
      const [projectResponse, siblingsResponse] = await Promise.all([
        getProject(projectId),
        surveyApi.getSurveysByProject(projectId, siteId ?? 'none', { page: 1, limit: 100, includeArchived: true }),
      ]);
      setProject(projectResponse.data);

      const siblings = siblingsResponse.success ? siblingsResponse.data.surveys || [] : [];
      const currentSurvey = siblings.find((s: any) => s._id === surveyId);
      const currentTitle = currentSurvey?.title;
      const rounds: RoundOption[] = siblings
        .filter((s: any) => s.title === currentTitle)
        .sort((a: any, b: any) => a.sequenceNumber - b.sequenceNumber)
        .map((s: any) => ({ surveyId: s._id, sequenceNumber: s.sequenceNumber, label: `Round ${s.sequenceNumber} — ${s.title}` }));
      setRoundOptions(rounds);
    } catch (error) {
      console.error('Error loading survey shell:', error);
      toast({ title: 'Error', description: 'Failed to load survey', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [projectId, surveyId, siteId, toast]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
      return;
    }
    loadShell();
  }, [isAuthenticated, authLoading, loadShell, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        setReportLoading(true);
        const response = await getSurveyAnalyticsReport(
          { surveyIds: [surveyId], demographic: demographic ?? undefined, framework },
          controller.signal
        );
        setReport(response.data);
      } catch (error: any) {
        if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
          console.error('Error loading analytics report:', error);
          toast({ title: 'Error', description: 'Failed to load survey analytics', variant: 'destructive' });
        }
      } finally {
        setReportLoading(false);
      }
    })();

    return () => controller.abort();
  }, [surveyId, demographic, framework, isAuthenticated, toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-sky-tint">
        {project && <ProjectSidebar projectId={project._id} projectName={project.name} />}
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stratosphere"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-sky-tint">
      {project && <ProjectSidebar projectId={project._id} projectName={project.name} />}

      <div className="flex-1">
        <div className="bg-white px-8 py-4 border-b border-sky">
          <button
            onClick={() => {
              const query = siteId ? `?siteId=${siteId}&siteName=${encodeURIComponent(siteName || '')}` : '';
              router.push(`/dashboard/project/${projectId}/results/surveys${query}`);
            }}
            className="flex items-center text-sky-500 hover:text-stratosphere text-sm"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to survey list
          </button>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          {report && <ReportHeader meta={report.meta} siteName={siteId ? siteName || undefined : undefined} />}

          <div className="flex flex-col lg:flex-row gap-8">
            {report && (
              <AnalyticsSidebar
                demographics={report.filters.availableDemographics}
                selectedDemographic={demographic}
                onDemographicChange={setDemographic}
                frameworks={report.filters.availableFrameworks}
                selectedFramework={framework}
                onFrameworkChange={setFramework}
                roundOptions={roundOptions}
                currentSurveyId={surveyId}
              />
            )}

            <main className="flex-1 min-w-0 relative">
              {reportLoading && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-start justify-center pt-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stratosphere"></div>
                </div>
              )}

              {report && (
                <>
                  <ExecutiveSummary text={report.executiveSummaryText} indicators={report.indicatorSummary} />

                  {report.demographicOverview.length > 0 && (
                    <section className="mb-8">
                      <h2 className="text-lg font-semibold text-stratosphere mb-3 pb-2 border-b border-sky-200">Demographic Overview</h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {report.demographicOverview.map((chart) => (
                          <ChartCard key={chart.surveyQuestionId} chart={chart} />
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="space-y-8 mb-8">
                    {report.sections.map((section) => (
                      <ChartSection key={section.theme} section={section} />
                    ))}
                  </div>

                  <section>
                    <h2 className="text-lg font-semibold text-stratosphere mb-3 pb-2 border-b border-sky-200">Indicator Summary</h2>
                    <IndicatorSummaryTable indicators={report.indicatorSummary} />
                  </section>
                </>
              )}

              {!report && !reportLoading && (
                <div className="text-center py-16 text-sky-400">Failed to load survey analytics.</div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
