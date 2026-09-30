// app/(dashboard)/dashboard/project/[projectId]/review/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ReviewList from '@/components/reviews/ReviewList';
import { getReviewStatistics } from '@/lib/api/reviews';
import { getProject } from '@/lib/api/project';
import { Project, ReviewStatistics, ReviewModule, ReviewStatus, ReviewDueBucket, ReviewFilters as ReviewFiltersType } from '@/types';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { REVIEW_MODULE_ORDER, REVIEW_MODULE_LABELS } from '@/lib/utils/reviewModules';
import { DUE_BUCKET_LABELS } from '@/lib/utils/reviewDueBucket';
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Topbar } from '@/components/shared/Topbar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatGrid, StatTile } from '@/components/shared/StatTile';
import { ApprovalSteps, ApprovalStep, BarGrid, Bar } from '@/components/shared/Lists';
import { EmptyState } from '@/components/shared/EmptyState';
import { RowHead } from '@/components/shared/PageLayout';
import { cn } from '@/lib/utils';

interface ProjectReviewsPageProps {
    id: string;
}

interface ModuleStats {
  module: string;
  count: number;
}

type StatusTab = 'all' | 'pending' | 'approved' | 'overdue';

export default function ProjectReviewsPage({ params }: {params: ProjectReviewsPageProps}) {
  const { id: projectId } = params;
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ReviewStatistics | null>(null);
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [activeModule, setActiveModule] = useState<ReviewModule | null>(null);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [activeDueBucket, setActiveDueBucket] = useState<ReviewDueBucket | null>(null);

  // Fetch project and statistics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch project to get organization ID
        const projectResponse = await getProject(projectId);
        if (projectResponse.success && projectResponse.data) {
          setProject(projectResponse.data);

          // Get organization ID from project
          const orgId = typeof projectResponse.data.organization === 'string'
            ? projectResponse.data.organization
            : projectResponse.data.organization._id;

          // Fetch review statistics
          const statsResponse = await getReviewStatistics(orgId);
          if (statsResponse.success && statsResponse.data) {
            const { statistics } = statsResponse.data;
            setStats(statistics);

            // Calculate module stats from byModule data, ordered to match the
            // sequence modules are actually completed in a project's workflow.
            if (statistics.byModule) {
              const modules: ModuleStats[] = REVIEW_MODULE_ORDER.map((module) => ({
                module,
                count: (statistics.byModule[module] as number) || 0,
              }));
              setModuleStats(modules.filter(m => m.count > 0)); // Only show modules with reviews
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Get module display name
  const getModuleDisplayName = (module: string): string => {
    return REVIEW_MODULE_LABELS[module as ReviewModule] || module;
  };

  const handleModuleClick = (module: ReviewModule) => {
    setActiveModule((prev) => (prev === module ? null : module));
    setActiveTab('all');
    setActiveDueBucket(null);
    setTimeout(() => {
      document.getElementById('review-list')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleDueBucketClick = (bucket: ReviewDueBucket) => {
    setActiveDueBucket((prev) => (prev === bucket ? null : bucket));
    setActiveTab('all');
    setActiveModule(null);
    setTimeout(() => {
      document.getElementById('review-list')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const listFilters: Partial<ReviewFiltersType> = {
    ...(activeModule ? { module: activeModule } : {}),
    ...(activeDueBucket ? { dueBucket: activeDueBucket } : {}),
    ...(activeTab === 'pending' ? { status: 'pending' as ReviewStatus } : {}),
    ...(activeTab === 'approved' ? { status: 'approved' as ReviewStatus } : {}),
    ...(activeTab === 'overdue' ? { isOverdue: true } : {}),
  };

  const listKey = `${activeModule ?? 'all'}-${activeDueBucket ?? 'any'}-${activeTab}`;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        <ProjectSidebar
          projectId={projectId}
          projectName="Loading..."
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-c4c-petrol animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-c4c-grey-bg">
      <ProjectSidebar
        projectId={projectId}
        projectName={project?.name || 'Project'}
      />

      <div className="flex-1 min-w-0">
        <Topbar motif="blue">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-c4c-grey-bg">
              <ClipboardCheck className="text-c4c-petrol" size={20} />
            </span>
            <div>
              <h1 className="font-title text-[clamp(26px,3.2vw,34px)] font-semibold text-black">
                Reviews — {project?.name || 'Project'}
              </h1>
              <p className="mt-1.5 text-[14.5px] text-c4c-ink/80">
                Track and manage all approval reviews for this project
              </p>
            </div>
          </div>
        </Topbar>

        <div className="p-8 flex flex-col gap-6">
      {/* Guidance panel */}
      <Card className="p-5">
        <span className="font-title text-[10px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">How approvals work</span>
        <ApprovalSteps>
          <ApprovalStep number={1} title="Submit for review" description="Complete a module task — a review is created automatically and enters pending approval." />
          <ApprovalStep number={2} title="Seek input or escalate" description="Ask colleagues for feedback, or contact your account manager if you need guidance." />
          <ApprovalStep number={3} title="Approve" description="Once satisfied, mark the review approved. Approved reviews are locked and archived." />
        </ApprovalSteps>
      </Card>

      {/* Empty State - No Reviews Yet */}
      {stats?.totalReviews === 0 && (
        <div className="border border-c4c-rule bg-white">
          <EmptyState
            icon={<ClipboardCheck />}
            title="No Reviews Yet"
            description="Reviews are automatically created when you complete tasks in modules like Project Setup, Stakeholder Mapping, and others."
          />
          <div className="mx-auto mb-8 max-w-2xl bg-c4c-grey-bg p-4 text-left">
            <h4 className="font-semibold text-black mb-2">Reviews are auto-created when you:</h4>
            <ul className="text-sm text-c4c-petrol space-y-1">
              <li>• Complete tasks in Project Setup or Site Setup</li>
              <li>• Create or complete Stakeholder Actions</li>
              <li>• Add Social Impact documents</li>
              <li>• Complete a ToC Consultation Plan</li>
              <li>• Publish Surveys or add Survey Questions</li>
            </ul>
          </div>
        </div>
      )}

      {/* Statistics Cards - Only show if there are reviews */}
      {stats && stats.totalReviews > 0 && (
        <>
          <StatGrid>
            <StatTile label="Total Reviews" value={stats.totalReviews} caption="Across all modules" icon={<TrendingUp />} />
            <StatTile
              label="Pending"
              value={stats.byStatus?.pending || 0}
              caption="Waiting on approval"
              icon={<Clock />}
              variant={(stats.byStatus?.pending || 0) > 0 ? 'attention' : 'default'}
            />
            <StatTile
              label="Approved"
              value={stats.byStatus?.approved || 0}
              caption="Locked and archived"
              icon={<CheckCircle />}
              variant={(stats.byStatus?.approved || 0) > 0 ? 'done' : 'default'}
            />
            <StatTile
              label="Overdue"
              value={stats.overdueCount || 0}
              caption="Past their deadline"
              icon={<AlertTriangle />}
              variant={(stats.overdueCount || 0) > 0 ? 'attention' : 'default'}
            />
          </StatGrid>

          {/* Module Breakdown */}
          {moduleStats.length > 0 && (
            <Card className="p-6">
              <h2 className="font-title text-[17px] font-semibold tracking-[-0.015em] text-black mb-4">
                Reviews by Module
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moduleStats.map((module) => {
                  const isActive = activeModule === module.module;
                  return (
                    <button
                      key={module.module}
                      onClick={() => handleModuleClick(module.module as ReviewModule)}
                      className={cn(
                        'flex items-center justify-between gap-4 border bg-c4c-grey-bg px-5 py-[18px] text-left transition-colors',
                        isActive ? 'border-c4c-petrol' : 'border-c4c-rule hover:border-c4c-petrol'
                      )}
                    >
                      <div>
                        <div className="font-title text-[15px] font-semibold tracking-[-0.015em] text-black">
                          {getModuleDisplayName(module.module)}
                        </div>
                        <div className="mt-1.5 text-[12.5px] text-c4c-petrol">
                          {isActive ? 'Filtering active — click to clear' : 'Click to filter reviews'}
                        </div>
                      </div>
                      <span className="font-title text-2xl font-semibold tracking-[-0.03em] text-black">
                        {module.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Due Date Breakdown */}
          {stats.byDueBucket && (
            <Card className="p-6">
              <h2 className="font-title text-[17px] font-semibold tracking-[-0.015em] text-black mb-4">
                Reviews by Due Date
              </h2>

              <BarGrid minWidth={140}>
                {([
                  { key: 'overdue', label: 'Overdue', attention: true },
                  { key: 'due_today', label: 'Due Today', attention: false },
                  { key: 'due_this_week', label: 'Due This Week', attention: false },
                  { key: 'due_later', label: 'Due Later', attention: false },
                  { key: 'no_deadline', label: 'No Deadline', attention: false },
                ] as { key: ReviewDueBucket; label: string; attention: boolean }[]).map((bucket) => {
                  const isActive = activeDueBucket === bucket.key;
                  const value = stats.byDueBucket[bucket.key] || 0;
                  return (
                    <button
                      key={bucket.key}
                      onClick={() => handleDueBucketClick(bucket.key)}
                      className={isActive ? 'shadow-[inset_0_0_0_2px_var(--c4c-petrol)]' : undefined}
                    >
                      <Bar value={value} caption={bucket.label} attention={bucket.attention && value > 0} />
                    </button>
                  );
                })}
              </BarGrid>
            </Card>
          )}

          {/* Issue Quality */}
          {(stats.openIssuesCount !== undefined || stats.criticalOpenIssuesCount !== undefined) && (
            <Card className="p-6">
              <h2 className="font-title text-[17px] font-semibold tracking-[-0.015em] text-black mb-4">
                Issue Quality
              </h2>

              <BarGrid minWidth={200}>
                <Bar value={stats.openIssuesCount || 0} caption="Open Issues" attention={(stats.openIssuesCount || 0) > 0} />
                <Bar value={stats.criticalOpenIssuesCount || 0} caption="Critical Open" attention={(stats.criticalOpenIssuesCount || 0) > 0} />
                <Bar value={`${stats.issuesResolutionRate ?? 0}%`} caption="Resolution Rate" />
              </BarGrid>
            </Card>
          )}

          {/* Average Resolution Time */}
          {stats.averageResolutionTime && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-c4c-petrol" />
                <h3 className="font-title text-[17px] font-semibold tracking-[-0.015em] text-black">
                  Average Resolution Time
                </h3>
              </div>
              <p className="font-title text-2xl font-semibold text-black">
                {Math.floor(stats.averageResolutionTime / 60)} hours {stats.averageResolutionTime % 60} minutes
              </p>
            </Card>
          )}

          {/* Quick filter tabs + Review List */}
          <div id="review-list">
            {/* Tabs row */}
            <Tabs
              value={activeModule ? '' : activeTab}
              onValueChange={(v) => { setActiveTab(v as StatusTab); setActiveModule(null); setActiveDueBucket(null); }}
              className="mb-4"
            >
              <TabsList>
                {([
                  { id: 'all', label: 'All Reviews', count: stats?.totalReviews },
                  { id: 'pending', label: 'Pending Approval', count: (stats?.byStatus?.pending || 0) + (stats?.byStatus?.in_review || 0) },
                  { id: 'approved', label: 'Approved', count: stats?.byStatus?.approved },
                  { id: 'overdue', label: 'Overdue', count: stats?.overdueCount },
                ] as { id: StatusTab; label: string; count?: number }[]).map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="ml-1.5 bg-c4c-grey-bg px-[7px] py-0.5 text-[10.5px] text-c4c-ink/80">
                        {tab.count}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Active module badge */}
            {activeModule && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-c4c-petrol">Filtered by module:</span>
                <Badge variant="quiet">
                  {getModuleDisplayName(activeModule)}
                  <button onClick={() => setActiveModule(null)} className="ml-1 text-c4c-petrol hover:text-black">×</button>
                </Badge>
              </div>
            )}

            {/* Active due date badge */}
            {activeDueBucket && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-c4c-petrol">Filtered by due date:</span>
                <Badge variant="quiet">
                  {DUE_BUCKET_LABELS[activeDueBucket]}
                  <button onClick={() => setActiveDueBucket(null)} className="ml-1 text-c4c-petrol hover:text-black">×</button>
                </Badge>
              </div>
            )}

            <ReviewList
              key={listKey}
              projectId={projectId}
              showFilters={true}
              initialFilters={listFilters}
            />
          </div>
        </>
      )}

        </div>
      </div>
    </div>
  );
}
