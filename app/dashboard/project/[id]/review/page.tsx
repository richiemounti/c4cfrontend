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
      <div className="flex min-h-screen bg-stratosphere-50">
        <ProjectSidebar
          projectId={projectId}
          projectName="Loading..."
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-stratosphere-50">
      <ProjectSidebar
        projectId={projectId}
        projectName={project?.name || 'Project'}
      />

      <div className="flex-1">
        <div className="space-y-6 p-8">
      {/* Page Header */}
      <div className="bg-white border border-concrete-500 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardCheck className="w-6 h-6 text-sky-500" />
          <div>
            <h1 className="text-2xl font-bold text-stratosphere">
              Reviews — {project?.name || 'Project'}
            </h1>
            <p className="text-concrete-900 text-sm mt-1">
              Track and manage all approval reviews for this project
            </p>
          </div>
        </div>
      </div>

      {/* Guidance panel */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-stratosphere mb-3">How approvals work</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-stratosphere text-white flex items-center justify-center text-xs font-bold">1</div>
            <div>
              <p className="text-sm font-medium text-stratosphere">Submit for review</p>
              <p className="text-xs text-concrete-900 mt-0.5">Complete a module task — a review is created automatically and enters pending approval.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-stratosphere text-white flex items-center justify-center text-xs font-bold">2</div>
            <div>
              <p className="text-sm font-medium text-stratosphere">Seek input or escalate</p>
              <p className="text-xs text-concrete-900 mt-0.5">Ask colleagues for feedback, or contact your account manager if you need guidance.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-grass-500 text-white flex items-center justify-center text-xs font-bold">3</div>
            <div>
              <p className="text-sm font-medium text-stratosphere">Approve</p>
              <p className="text-xs text-concrete-900 mt-0.5">Once satisfied, mark the review approved. Approved reviews are locked and archived.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State - No Reviews Yet */}
      {stats?.totalReviews === 0 && (
        <div className="bg-white border border-concrete-500 rounded-lg p-12 text-center">
          <ClipboardCheck className="w-16 h-16 text-concrete-900 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-stratosphere-900 mb-2">No Reviews Yet</h3>
          <p className="text-concrete-900 mb-6 max-w-md mx-auto">
            Reviews are automatically created when you complete tasks in modules like Project Setup, Stakeholder Mapping, and others.
          </p>
          <div className="mt-6 p-4 bg-sky-50 rounded-lg max-w-2xl mx-auto text-left">
            <h4 className="font-semibold text-stratosphere-900 mb-2">Reviews are auto-created when you:</h4>
            <ul className="text-sm text-concrete-900 space-y-1">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Reviews */}
            <div className="bg-white border border-concrete-500 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-sky-50 rounded-lg">
                  <ClipboardCheck className="w-5 h-5 text-sky-500" />
                </div>
                <TrendingUp className="w-4 h-4 text-concrete-900" />
              </div>
              <p className="text-2xl font-bold text-stratosphere-900 mb-1">
                {stats.totalReviews}
              </p>
              <p className="text-sm text-concrete-900">Total Reviews</p>
            </div>

            {/* Pending Reviews */}
            <div className="bg-white border border-concrete-500 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-ochre-50 rounded-lg">
                  <Clock className="w-5 h-5 text-ochre-900" />
                </div>
              </div>
              <p className="text-2xl font-bold text-stratosphere-900 mb-1">
                {stats.byStatus?.pending || 0}
              </p>
              <p className="text-sm text-concrete-900">Pending</p>
            </div>

            {/* Approved Reviews */}
            <div className="bg-white border border-concrete-500 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-grass-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-grass-900" />
                </div>
              </div>
              <p className="text-2xl font-bold text-stratosphere-900 mb-1">
                {stats.byStatus?.approved || 0}
              </p>
              <p className="text-sm text-concrete-900">Approved</p>
            </div>

            {/* Overdue Reviews */}
            <div className="bg-white border border-concrete-500 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-clay-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-clay-900" />
                </div>
              </div>
              <p className="text-2xl font-bold text-stratosphere-900 mb-1">
                {stats.overdueCount || 0}
              </p>
              <p className="text-sm text-concrete-900">Overdue</p>
            </div>
          </div>

          {/* Module Breakdown */}
          {moduleStats.length > 0 && (
            <div className="bg-white border border-concrete-500 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-stratosphere-900 mb-4">
                Reviews by Module
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moduleStats.map((module) => {
                  const isActive = activeModule === module.module;
                  return (
                    <button
                      key={module.module}
                      onClick={() => handleModuleClick(module.module as ReviewModule)}
                      className={`text-left p-4 border rounded-lg transition-colors group ${
                        isActive
                          ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500'
                          : 'border-concrete-500 hover:bg-concrete-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium transition-colors ${isActive ? 'text-stratosphere' : 'text-stratosphere-900 group-hover:text-sky-500'}`}>
                          {getModuleDisplayName(module.module)}
                        </h3>
                        <span className={`text-2xl font-bold ${isActive ? 'text-stratosphere' : 'text-sky-500'}`}>
                          {module.count}
                        </span>
                      </div>
                      <p className="text-xs text-concrete-900 mt-2">
                        {isActive ? 'Filtering active — click to clear' : 'Click to filter reviews'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Due Date Breakdown */}
          {stats.byDueBucket && (
            <div className="bg-white border border-concrete-500 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-stratosphere-900 mb-4">
                Reviews by Due Date
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {([
                  { key: 'overdue', label: 'Overdue', bg: 'bg-clay-50', border: 'border-clay-100', text: 'text-clay-900' },
                  { key: 'due_today', label: 'Due Today', bg: 'bg-sand-50', border: 'border-sand-100', text: 'text-sand-900' },
                  { key: 'due_this_week', label: 'Due This Week', bg: 'bg-ochre-50', border: 'border-ochre-100', text: 'text-ochre-900' },
                  { key: 'due_later', label: 'Due Later', bg: 'bg-grass-50', border: 'border-grass-100', text: 'text-grass-900' },
                  { key: 'no_deadline', label: 'No Deadline', bg: 'bg-concrete-50', border: 'border-concrete-500', text: 'text-concrete-900' },
                ] as { key: ReviewDueBucket; label: string; bg: string; border: string; text: string }[]).map((bucket) => {
                  const isActive = activeDueBucket === bucket.key;
                  return (
                    <button
                      key={bucket.key}
                      onClick={() => handleDueBucketClick(bucket.key)}
                      className={`text-center p-4 border rounded-lg transition-colors ${bucket.bg} ${
                        isActive ? 'ring-2 ring-sky-500 border-sky-500' : bucket.border
                      }`}
                    >
                      <p className={`text-2xl font-bold mb-1 ${bucket.text}`}>
                        {stats.byDueBucket[bucket.key] || 0}
                      </p>
                      <p className="text-sm text-concrete-900">{bucket.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Issue Quality */}
          {(stats.openIssuesCount !== undefined || stats.criticalOpenIssuesCount !== undefined) && (
            <div className="bg-white border border-concrete-500 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-stratosphere-900 mb-4">
                Issue Quality
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-sand-50 border border-sand-100 rounded-lg">
                  <p className="text-2xl font-bold text-sand-900 mb-1">
                    {stats.openIssuesCount || 0}
                  </p>
                  <p className="text-sm text-concrete-900">Open Issues</p>
                </div>

                <div className="text-center p-4 bg-clay-50 border border-clay-100 rounded-lg">
                  <p className="text-2xl font-bold text-clay-900 mb-1">
                    {stats.criticalOpenIssuesCount || 0}
                  </p>
                  <p className="text-sm text-concrete-900">Critical Open</p>
                </div>

                <div className="text-center p-4 bg-grass-50 border border-grass-100 rounded-lg">
                  <p className="text-2xl font-bold text-grass-900 mb-1">
                    {stats.issuesResolutionRate ?? 0}%
                  </p>
                  <p className="text-sm text-concrete-900">Resolution Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* Average Resolution Time */}
          {stats.averageResolutionTime && (
            <div className="bg-white border border-concrete-500 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-sky-500" />
                <h3 className="text-lg font-semibold text-stratosphere-900">
                  Average Resolution Time
                </h3>
              </div>
              <p className="text-2xl font-bold text-stratosphere-900">
                {Math.floor(stats.averageResolutionTime / 60)} hours {stats.averageResolutionTime % 60} minutes
              </p>
            </div>
          )}

          {/* Quick filter tabs + Review List */}
          <div id="review-list">
            {/* Tabs row */}
            <div className="flex items-center gap-1 mb-4 bg-white border border-concrete-500 rounded-lg p-1">
              {([
                { id: 'all', label: 'All Reviews', count: stats?.totalReviews },
                { id: 'pending', label: 'Pending Approval', count: (stats?.byStatus?.pending || 0) + (stats?.byStatus?.in_review || 0) },
                { id: 'approved', label: 'Approved', count: stats?.byStatus?.approved },
                { id: 'overdue', label: 'Overdue', count: stats?.overdueCount },
              ] as { id: StatusTab; label: string; count?: number }[]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setActiveModule(null); setActiveDueBucket(null); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id && !activeModule
                      ? 'bg-stratosphere text-white'
                      : 'text-concrete-900 hover:bg-sky-50 hover:text-stratosphere'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                      activeTab === tab.id && !activeModule
                        ? 'bg-white/20 text-white'
                        : 'bg-concrete-100 text-concrete-900'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Active module badge */}
            {activeModule && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-concrete-900">Filtered by module:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 border border-sky-200 rounded-full text-xs font-medium text-stratosphere">
                  {getModuleDisplayName(activeModule)}
                  <button onClick={() => setActiveModule(null)} className="ml-1 text-concrete-900 hover:text-stratosphere">×</button>
                </span>
              </div>
            )}

            {/* Active due date badge */}
            {activeDueBucket && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-concrete-900">Filtered by due date:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 border border-sky-200 rounded-full text-xs font-medium text-stratosphere">
                  {DUE_BUCKET_LABELS[activeDueBucket]}
                  <button onClick={() => setActiveDueBucket(null)} className="ml-1 text-concrete-900 hover:text-stratosphere">×</button>
                </span>
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
