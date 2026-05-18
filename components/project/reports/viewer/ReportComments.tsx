'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Reply, Edit, Trash2, X, User,
  Calendar, Clock, Heart, Pin, Flag, MoreHorizontal,
  Eye, EyeOff, Search, Filter, ChevronDown,
  CheckCircle, AlertCircle, Bell, BellOff,
  Activity,
  AtSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  getReportActivity,
  logCustomActivity
} from '@/lib/api/reports/history';
import { endCollaboration, trackCollaboration } from '@/lib/api/reports/admin';

interface ReportCommentsProps {
  reportId: string;
  onClose: () => void;
}

interface Comment {
  _id: string;
  author: {
    _id: string;
    name: string;
    email?: string;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
  isPinned: boolean;
  mentions: string[];
  replies: Comment[];
  likes: string[];
  parentId?: string;
  status: 'active' | 'resolved' | 'flagged';
  metadata?: {
    section?: string;
    attachments?: Array<{
      name: string;
      url: string;
      size: number;
    }>;
  };
}

interface ActivityEntry {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  action: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

const ReportComments: React.FC<ReportCommentsProps> = ({
  reportId,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [filter, setFilter] = useState<'all' | 'resolved' | 'unresolved' | 'pinned'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(true);
  const [mentionSuggestions, setMentionSuggestions] = useState<Array<{id: string; name: string}>>([]);
  const [showMentions, setShowMentions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const collaborationRef = useRef<string | null>(null);

  useEffect(() => {
    fetchComments();
    fetchActivity();
    startCollaboration();

    return () => {
      if (collaborationRef.current) {
        endCollaborationSession();
      }
    };
  }, [reportId]);

  const fetchComments = async () => {
    try {
      // Mock data - replace with actual API call
      const mockComments: Comment[] = [
        {
          _id: '1',
          author: { _id: 'user1', name: 'John Doe', email: 'john@example.com' },
          content: 'The risk assessment section needs more detail on environmental factors.',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          isEdited: false,
          isPinned: true,
          mentions: [],
          replies: [
            {
              _id: '1-1',
              author: { _id: 'user2', name: 'Jane Smith' },
              content: 'I agree. We should include climate change impacts.',
              createdAt: new Date(Date.now() - 3000000).toISOString(),
              isEdited: false,
              isPinned: false,
              mentions: [],
              replies: [],
              likes: [],
              parentId: '1',
              status: 'active'
            }
          ],
          likes: ['user2', 'user3'],
          status: 'active',
          metadata: { section: 'Risk Assessment' }
        },
        {
          _id: '2',
          author: { _id: 'user3', name: 'Mike Johnson' },
          content: 'The stakeholder mapping looks comprehensive. Good work!',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          isEdited: false,
          isPinned: false,
          mentions: [],
          replies: [],
          likes: ['user1'],
          status: 'resolved'
        }
      ];

      setComments(mockComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await getReportActivity(reportId, {
        activityTypes: 'comment,edit,view',
        limit: 20
      });
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const startCollaboration = async () => {
    try {
      const response = await trackCollaboration(reportId, 'comment_thread', [
        { userId: user?._id || '', role: 'reviewer' }
      ]);
      collaborationRef.current = response.data._id;
    } catch (error) {
      console.error('Error starting collaboration:', error);
    }
  };

  const endCollaborationSession = async () => {
    if (collaborationRef.current) {
      try {
        await endCollaboration(collaborationRef.current, 'Comment session ended');
      } catch (error) {
        console.error('Error ending collaboration:', error);
      }
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      // Mock comment creation - replace with actual API call
      const mockComment: Comment = {
        _id: Date.now().toString(),
        author: { _id: user._id.toString(), name: user.name || 'Unknown User' },
        content: newComment,
        createdAt: new Date().toISOString(),
        isEdited: false,
        isPinned: false,
        mentions: extractMentions(newComment),
        replies: [],
        likes: [],
        status: 'active'
      };

      setComments(prev => [mockComment, ...prev]);
      setNewComment('');
      
      // Log activity
      await logCustomActivity(reportId, 'comment', 'comment_added', {
        description: 'Added a new comment',
        metadata: { commentId: mockComment._id }
      });

      toast({
        title: 'Comment Added',
        description: 'Your comment has been posted',
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!content.trim() || !user) return;

    try {
      const mockReply: Comment = {
        _id: `${parentId}-${Date.now()}`,
        author: { _id: user._id.toString(), name: user.name || 'Unknown User' },
        content,
        createdAt: new Date().toISOString(),
        isEdited: false,
        isPinned: false,
        mentions: extractMentions(content),
        replies: [],
        likes: [],
        parentId,
        status: 'active'
      };

      setComments(prev => prev.map(comment => 
        comment._id === parentId 
          ? { ...comment, replies: [mockReply, ...comment.replies] }
          : comment
      ));

      setReplyingTo(null);
      
      toast({
        title: 'Reply Added',
        description: 'Your reply has been posted',
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reply',
        variant: 'destructive',
      });
    }
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, content: newContent, isEdited: true, updatedAt: new Date().toISOString() }
          : comment
      ));

      setEditingComment(null);
      setEditContent('');
      
      toast({
        title: 'Comment Updated',
        description: 'Your comment has been updated',
      });
    } catch (error) {
      console.error('Error editing comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update comment',
        variant: 'destructive',
      });
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;
    
    setComments(prev => prev.map(comment => 
      comment._id === commentId 
        ? { 
            ...comment, 
            likes: comment.likes.includes(user._id.toString())
              ? comment.likes.filter(id => id !== user._id.toString())
              : [...comment.likes, user._id.toString()]
          }
        : comment
    ));
  };

  const handlePinComment = async (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment._id === commentId 
        ? { ...comment, isPinned: !comment.isPinned }
        : comment
    ));
  };

  const handleResolveComment = async (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment._id === commentId 
        ? { 
            ...comment, 
            status: comment.status === 'resolved' ? 'active' : 'resolved' 
          }
        : comment
    ));
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@\[([^\]]+)\]/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const getFilteredComments = () => {
    let filtered = comments;
    
    switch (filter) {
      case 'resolved':
        filtered = filtered.filter(c => c.status === 'resolved');
        break;
      case 'unresolved':
        filtered = filtered.filter(c => c.status === 'active');
        break;
      case 'pinned':
        filtered = filtered.filter(c => c.isPinned);
        break;
    }

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment._id} className={`${isReply ? 'ml-8 mt-3' : 'mb-6'} transition-all duration-200`}>
      <div className={`rounded-lg border p-4 ${
        comment.isPinned ? 'border-ochre bg-ochre-50' : 
        comment.status === 'resolved' ? 'border-green-200 bg-green-50' :
        'border-sky-tint bg-white'
      }`}>
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-sky rounded-full flex items-center justify-center">
              <User className="text-white" size={16} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-stratosphere">{comment.author.name}</span>
                {comment.isPinned && <Pin className="text-ochre" size={14} />}
                {comment.status === 'resolved' && <CheckCircle className="text-green-600" size={14} />}
              </div>
              <div className="flex items-center space-x-2 text-xs text-sky">
                <Calendar size={12} />
                <span>{formatTimestamp(comment.createdAt)}</span>
                {comment.isEdited && <span>(edited)</span>}
                {comment.metadata?.section && (
                  <span className="px-2 py-1 bg-sky-100 text-sky-800 rounded">
                    {comment.metadata.section}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center space-x-2">
            {user && (
              <>
                <button
                  onClick={() => handleLikeComment(comment._id)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
                    comment.likes.includes(user._id.toString())
                      ? 'bg-red-100 text-red-600'
                      : 'text-sky hover:bg-sky-tint'
                  }`}
                >
                  <Heart size={14} className={comment.likes.includes(user._id.toString()) ? 'fill-current' : ''} />
                  <span>{comment.likes.length}</span>
                </button>

                {!isReply && (
                  <>
                    <button
                      onClick={() => setReplyingTo(comment._id)}
                      className="flex items-center space-x-1 px-2 py-1 rounded text-sm text-sky hover:bg-sky-tint"
                    >
                      <Reply size={14} />
                      <span>Reply</span>
                    </button>

                    <button
                      onClick={() => handlePinComment(comment._id)}
                      className="flex items-center space-x-1 px-2 py-1 rounded text-sm text-sky hover:bg-sky-tint"
                    >
                      <Pin size={14} />
                    </button>

                    <button
                      onClick={() => handleResolveComment(comment._id)}
                      className="flex items-center space-x-1 px-2 py-1 rounded text-sm text-sky hover:bg-sky-tint"
                    >
                      <CheckCircle size={14} />
                    </button>
                  </>
                )}

                {comment.author._id === user._id.toString() && (
                  <>
                    <button
                      onClick={() => {
                        setEditingComment(comment._id);
                        setEditContent(comment.content);
                      }}
                      className="flex items-center space-x-1 px-2 py-1 rounded text-sm text-sky hover:bg-sky-tint"
                    >
                      <Edit size={14} />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Comment Content */}
        {editingComment === comment._id ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditComment(comment._id, editContent)}
                className="px-4 py-2 bg-sky text-white rounded-md hover:bg-stratosphere"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}
                className="px-4 py-2 border border-sky text-sky rounded-md hover:bg-sky-tint"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-stratosphere whitespace-pre-wrap">{comment.content}</p>
        )}

        {/* Reply Input */}
        {replyingTo === comment._id && (
          <div className="mt-4 pt-4 border-t border-sky-tint">
            <ReplyInput
              onSubmit={(content) => handleReply(comment._id, content)}
              onCancel={() => setReplyingTo(null)}
            />
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageSquare className="text-sky" size={24} />
          <h3 className="text-lg font-medium text-stratosphere">Comments & Activity</h3>
          {showNotifications ? (
            <Bell className="text-sky" size={16} />
          ) : (
            <BellOff className="text-sky" size={16} />
          )}
        </div>
        <button
          onClick={onClose}
          className="text-sky hover:text-stratosphere"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b border-sky-tint">
        <button
          onClick={() => setActiveTab('comments')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'comments'
              ? 'border-sky text-sky'
              : 'border-transparent text-sky hover:text-stratosphere'
          }`}
        >
          Comments ({comments.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'activity'
              ? 'border-sky text-sky'
              : 'border-transparent text-sky hover:text-stratosphere'
          }`}
        >
          Activity ({activities.length})
        </button>
      </div>

      {activeTab === 'comments' ? (
        <>
          {/* Comment Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search comments..."
                  className="w-full pl-10 pr-4 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {['all', 'unresolved', 'resolved', 'pinned'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption as any)}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    filter === filterOption
                      ? 'bg-sky text-white'
                      : 'bg-sky-tint text-sky hover:bg-sky hover:text-white'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* New Comment Input */}
          <div className="mb-6 bg-sky-tint rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-sky rounded-full flex items-center justify-center">
                <User className="text-white" size={16} />
              </div>
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center space-x-2 text-sm text-sky">
                    <AtSign size={14} />
                    <span>Use @name to mention users</span>
                  </div>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    className="flex items-center space-x-2 px-4 py-2 bg-sky text-white rounded-md hover:bg-stratosphere disabled:opacity-50"
                  >
                    {submitting ? (
                      <Clock size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Clock size={24} className="animate-spin text-sky" />
            </div>
          ) : getFilteredComments().length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare size={48} className="mx-auto text-sky mb-4" />
              <p className="text-sky">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredComments().map(comment => renderComment(comment))}
            </div>
          )}
        </>
      ) : (
        /* Activity Tab */
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity size={48} className="mx-auto text-sky mb-4" />
              <p className="text-sky">No activity recorded</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={activity._id} className="flex items-start space-x-3 p-4 bg-sky-tint rounded-lg">
                <div className="w-8 h-8 bg-sky rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-stratosphere">{activity.user.name}</span>
                    <span className="text-sm text-sky">{activity.action}</span>
                  </div>
                  <p className="text-sm text-sky mt-1">{activity.description}</p>
                  <div className="flex items-center space-x-2 text-xs text-sky mt-2">
                    <Calendar size={12} />
                    <span>{formatTimestamp(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Reply Input Component
const ReplyInput: React.FC<{
  onSubmit: (content: string) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = () => {
    if (replyContent.trim()) {
      onSubmit(replyContent);
      setReplyContent('');
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        placeholder="Write a reply..."
        className="w-full px-3 py-2 border border-sky rounded-md focus:ring-2 focus:ring-sky focus:border-transparent"
        rows={2}
      />
      <div className="flex space-x-2">
        <button
          onClick={handleSubmit}
          disabled={!replyContent.trim()}
          className="px-4 py-2 bg-sky text-white rounded-md hover:bg-stratosphere disabled:opacity-50"
        >
          Reply
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-sky text-sky rounded-md hover:bg-sky-tint"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ReportComments;