// components/reviews/ReviewStatistics.tsx
'use client';

import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  TrendingUp,
  Activity,
  BarChart3,
  Loader2
} from 'lucide-react';
import { ReviewStatistics as ReviewStatsType } from '@/types/review.types';

interface ReviewStatisticsProps {
  statistics: ReviewStatsType | null;
  loading?: boolean;
}

const ReviewStatistics = ({ statistics, loading = false }: ReviewStatisticsProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-c4c-petrol" />
        <span className="ml-3 text-c4c-petrol">Loading statistics...</span>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <Activity size={48} className="mx-auto text-c4c-petrol mb-3" />
        <p className="text-c4c-petrol">No statistics available</p>
      </div>
    );
  }

  const stats = statistics.overview;

  // Calculate completion rate
  const completionRate = stats.total > 0 
    ? Math.round((stats.staffApproved / stats.total) * 100) 
    : 0;

  // Calculate in-progress count
  const inProgress = stats.managerReview + stats.staffReview;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-c4c-grey-bg border border-c4c-rule rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-c4c-petrol">Total Reviews</span>
            <BarChart3 className="text-c4c-petrol" size={20} />
          </div>
          <p className="text-3xl font-bold text-black">
            {stats.total}
          </p>
          <p className="text-xs text-c4c-petrol mt-1">
            All project reviews
          </p>
        </div>

        {/* Pending */}
        <div className="bg-c4c-tint-gold border border-c4c-yellow rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-black">Pending</span>
            <Clock className="text-black" size={20} />
          </div>
          <p className="text-3xl font-bold text-black">
            {stats.pending}
          </p>
          <p className="text-xs text-black mt-1">
            Awaiting review
          </p>
        </div>

        {/* In Progress */}
        <div className="bg-c4c-tint-cyan border border-c4c-cobalt rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-c4c-cobalt">In Review</span>
            <Activity className="text-c4c-cobalt" size={20} />
          </div>
          <p className="text-3xl font-bold text-c4c-cobalt">
            {inProgress}
          </p>
          <p className="text-xs text-c4c-cobalt mt-1">
            Being reviewed
          </p>
        </div>

        {/* Approved */}
        <div className="bg-c4c-tint-sage border border-c4c-sage rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-black">Approved</span>
            <CheckCircle className="text-black" size={20} />
          </div>
          <p className="text-3xl font-bold text-black">
            {stats.staffApproved}
          </p>
          <p className="text-xs text-black mt-1">
            Fully approved
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manager Review Stage */}
        <div className="bg-white border border-c4c-rule rounded-lg p-4">
          <h3 className="text-lg font-medium text-black mb-4 flex items-center">
            <span className="w-8 h-8 rounded-full bg-c4c-petrol text-white flex items-center justify-center text-sm mr-3">
              1
            </span>
            Manager Review Stage
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-c4c-rule">
              <span className="text-sm text-c4c-petrol">In Manager Review</span>
              <span className="font-semibold text-black">{stats.managerReview}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-c4c-rule">
              <span className="text-sm text-c4c-sage">Manager Approved</span>
              <span className="font-semibold text-c4c-sage">{stats.managerApproved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-c4c-burgundy">Manager Rejected</span>
              <span className="font-semibold text-c4c-burgundy">{stats.managerRejected}</span>
            </div>
          </div>
        </div>

        {/* Staff Review Stage */}
        <div className="bg-white border border-c4c-rule rounded-lg p-4">
          <h3 className="text-lg font-medium text-black mb-4 flex items-center">
            <span className="w-8 h-8 rounded-full bg-c4c-petrol text-white flex items-center justify-center text-sm mr-3">
              2
            </span>
            Staff Review Stage
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-c4c-rule">
              <span className="text-sm text-c4c-petrol">In Staff Review</span>
              <span className="font-semibold text-black">{stats.staffReview}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-c4c-rule">
              <span className="text-sm text-c4c-sage">Staff Approved</span>
              <span className="font-semibold text-c4c-sage">{stats.staffApproved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-c4c-burgundy">Staff Rejected</span>
              <span className="font-semibold text-c4c-burgundy">{stats.staffRejected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white border border-c4c-rule rounded-lg p-4">
        <h3 className="text-lg font-medium text-black mb-4">Overall Progress</h3>

        <div className="space-y-4">
          {/* Completion Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-c4c-petrol">Completion Rate</span>
              <span className="text-sm font-semibold text-black">{completionRate}%</span>
            </div>
            <div className="w-full bg-c4c-grey-bg rounded-full h-3">
              <div
                className="bg-c4c-sage h-3 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Average Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-c4c-petrol">Average Progress</span>
              <span className="text-sm font-semibold text-black">
                {Math.round(stats.avgProgress)}%
              </span>
            </div>
            <div className="w-full bg-c4c-grey-bg rounded-full h-3">
              <div
                className="bg-c4c-petrol h-3 rounded-full transition-all"
                style={{ width: `${Math.round(stats.avgProgress)}%` }}
              />
            </div>
          </div>

          {/* Other Statuses */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-c4c-rule">
            <div className="flex justify-between items-center">
              <span className="text-xs text-c4c-petrol">On Hold</span>
              <span className="text-sm font-semibold text-black">{stats.onHold}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-c4c-petrol">Cancelled</span>
              <span className="text-sm font-semibold text-c4c-petrol">{stats.cancelled}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Priority & Phase Breakdown */}
      {(statistics.byPriority.length > 0 || statistics.byPhase.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Priority */}
          {statistics.byPriority.length > 0 && (
            <div className="bg-white border border-c4c-rule rounded-lg p-4">
              <h3 className="text-lg font-medium text-black mb-4">By Priority</h3>
              <div className="space-y-2">
                {statistics.byPriority.map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${
                        item._id === 'critical' ? 'bg-c4c-burgundy' :
                        item._id === 'high' ? 'bg-c4c-yellow' :
                        item._id === 'medium' ? 'bg-c4c-yellow' :
                        'bg-c4c-sage'
                      }`} />
                      <span className="text-sm text-c4c-petrol capitalize">{item._id}</span>
                    </div>
                    <span className="font-semibold text-black">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By Phase */}
          {statistics.byPhase.length > 0 && (
            <div className="bg-white border border-c4c-rule rounded-lg p-4">
              <h3 className="text-lg font-medium text-black mb-4">By Phase</h3>
              <div className="space-y-2">
                {statistics.byPhase.map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <span className="text-sm text-c4c-petrol capitalize">{item._id}</span>
                    <span className="font-semibold text-black">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overdue Warning */}
      {statistics.overdueCount > 0 && (
        <div className="bg-c4c-tint-coral border border-c4c-burgundy rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-c4c-burgundy flex-shrink-0 mr-3 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-black mb-1">
                {statistics.overdueCount} Overdue Review{statistics.overdueCount > 1 ? 's' : ''}
              </h4>
              <p className="text-xs text-c4c-petrol">
                These reviews have passed their due date and require immediate attention.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewStatistics;