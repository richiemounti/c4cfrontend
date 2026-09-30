// components/reviews/modals/AddOrgClientModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { addReviewer, getEligibleOrgClients } from '@/lib/api/reviews';
import { X, UserPlus, Loader2, Search, User } from 'lucide-react';

interface OrgClient {
  _id: string;
  name: string;
  email: string;
  role?: string;
  photo?: string;
}

interface AddOrgClientModalProps {
  reviewId: string;
  currentReviewers: { _id: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AddOrgClientModal: React.FC<AddOrgClientModalProps> = ({
  reviewId,
  currentReviewers,
  onClose,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<OrgClient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    const load = async () => {
      try {
        setFetching(true);
        const res = await getEligibleOrgClients(reviewId);
        setClients(res.data ?? []);
      } catch {
        setError('Failed to load organisation clients');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [reviewId]);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.role ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select a client to add');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const res = await addReviewer(reviewId, { reviewerId: selectedId });
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to add client');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add client');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-c4c-rule">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-c4c-grey-bg rounded-lg">
              <UserPlus className="w-5 h-5 text-c4c-petrol" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-black">
                Add Organisation Client
              </h2>
              <p className="text-xs text-c4c-petrol mt-0.5">
                Add a client from this organisation as a reviewer
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-c4c-grey-bg rounded-lg transition-colors">
            <X className="w-5 h-5 text-c4c-petrol" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

          {/* Current reviewers chip list */}
          {currentReviewers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-c4c-petrol uppercase mb-2">
                Current Reviewers ({currentReviewers.length})
              </p>
            </div>
          )}

          {/* Search */}
          <div>
            <label className="text-sm font-medium text-black mb-2 block">
              Select Client <span className="text-c4c-burgundy">*</span>
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-c4c-petrol" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email or role…"
                className="w-full pl-9 pr-3 py-2 border border-c4c-rule rounded-lg text-sm focus:ring-2 focus:ring-c4c-petrol focus:border-transparent"
                disabled={fetching}
              />
            </div>

            {/* Client list */}
            <div className="border border-c4c-rule rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              {fetching ? (
                <div className="flex items-center justify-center py-8 gap-2 text-c4c-petrol">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading clients…</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-8 text-center">
                  <User className="w-10 h-10 text-c4c-petrol mx-auto mb-2" />
                  <p className="text-sm text-black mb-1">
                    {searchQuery ? 'No clients match your search' : 'No eligible clients found'}
                  </p>
                  <p className="text-xs text-c4c-petrol">
                    All organisation clients may already be reviewers
                  </p>
                </div>
              ) : (
                filtered.map((client) => {
                  const isSelected = selectedId === client._id;
                  return (
                    <button
                      key={client._id}
                      type="button"
                      onClick={() => setSelectedId(client._id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-c4c-rule last:border-b-0
                        ${isSelected
                          ? 'bg-c4c-grey-bg border-l-2 border-l-c4c-petrol'
                          : 'hover:bg-c4c-grey-bg'
                        }`}
                    >
                      {client.photo ? (
                        <img
                          src={client.photo}
                          alt={client.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-c4c-grey-bg text-black flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {client.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">{client.name}</p>
                        <p className="text-xs text-c4c-petrol truncate">{client.email}</p>
                      </div>
                      {client.role && (
                        <span className="text-xs bg-c4c-grey-bg text-c4c-petrol px-2 py-0.5 rounded-full border border-c4c-rule flex-shrink-0">
                          {client.role}
                        </span>
                      )}
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-c4c-petrol flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-c4c-tint-coral border border-c4c-pink rounded-lg text-sm text-c4c-burgundy">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-c4c-rule">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2 border border-c4c-rule text-c4c-petrol rounded-lg hover:bg-c4c-grey-bg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting || !selectedId || fetching}
            className="flex-1 px-4 py-2 bg-c4c-coral text-black rounded-lg hover:bg-c4c-petrol hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding…</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Add Client</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOrgClientModal;
