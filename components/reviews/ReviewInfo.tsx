// components/reviews/ReviewInfo.tsx
'use client';

import React from 'react';
import { Review } from '@/types';
import { Building2, MapPin, User, Users } from 'lucide-react';
import Link from 'next/link';

interface ReviewInfoProps {
  review: Review;
}

export const ReviewInfo: React.FC<ReviewInfoProps> = ({ review }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Project Information */}
      <div className="bg-white border border-c4c-rule rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-c4c-petrol" />
          Project Information
        </h3>

        <div className="space-y-3">
          {/* Organization */}
          <div>
            <label className="text-xs text-c4c-petrol uppercase font-medium">
              Organization
            </label>
            <p className="text-sm text-black mt-1">
              {review.organizationId.name}
            </p>
          </div>

          {/* Project */}
          <div>
            <label className="text-xs text-c4c-petrol uppercase font-medium">
              Project
            </label>
            <Link
              href={`/dashboard/project/${review.projectId._id}`}
              className="text-sm text-c4c-petrol hover:text-black mt-1 block"
            >
              {review.projectId.name}
            </Link>
          </div>

          {/* Project Site */}
          {review.projectSiteId && (
            <div>
              <label className="text-xs text-c4c-petrol uppercase font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Project Site
              </label>
              <p className="text-sm text-black mt-1">
                {review.projectSiteId.name}
              </p>
            </div>
          )}

          {/* Module Item ID (for developers) */}
          <div>
            <label className="text-xs text-c4c-petrol uppercase font-medium">
              Module Item ID
            </label>
            <p className="text-xs text-c4c-petrol mt-1 font-mono bg-c4c-grey-bg px-2 py-1 rounded">
              {review.moduleItemId}
            </p>
          </div>
        </div>
      </div>

      {/* Review Team */}
      <div className="bg-white border border-c4c-rule rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-c4c-petrol" />
          Review Team
        </h3>
        
        <div className="space-y-4">
          {/* Submitted By */}
          <div>
            <label className="text-xs text-c4c-petrol uppercase font-medium">
              Submitted By
            </label>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-4 h-4 text-c4c-petrol" />
              <div>
                <p className="text-sm text-black font-medium">
                  {review.submittedBy.name}
                </p>
                <p className="text-xs text-c4c-petrol">
                  {review.submittedBy.email}
                </p>
              </div>
            </div>
          </div>

          {/* Reviewers */}
          {review.reviewers.length > 0 && (
            <div>
              <label className="text-xs text-c4c-petrol uppercase font-medium">
                Reviewers ({review.reviewers.length})
              </label>
              <div className="space-y-2 mt-2">
                {review.reviewers.map((reviewer) => (
                  <div key={reviewer._id} className="flex items-center gap-2">
                    <User className="w-4 h-4 text-c4c-petrol" />
                    <div>
                      <p className="text-sm text-black">
                        {reviewer.name}
                      </p>
                      <p className="text-xs text-c4c-petrol">
                        {reviewer.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Reviewer */}
          {review.currentReviewer && (
            <div>
              <label className="text-xs text-c4c-petrol uppercase font-medium">
                Current Reviewer
              </label>
              <div className="flex items-center gap-2 mt-1 p-2 bg-c4c-grey-bg rounded">
                <User className="w-4 h-4 text-c4c-petrol" />
                <div>
                  <p className="text-sm text-black font-medium">
                    {review.currentReviewer.name}
                  </p>
                  <p className="text-xs text-c4c-petrol">
                    {review.currentReviewer.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Escalated To (Staff) */}
          {review.escalatedTo && (
            <div>
              <label className="text-xs text-c4c-petrol uppercase font-medium">
                Escalated To (Staff)
              </label>
              <div className="flex items-center gap-2 mt-1 p-2 bg-c4c-tint-coral rounded">
                <User className="w-4 h-4 text-c4c-burgundy" />
                <div>
                  <p className="text-sm text-black font-medium">
                    {typeof review.escalatedTo === 'object' ? review.escalatedTo.name : review.escalatedTo}
                  </p>
                  <p className="text-xs text-c4c-petrol">
                    {typeof review.escalatedTo === 'object' ? review.escalatedTo.email : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewInfo;