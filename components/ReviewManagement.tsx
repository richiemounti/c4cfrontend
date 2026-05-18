// components/ReviewManagement.tsx
'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  User, 
  Calendar,
  Plus,
  Eye,
  Edit2,
  Send
} from 'lucide-react';

interface Review {
  _id: string;
  entityType: 'project_setup' | 'site_setup' | 'stakeholder_mapping' | 'consultation_plan' | 'theory_of_change_stage';
  title: string;
  description?: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  completedTasks: number;
  totalTasks: number;
  dueDate?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewer?: {
    _id: string;
    name: string;
    email: string;
  };
  comments: Array<{
    _id: string;
    author: {
      _id: string;
      name: string;
      email: string;
    };
    content: string;
    type: 'comment' | 'approval' | 'rejection' | 'request_changes';
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ReviewManagementProps {
  reviews: Review[];
  entityType: 'project' | 'site';
  entityId: string;
  onCreateReview?: (entityType: string, entityId: string) => void;
  onUpdateReview?: (reviewId: string, data: any) => void;
  onAddComment?: (reviewId: string, comment: string, type: string) => void;
  onViewDetails?: (reviewId: string) => void;
}

export const ReviewManagement: React.FC<ReviewManagementProps> = ({
  reviews,
  entityType,
  entityId,
  onCreateReview,
  onUpdateReview,
  onAddComment,
  onViewDetails
}) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showCommentForm, setShowCommentForm] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'approval' | 'rejection' | 'request_changes'>('comment');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'on_hold':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusUpdate = (reviewId: string, newStatus: string) => {
    if (onUpdateReview) {
      onUpdateReview(reviewId, { status: newStatus });
    }
  };

  const handleAddComment = (reviewId: string) => {
    if (newComment.trim() && onAddComment) {
      onAddComment(reviewId, newComment, commentType);
      setNewComment('');
      setShowCommentForm(null);
    }
  };

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case 'project_setup': return 'Project Setup';
      case 'site_setup': return 'Site Setup';
      case 'stakeholder_mapping': return 'Stakeholder Mapping';
      case 'consultation_plan': return 'Consultation Plan';
      case 'theory_of_change_stage': return 'Theory of Change';
      default: return entityType.replace('_', ' ');
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No reviews found for this {entityType}.</p>
        {onCreateReview && (
          <button 
            onClick={() => onCreateReview('manual', entityId)}
            className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Create the first review →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white border rounded-lg p-6 shadow-sm">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(review.status)}
                  <h4 className="text-lg font-medium text-gray-900">{review.title}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                    {review.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(review.priority)}`}>
                    {review.priority} priority
                  </span>
                </div>
                <p className="text-sm text-gray-600">{getEntityTypeLabel(review.entityType)}</p>
                {review.description && (
                  <p className="text-sm text-gray-700 mt-2">{review.description}</p>
                )}
              </div>
              
              <div className="flex space-x-2">
                {onViewDetails && (
                  <button
                    onClick={() => onViewDetails(review._id)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                )}
                <button
                  onClick={() => setShowCommentForm(showCommentForm === review._id ? null : review._id)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Comment
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress: {review.completedTasks}/{review.totalTasks} tasks</span>
                <span>{review.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${review.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Review Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
              {review.assignedTo && (
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Assigned to: </span>
                  <span className="text-gray-900 ml-1">{review.assignedTo.name}</span>
                </div>
              )}
              {review.reviewer && (
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Reviewer: </span>
                  <span className="text-gray-900 ml-1">{review.reviewer.name}</span>
                </div>
              )}
              {review.dueDate && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Due: </span>
                  <span className="text-gray-900 ml-1">{new Date(review.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Status Update Actions */}
            {review.status === 'pending' || review.status === 'in_review' ? (
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => handleStatusUpdate(review._id, 'in_review')}
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  disabled={review.status === 'in_review'}
                >
                  Start Review
                </button>
                <button
                  onClick={() => handleStatusUpdate(review._id, 'approved')}
                  className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate(review._id, 'rejected')}
                  className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </button>
                <button
                  onClick={() => handleStatusUpdate(review._id, 'on_hold')}
                  className="inline-flex items-center px-3 py-1 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Hold
                </button>
              </div>
            ) : null}

            {/* Comment Form */}
            {showCommentForm === review._id && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment Type
                  </label>
                  <select
                    value={commentType}
                    onChange={(e) => setCommentType(e.target.value as any)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="comment">General Comment</option>
                    <option value="approval">Approval Comment</option>
                    <option value="rejection">Rejection Comment</option>
                    <option value="request_changes">Request Changes</option>
                  </select>
                </div>
                <div className="mb-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add your comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowCommentForm(null)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddComment(review._id)}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Add Comment
                  </button>
                </div>
              </div>
            )}

            {/* Recent Comments */}
            {review.comments && review.comments.length > 0 && (
              <div className="border-t pt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">
                  Recent Comments ({review.comments.length})
                </h5>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {review.comments.slice(-3).map((comment) => (
                    <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            comment.type === 'approval' ? 'bg-green-100 text-green-800' :
                            comment.type === 'rejection' ? 'bg-red-100 text-red-800' :
                            comment.type === 'request_changes' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {comment.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewManagement;