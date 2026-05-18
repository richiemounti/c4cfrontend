// app/(dashboard)/dashboard/project/[projectId]/review/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ReviewList from '@/components/reviews/ReviewList';
import { getReviewStatistics } from '@/lib/api/reviews';
import { getProject } from '@/lib/api/project';
import { Project, ReviewStatistics } from '@/types';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface ProjectReviewsPageProps {
    id: string;
}

interface ModuleStats {
  module: string;
  count: number;
}

export default function ProjectReviewsPage({ params }: {params: ProjectReviewsPageProps}) {
  const { id: projectId } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ReviewStatistics | null>(null);
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
            
            // Calculate module stats from byModule data
            if (statistics.byModule) {
              const modules: ModuleStats[] = Object.entries(statistics.byModule).map(
                ([module, count]) => ({
                  module,
                  count: count as number,
                })
              );
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
    const names: Record<string, string> = {
      stakeholder_group: 'Stakeholder Group',
      project_setup: 'Project Setup',
      project_site_setup: 'Project Site Setup',
      stakeholder_action: 'Stakeholder Action',
      social_impact: 'Social Impact',
      toc_consultation_plan: 'ToC Consultation',
      survey: 'Survey',
      survey_question: 'Survey Question',
    };
    return names[module] || module;
  };

  // Navigate to module reviews
  const handleModuleClick = (module: string) => {
    // Scroll to ReviewList with module filter
    const reviewListElement = document.getElementById('review-list');
    if (reviewListElement) {
      reviewListElement.scrollIntoView({ behavior: 'smooth' });
    }
    // TODO: Set filter to module (you'll need to lift state or use URL params)
  };

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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6 text-sky-500" />
            <div>
              <h1 className="text-2xl font-bold text-stratosphere-900">
                Reviews - {project?.name || 'Project'}
              </h1>
              <p className="text-concrete-900 text-sm mt-1">
                Track and manage all reviews for this project
              </p>
            </div>
          </div>
          
          {/* Create Review Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Review</span>
          </button>
        </div>
      </div>

      {/* Empty State - No Reviews Yet */}
      {stats?.totalReviews === 0 && (
        <div className="bg-white border border-concrete-500 rounded-lg p-12 text-center">
          <ClipboardCheck className="w-16 h-16 text-concrete-900 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-stratosphere-900 mb-2">
            No Reviews Yet
          </h3>
          <p className="text-concrete-900 mb-6 max-w-md mx-auto">
            Reviews are automatically created when you complete tasks in modules like 
            Project Setup, Stakeholder Mapping, and others. You can also create reviews manually.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-500 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create First Review</span>
            </button>
            
            <button
              onClick={() => router.push(`/dashboard/project/${projectId}/setup`)}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-concrete-500 text-stratosphere-900 rounded-lg hover:bg-concrete-50 transition-colors"
            >
              <span>Go to Project Setup</span>
            </button>
          </div>

          <div className="mt-8 p-4 bg-sky-50 rounded-lg max-w-2xl mx-auto text-left">
            <h4 className="font-semibold text-stratosphere-900 mb-2">
              Reviews are auto-created when you:
            </h4>
            <ul className="text-sm text-concrete-900 space-y-1">
              <li>• Complete tasks in Stakeholder Mapping</li>
              <li>• Complete tasks in Project Setup</li>
              <li>• Complete tasks in Project Site Setup</li>
              <li>• Create Stakeholder Actions</li>
              <li>• Create Social Impact documents</li>
              <li>• Complete ToC Consultation Plans</li>
              <li>• Publish Surveys</li>
              <li>• Add Survey Questions</li>
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
                {moduleStats.map((module) => (
                  <button
                    key={module.module}
                    onClick={() => handleModuleClick(module.module)}
                    className="text-left p-4 border border-concrete-500 rounded-lg hover:bg-concrete-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-stratosphere-900 group-hover:text-sky-500 transition-colors">
                        {getModuleDisplayName(module.module)}
                      </h3>
                      <span className="text-2xl font-bold text-sky-500">
                        {module.count}
                      </span>
                    </div>
                    <p className="text-xs text-concrete-900 mt-2">
                      Click to view reviews
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Priority Breakdown */}
          {stats.byPriority && (
            <div className="bg-white border border-concrete-500 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-stratosphere-900 mb-4">
                Reviews by Priority
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Low Priority */}
                <div className="text-center p-4 bg-grass-50 border border-grass-100 rounded-lg">
                  <p className="text-2xl font-bold text-grass-900 mb-1">
                    {stats.byPriority.low || 0}
                  </p>
                  <p className="text-sm text-concrete-900">Low Priority</p>
                </div>

                {/* Medium Priority */}
                <div className="text-center p-4 bg-ochre-50 border border-ochre-100 rounded-lg">
                  <p className="text-2xl font-bold text-ochre-900 mb-1">
                    {stats.byPriority.medium || 0}
                  </p>
                  <p className="text-sm text-concrete-900">Medium Priority</p>
                </div>

                {/* High Priority */}
                <div className="text-center p-4 bg-sand-50 border border-sand-100 rounded-lg">
                  <p className="text-2xl font-bold text-sand-900 mb-1">
                    {stats.byPriority.high || 0}
                  </p>
                  <p className="text-sm text-concrete-900">High Priority</p>
                </div>

                {/* Critical Priority */}
                <div className="text-center p-4 bg-clay-50 border border-clay-100 rounded-lg">
                  <p className="text-2xl font-bold text-clay-900 mb-1">
                    {stats.byPriority.critical || 0}
                  </p>
                  <p className="text-sm text-concrete-900">Critical</p>
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

          {/* Review List */}
          <div id="review-list">
            <ReviewList 
              projectId={projectId}
              showFilters={true}
            />
          </div>
        </>
      )}

      {/* Create Review Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-stratosphere-900 mb-4">
              Create Review (Coming Soon)
            </h3>
            <p className="text-sm text-concrete-900 mb-4">
              Manual review creation will be available soon. For now, reviews are automatically 
              created when you complete tasks in various modules.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-500 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}