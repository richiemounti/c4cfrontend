// components/reviews/modals/AddReviewerModal.tsx - FULLY UPDATED
'use client';

import React, { useState, useEffect } from 'react';
import { addReviewer, getEligibleReviewers } from '@/lib/api/reviews';
import { X, UserPlus, Loader2, Search, User, Shield } from 'lucide-react';

interface Reviewer {
  _id: string;
  name: string;
  email: string;
  role?: string;
  photo?: string;
  isStaff?: boolean;
}

interface AddReviewerModalProps {
  reviewId: string;
  currentReviewers: Reviewer[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AddReviewerModal: React.FC<AddReviewerModalProps> = ({
  reviewId,
  currentReviewers,
  onClose,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<Reviewer[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch eligible reviewers from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setFetchingUsers(true);
        setError(null);
        
        const response = await getEligibleReviewers(reviewId);
        
        if (response.success) {
          setAvailableUsers(response.data || []);
        } else {
          setError(response.message || 'Failed to load eligible reviewers');
        }
      } catch (err: any) {
        console.error('Error fetching eligible reviewers:', err);
        setError(err.response?.data?.error || 'Failed to load eligible reviewers');
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [reviewId]);

  // Filter users based on search query
  const filteredUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      setError('Please select a user to add as reviewer');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await addReviewer(reviewId, {
        reviewerId: selectedUserId,
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to add reviewer');
      }
    } catch (err: any) {
      console.error('Error adding reviewer:', err);
      setError(err.response?.data?.error || 'Failed to add reviewer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-concrete-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 rounded-lg">
              <UserPlus className="w-5 h-5 text-sky-500" />
            </div>
            <h2 className="text-xl font-semibold text-stratosphere-900">
              Add Reviewer
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-concrete-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-concrete-900" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Current Reviewers */}
          {currentReviewers.length > 0 && (
            <div className="mb-6">
              <label className="text-sm font-medium text-concrete-900 mb-2 block">
                Current Reviewers ({currentReviewers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {currentReviewers.map((reviewer) => (
                  <div
                    key={reviewer._id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-concrete-100 rounded-lg text-sm"
                  >
                    <User className="w-3 h-3 text-concrete-900" />
                    <span className="text-stratosphere-900">{reviewer.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <label className="text-sm font-medium text-stratosphere-900 mb-2 block">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-concrete-900" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or role..."
                className="w-full pl-10 pr-3 py-2 border border-concrete-500 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                disabled={fetchingUsers}
              />
            </div>
          </div>

          {/* Info Banner */}
          {!fetchingUsers && availableUsers.length > 0 && (
            <div className="mb-4 p-3 bg-sky-50 border border-sky-100 rounded-lg">
              <p className="text-xs text-sky-900">
                <Shield className="w-3 h-3 inline mr-1" />
                Showing eligible reviewers. Account managers can be added to get staff support.
              </p>
            </div>
          )}

          {/* Available Users */}
          <div className="mb-6">
            <label className="text-sm font-medium text-stratosphere-900 mb-2 block">
              Select User to Add <span className="text-clay-900">*</span>
            </label>

            {fetchingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 bg-concrete-50 rounded-lg">
                <User className="w-12 h-12 text-concrete-900 mx-auto mb-2" />
                <p className="text-sm text-stratosphere-900 mb-1">
                  {searchQuery 
                    ? 'No users found matching your search' 
                    : availableUsers.length === 0 
                      ? 'No eligible users available'
                      : 'No available users to add'
                  }
                </p>
                {availableUsers.length === 0 && (
                  <p className="text-xs text-concrete-900 mt-2">
                    No eligible users found for this review
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-concrete-500 rounded-lg p-2">
                {filteredUsers.map((user) => (
                  <label
                    key={user._id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUserId === user._id
                        ? 'bg-sky-50 border border-sky-500'
                        : 'hover:bg-concrete-50 border border-transparent'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reviewer"
                      value={user._id}
                      checked={selectedUserId === user._id}
                      onChange={() => setSelectedUserId(user._id)}
                      className="text-sky-500 focus:ring-sky-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {user.photo ? (
                          <img 
                            src={user.photo} 
                            alt={user.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-concrete-900" />
                        )}
                        <p className="text-sm font-medium text-stratosphere-900">
                          {user.name}
                        </p>
                        {user.isStaff && (
                          <span className="px-2 py-0.5 bg-ochre-100 text-ochre-900 text-xs rounded">
                            Staff
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-concrete-900 mt-1">
                        {user.email}
                      </p>
                      {user.role && (
                        <p className="text-xs text-sky-500 mt-1">
                          {user.role}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-clay-50 border border-clay-100 rounded-lg text-sm text-clay-900">
              {error}
            </div>
          )}
        </form>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-concrete-500">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-concrete-500 text-stratosphere-900 rounded-lg hover:bg-concrete-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !selectedUserId || fetchingUsers}
            className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Add Reviewer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddReviewerModal;