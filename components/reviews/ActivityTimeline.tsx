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
    if (action.includes('status') && action.includes('approved')) return 'text-black bg-c4c-tint-sage';
    if (action.includes('escalate')) return 'text-c4c-burgundy bg-c4c-tint-coral';
    if (action.includes('issue') && !action.includes('resolved')) return 'text-c4c-burgundy bg-c4c-tint-coral';
    if (action.includes('resolved')) return 'text-black bg-c4c-tint-sage';
    return 'text-c4c-petrol bg-c4c-grey-bg';
  };

  const activities = review.activityLog || [];

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-c4c-rule rounded-lg">
        <Clock className="w-12 h-12 text-c4c-petrol mx-auto mb-3" />
        <p className="text-sm text-c4c-petrol">
          No activity recorded yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-c4c-rule rounded-lg p-6">
      <h3 className="text-lg font-semibold text-black mb-6">
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
                <div className="w-0.5 h-full bg-c4c-rule mt-2" />
              )}
            </div>

            {/* Activity Content */}
            <div className="flex-1 pb-6">
              {/* Activity Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">
                    {activity.action}
                  </p>
                  {activity.details && (
                    <p className="text-sm text-c4c-petrol mt-1">
                      {activity.details}
                    </p>
                  )}
                </div>
              </div>

              {/* Value Changes */}
              {(activity.fromValue || activity.toValue) && (
                <div className="flex items-center gap-2 text-xs bg-c4c-grey-bg px-3 py-2 rounded mt-2">
                  {activity.fromValue && (
                    <>
                      <span className="text-c4c-petrol font-mono">
                        {activity.fromValue}
                      </span>
                      <ArrowRight className="w-3 h-3 text-c4c-petrol" />
                    </>
                  )}
                  {activity.toValue && (
                    <span className="text-black font-mono font-medium">
                      {activity.toValue}
                    </span>
                  )}
                </div>
              )}

              {/* Activity Footer */}
              <div className="flex items-center gap-3 text-xs text-c4c-petrol mt-2">
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