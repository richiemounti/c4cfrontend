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
        <Loader2 className="animate-spin h-8 w-8 text-sky" />
        <span className="ml-3 text-sky">Loading statistics...</span>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <Activity size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sky">No statistics available</p>
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
        <div className="bg-sky-tint border border-sky rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sky">Total Reviews</span>
            <BarChart3 className="text-sky" size={20} />
          </div>
          <p className="text-3xl font-bold text-stratosphere">
            {stats.total}
          </p>
          <p className="text-xs text-sky mt-1">
            All project reviews
          </p>
        </div>

        {/* Pending */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-yellow-700">Pending</span>
            <Clock className="text-yellow-700" size={20} />
          </div>
          <p className="text-3xl font-bold text-yellow-800">
            {stats.pending}
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Awaiting review
          </p>
        </div>

        {/* In Progress */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">In Review</span>
            <Activity className="text-blue-700" size={20} />
          </div>
          <p className="text-3xl font-bold text-blue-800">
            {inProgress}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Being reviewed
          </p>
        </div>

        {/* Approved */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Approved</span>
            <CheckCircle className="text-green-700" size={20} />
          </div>
          <p className="text-3xl font-bold text-green-800">
            {stats.staffApproved}
          </p>
          <p className="text-xs text-green-700 mt-1">
            Fully approved
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manager Review Stage */}
        <div className="bg-white border border-sky rounded-lg p-4">
          <h3 className="text-lg font-medium text-stratosphere mb-4 flex items-center">
            <span className="w-8 h-8 rounded-full bg-sky text-white flex items-center justify-center text-sm mr-3">
              1
            </span>
            Manager Review Stage
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-sky">In Manager Review</span>
              <span className="font-semibold text-stratosphere">{stats.managerReview}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-green-700">Manager Approved</span>
              <span className="font-semibold text-green-800">{stats.managerApproved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-700">Manager Rejected</span>
              <span className="font-semibold text-red-800">{stats.managerRejected}</span>
            </div>
          </div>
        </div>

        {/* Staff Review Stage */}
        <div className="bg-white border border-sky rounded-lg p-4">
          <h3 className="text-lg font-medium text-stratosphere mb-4 flex items-center">
            <span className="w-8 h-8 rounded-full bg-sky text-white flex items-center justify-center text-sm mr-3">
              2
            </span>
            Staff Review Stage
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-sky">In Staff Review</span>
              <span className="font-semibold text-stratosphere">{stats.staffReview}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-green-700">Staff Approved</span>
              <span className="font-semibold text-green-800">{stats.staffApproved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-700">Staff Rejected</span>
              <span className="font-semibold text-red-800">{stats.staffRejected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white border border-sky rounded-lg p-4">
        <h3 className="text-lg font-medium text-stratosphere mb-4">Overall Progress</h3>
        
        <div className="space-y-4">
          {/* Completion Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-sky">Completion Rate</span>
              <span className="text-sm font-semibold text-stratosphere">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Average Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-sky">Average Progress</span>
              <span className="text-sm font-semibold text-stratosphere">
                {Math.round(stats.avgProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-sky h-3 rounded-full transition-all" 
                style={{ width: `${Math.round(stats.avgProgress)}%` }}
              />
            </div>
          </div>

          {/* Other Statuses */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">On Hold</span>
              <span className="text-sm font-semibold text-yellow-700">{stats.onHold}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Cancelled</span>
              <span className="text-sm font-semibold text-gray-700">{stats.cancelled}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Priority & Phase Breakdown */}
      {(statistics.byPriority.length > 0 || statistics.byPhase.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Priority */}
          {statistics.byPriority.length > 0 && (
            <div className="bg-white border border-sky rounded-lg p-4">
              <h3 className="text-lg font-medium text-stratosphere mb-4">By Priority</h3>
              <div className="space-y-2">
                {statistics.byPriority.map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${
                        item._id === 'critical' ? 'bg-red-500' :
                        item._id === 'high' ? 'bg-orange-500' :
                        item._id === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                      <span className="text-sm text-sky capitalize">{item._id}</span>
                    </div>
                    <span className="font-semibold text-stratosphere">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By Phase */}
          {statistics.byPhase.length > 0 && (
            <div className="bg-white border border-sky rounded-lg p-4">
              <h3 className="text-lg font-medium text-stratosphere mb-4">By Phase</h3>
              <div className="space-y-2">
                {statistics.byPhase.map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <span className="text-sm text-sky capitalize">{item._id}</span>
                    <span className="font-semibold text-stratosphere">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overdue Warning */}
      {statistics.overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-red-600 flex-shrink-0 mr-3 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-red-800 mb-1">
                {statistics.overdueCount} Overdue Review{statistics.overdueCount > 1 ? 's' : ''}
              </h4>
              <p className="text-xs text-red-700">
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