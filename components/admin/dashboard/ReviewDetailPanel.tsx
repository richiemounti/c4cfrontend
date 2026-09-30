import React, { useState } from 'react';
import { 
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Timer,
  MessageSquare
} from 'lucide-react';

// Define the interfaces directly in this file to avoid import issues
interface Organization {
  _id: string;
  name: string;
  country: string;
  city: string;
  creator: string;
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  startDate: Date;
  endDate?: Date;
  status: string;
  creator: string;
  organization: Organization;
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface ReviewComment {
  id: string;
  author: string;
  content: string;
  type: 'comment' | 'approval' | 'rejection' | 'request_changes';
  date: string;
}

interface ReviewItem {
  _id: string;
  entityType: 'project_setup' | 'site_setup' | 'stakeholder_mapping' | 'consultation_plan' | 'theory_of_change_stage' | 'survey' | 'report';
  entityId: string;
  title: string;
  description: string;
  organization: Organization | string;
  project: Project | string;
  site?: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  completedTasks: number;
  totalTasks: number;
  assignedTo?: User | string;
  dueDate?: string;
  isOverdue: boolean;
  lastUpdated: string;
  commentCount: number;
  comments: ReviewComment[];
}

// Review Detail Panel Component
interface ReviewDetailPanelProps {
  review: ReviewItem;
  onStatusChange: (reviewId: string, status: string) => void;
  onAddComment: (reviewId: string, comment: string, type?: 'comment' | 'approval' | 'rejection' | 'request_changes') => void;
  onClose: () => void;
}

const ReviewDetailPanel: React.FC<ReviewDetailPanelProps> = ({
  review,
  onStatusChange,
  onAddComment,
  onClose
}) => {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'approval' | 'rejection' | 'request_changes'>('comment');

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(review._id, newComment.trim(), commentType);
      setNewComment('');
    }
  };

  const getCommentIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="h-4 w-4 text-c4c-sage" />;
      case 'rejection':
        return <XCircle className="h-4 w-4 text-c4c-burgundy" />;
      case 'request_changes':
        return <AlertTriangle className="h-4 w-4 text-c4c-petrol" />;
      default:
        return <MessageSquare className="h-4 w-4 text-c4c-cobalt" />;
    }
  };

  // Helper functions to safely get string values from objects
  const getOrganizationName = (organization: Organization | string): string => {
    if (typeof organization === 'string') return organization;
    return organization?.name || 'Unknown Organization';
  };

  const getProjectName = (project: Project | string): string => {
    if (typeof project === 'string') return project;
    return project?.name || 'Unknown Project';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-c4c-rule">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-black">Review Details</h3>
          <button 
            onClick={onClose}
            className="text-c4c-petrol hover:text-c4c-petrol"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="px-6 py-4">
        <h4 className="font-medium text-black mb-2">{review.title}</h4>
        <p className="text-sm text-c4c-petrol mb-4">{review.description}</p>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-c4c-petrol">Organization:</span>
            <span className="font-medium">{getOrganizationName(review.organization)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-c4c-petrol">Project:</span>
            <span className="font-medium">{getProjectName(review.project)}</span>
          </div>
          {review.site && (
            <div className="flex justify-between text-sm">
              <span className="text-c4c-petrol">Site:</span>
              <span className="font-medium">{review.site}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-c4c-petrol">Due Date:</span>
            <span className="font-medium">
              {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : 'Not set'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-c4c-petrol">Progress:</span>
            <span className="font-medium">{review.progress}%</span>
          </div>
        </div>

        {/* Status Actions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-c4c-petrol mb-2">Update Status</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onStatusChange(review._id, 'in_review')}
              disabled={review.status === 'in_review'}
              className="inline-flex items-center justify-center px-3 py-2 border border-c4c-cobalt rounded-md text-sm text-c4c-cobalt bg-c4c-tint-cyan hover:bg-c4c-tint-cyan disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Timer className="h-4 w-4 mr-1" />
              Start Review
            </button>
            <button
              onClick={() => onStatusChange(review._id, 'approved')}
              disabled={review.status === 'approved'}
              className="inline-flex items-center justify-center px-3 py-2 border border-c4c-sage rounded-md text-sm text-black bg-c4c-tint-sage hover:bg-c4c-tint-sage disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </button>
            <button
              onClick={() => onStatusChange(review._id, 'on_hold')}
              disabled={review.status === 'on_hold'}
              className="inline-flex items-center justify-center px-3 py-2 border border-c4c-yellow rounded-md text-sm text-c4c-petrol bg-c4c-tint-gold hover:bg-c4c-tint-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Hold
            </button>
            <button
              onClick={() => onStatusChange(review._id, 'rejected')}
              disabled={review.status === 'rejected'}
              className="inline-flex items-center justify-center px-3 py-2 border border-c4c-pink rounded-md text-sm text-c4c-burgundy bg-c4c-tint-coral hover:bg-c4c-tint-coral disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h5 className="text-sm font-medium text-black mb-3">Comments & Activity</h5>
          
          {/* Add Comment */}
          <div className="mb-4 p-3 bg-c4c-grey-bg rounded-md">
            <div className="mb-2">
              <select 
                className="text-xs border border-c4c-rule rounded px-2 py-1"
                value={commentType}
                onChange={(e) => setCommentType(e.target.value as any)}
              >
                <option value="comment">Comment</option>
                <option value="approval">Approval</option>
                <option value="rejection">Rejection</option>
                <option value="request_changes">Request Changes</option>
              </select>
            </div>
            <textarea
              className="w-full text-sm border border-c4c-rule rounded-md px-3 py-2 focus:ring-c4c-cobalt focus:border-c4c-cobalt"
              rows={3}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              onClick={handleSubmitComment}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm text-black bg-c4c-coral hover:bg-c4c-petrol hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newComment.trim()}
            >
              Add Comment
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {review.comments && review.comments.length > 0 ? (
              review.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-1">
                    {getCommentIcon(comment.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-black">{comment.author}</span>
                      <span className="text-xs text-c4c-petrol">
                        {new Date(comment.date).toLocaleDateString()}
                      </span>
                      {comment.type !== 'comment' && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          comment.type === 'approval' ? 'bg-c4c-tint-sage text-black' :
                          comment.type === 'rejection' ? 'bg-c4c-tint-coral text-c4c-burgundy' :
                          'bg-c4c-tint-gold text-black'
                        }`}>
                          {comment.type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-c4c-petrol mt-1">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-c4c-petrol italic">No comments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailPanel;