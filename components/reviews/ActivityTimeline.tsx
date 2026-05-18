// components/reviews/ActivityTimeline.tsx
'use client';

import React from 'react';
import { Review } from '@/types';
import { 
  Clock,
  User,
  ArrowRight,
  MessageSquare,
  UserPlus,
  AlertCircle,
  CheckCircle,
  ArrowUpCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityTimelineProps {
  review: Review;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ review }) => {
  // Get icon for activity type
  const getActivityIcon = (action: string) => {
    if (action.includes('status')) return <ArrowRight className="w-4 h-4" />;
    if (action.includes('escalate')) return <ArrowUpCircle className="w-4 h-4" />;
    if (action.includes('reviewer')) return <UserPlus className="w-4 h-4" />;
    if (action.includes('issue')) return <AlertCircle className="w-4 h-4" />;
    if (action.includes('resolved')) return <CheckCircle className="w-4 h-4" />;
    if (action.includes('comment')) return <MessageSquare className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  // Get color for activity type
  const getActivityColor = (action: string): string => {
    if (action.includes('status') && action.includes('approved')) return 'text-grass-900 bg-grass-50';
    if (action.includes('escalate')) return 'text-sand-900 bg-sand-50';
    if (action.includes('issue') && !action.includes('resolved')) return 'text-clay-900 bg-clay-50';
    if (action.includes('resolved')) return 'text-grass-900 bg-grass-50';
    return 'text-sky-500 bg-sky-50';
  };

  const activities = review.activityLog || [];

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-concrete-500 rounded-lg">
        <Clock className="w-12 h-12 text-concrete-900 mx-auto mb-3" />
        <p className="text-sm text-concrete-900">
          No activity recorded yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-concrete-500 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-stratosphere-900 mb-6">
        Activity Timeline
      </h3>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex gap-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full ${getActivityColor(activity.action)}`}>
                {getActivityIcon(activity.action)}
              </div>
              {index < activities.length - 1 && (
                <div className="w-0.5 h-full bg-concrete-500 mt-2" />
              )}
            </div>

            {/* Activity Content */}
            <div className="flex-1 pb-6">
              {/* Activity Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-stratosphere-900">
                    {activity.action}
                  </p>
                  {activity.details && (
                    <p className="text-sm text-concrete-900 mt-1">
                      {activity.details}
                    </p>
                  )}
                </div>
              </div>

              {/* Value Changes */}
              {(activity.fromValue || activity.toValue) && (
                <div className="flex items-center gap-2 text-xs bg-concrete-50 px-3 py-2 rounded mt-2">
                  {activity.fromValue && (
                    <>
                      <span className="text-concrete-900 font-mono">
                        {activity.fromValue}
                      </span>
                      <ArrowRight className="w-3 h-3 text-concrete-900" />
                    </>
                  )}
                  {activity.toValue && (
                    <span className="text-stratosphere-900 font-mono font-medium">
                      {activity.toValue}
                    </span>
                  )}
                </div>
              )}

              {/* Activity Footer */}
              <div className="flex items-center gap-3 text-xs text-concrete-900 mt-2">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{activity.performedBy.name}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(activity.performedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;