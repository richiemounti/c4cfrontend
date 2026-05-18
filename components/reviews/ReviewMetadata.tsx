// components/reviews/ReviewMetadata.tsx
'use client';

import React from 'react';
import { Review } from '@/types';
import { 
  Calendar,
  Clock,
  User,
  Tag,
  Paperclip,
  FileText,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

interface ReviewMetadataProps {
  review: Review;
}

export const ReviewMetadata: React.FC<ReviewMetadataProps> = ({ review }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* General Information */}
      <div className="bg-white border border-concrete-500 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-stratosphere-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-500" />
          General Information
        </h3>

        <div className="space-y-4">
          {/* Review ID */}
          <div>
            <label className="text-xs text-concrete-900 uppercase font-medium">
              Review ID
            </label>
            <p className="text-xs text-stratosphere-900 mt-1 font-mono bg-concrete-50 px-2 py-1 rounded">
              {review._id}
            </p>
          </div>

          {/* Created Date */}
          <div>
            <label className="text-xs text-concrete-900 uppercase font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Created Date
            </label>
            <p className="text-sm text-stratosphere-900 mt-1">
              {format(new Date(review.createdAt), 'PPpp')}
            </p>
          </div>

          {/* Last Updated */}
          <div>
            <label className="text-xs text-concrete-900 uppercase font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last Updated
            </label>
            <p className="text-sm text-stratosphere-900 mt-1">
              {format(new Date(review.updatedAt), 'PPpp')}
            </p>
          </div>

          {/* Due Date */}
          {review.dueDate && (
            <div>
              <label className="text-xs text-concrete-900 uppercase font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Due Date
              </label>
              <p className={`text-sm mt-1 ${review.isOverdue ? 'text-clay-900 font-medium' : 'text-stratosphere-900'}`}>
                {format(new Date(review.dueDate), 'PPpp')}
                {review.isOverdue && (
                  <span className="ml-2 px-2 py-0.5 bg-clay-50 text-clay-900 text-xs rounded">
                    OVERDUE
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Review Duration */}
          {review.reviewDuration && (
            <div>
              <label className="text-xs text-concrete-900 uppercase font-medium">
                Review Duration
              </label>
              <p className="text-sm text-stratosphere-900 mt-1">
                {Math.floor(review.reviewDuration / 60)} hours {review.reviewDuration % 60} minutes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tags and Attachments */}
      <div className="bg-white border border-concrete-500 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-stratosphere-900 mb-4">
          Additional Details
        </h3>

        <div className="space-y-4">
          {/* Tags */}
          <div>
            <label className="text-xs text-concrete-900 uppercase font-medium flex items-center gap-1 mb-2">
              <Tag className="w-3 h-3" />
              Tags ({review.tags?.length || 0})
            </label>
            {review.tags && review.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {review.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-sky-50 text-sky-500 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-concrete-900">No tags</p>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="text-xs text-concrete-900 uppercase font-medium flex items-center gap-1 mb-2">
              <Paperclip className="w-3 h-3" />
              Attachments ({review.attachments?.length || 0})
            </label>
            {review.attachments && review.attachments.length > 0 ? (
              <div className="space-y-2">
                {review.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-concrete-50 rounded border border-concrete-500"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <FileText className="w-4 h-4 text-concrete-900" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stratosphere-900 truncate">
                          {attachment.filename}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-concrete-900">
                          <User className="w-3 h-3" />
                          <span>{attachment.uploadedBy.name}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(attachment.uploadedAt), 'PP')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-sky-500 hover:bg-sky-50 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-concrete-900">No attachments</p>
            )}
          </div>

          {/* Chat Participants */}
          {review.chatParticipants && review.chatParticipants.length > 0 && (
            <div>
              <label className="text-xs text-concrete-900 uppercase font-medium mb-2 block">
                Chat Participants ({review.chatParticipants.length})
              </label>
              <div className="space-y-2">
                {review.chatParticipants.map((participant, index) => (
                  <div key={typeof participant === 'object' ? participant._id : participant} className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-concrete-900" />
                    {typeof participant === 'object' ? (
                      <>
                        <span className="text-stratosphere-900">{participant.name}</span>
                        <span className="text-xs text-concrete-900">({participant.email})</span>
                      </>
                    ) : (
                      <span className="text-stratosphere-900">{participant}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stream Chat Status */}
          {review.streamChannelCreated && (
            <div className="p-3 bg-sky-50 border border-sky-100 rounded">
              <p className="text-xs text-sky-500 font-medium mb-1">
                Stream Chat Enabled
              </p>
              <p className="text-xs text-concrete-900">
                Channel ID: <span className="font-mono">{review.streamChannelId}</span>
              </p>
              {review.streamChannelCreatedAt && (
                <p className="text-xs text-concrete-900 mt-1">
                  Created: {format(new Date(review.streamChannelCreatedAt), 'PP')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resolution Information (if resolved) */}
      {review.status === 'resolved' && review.resolvedBy && (
        <div className="bg-grass-50 border border-grass-100 rounded-lg p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-grass-900 mb-4">
            Resolution Information
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-grass-900 uppercase font-medium">
                Resolved By
              </label>
              <p className="text-sm text-stratosphere-900 mt-1">
                {review.resolvedBy.name} ({review.resolvedBy.email})
              </p>
            </div>

            <div>
              <label className="text-xs text-grass-900 uppercase font-medium">
                Resolved At
              </label>
              <p className="text-sm text-stratosphere-900 mt-1">
                {format(new Date(review.resolvedAt!), 'PPpp')}
              </p>
            </div>

            {review.resolutionNotes && (
              <div>
                <label className="text-xs text-grass-900 uppercase font-medium">
                  Resolution Notes
                </label>
                <p className="text-sm text-stratosphere-900 mt-1">
                  {review.resolutionNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewMetadata;