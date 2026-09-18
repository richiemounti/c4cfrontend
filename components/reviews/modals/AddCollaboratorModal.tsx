// components/reviews/modals/AddCollaboratorModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Loader2, Search, CheckCircle } from 'lucide-react';
import { inviteStaffCollaborator, getEligibleStaffCollaborators } from '@/lib/api/reviews';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  primaryRole: string;
}

interface AddCollaboratorModalProps {
  reviewId: string;
  /** IDs of staff already in the conversation, so we can grey them out */
  existingCollaboratorIds?: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AddCollaboratorModal: React.FC<AddCollaboratorModalProps> = ({
  reviewId,
  existingCollaboratorIds = [],
  onClose,
  onSuccess,
}) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Load staff list
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingStaff(true);
        const res = await getEligibleStaffCollaborators(reviewId);
        setStaffMembers(res.data ?? []);
      } catch {
        setError('Failed to load staff members');
      } finally {
        setLoadingStaff(false);
      }
    };
    load();
  }, [reviewId]);

  const filtered = staffMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select a staff member');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await inviteStaffCollaborator(reviewId, {
        collaboratorId: selectedId,
        message: message.trim() || undefined,
      });
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to invite collaborator');
      }
    } catch (err: any) {
      const msg = err?.message;
      if (err?.response?.status === 409) {
        setError('This staff member is already a collaborator on this review.');
      } else {
        setError(msg || 'Failed to invite collaborator');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      accountManager: 'Account Manager',
      analyst: 'Analyst',
      admin: 'Admin',
      superAdmin: 'Super Admin',
    };
    return map[role] ?? role;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-500 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-50 rounded-lg">
              <UserPlus className="w-5 h-5 text-neutral-500" />
            </div>
            <h2 className="text-xl font-semibold text-ink-900">
              Add Staff Collaborator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-900" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">

          {/* Search */}
          <div>
            <label className="text-sm font-medium text-ink-900 mb-2 block">
              Select Staff Member <span className="text-burgundy-900">*</span>
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-900" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-stone-500 rounded-lg text-sm focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
              />
            </div>

            {/* Staff list */}
            <div className="border border-stone-500 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
              {loadingStaff ? (
                <div className="flex items-center justify-center py-8 gap-2 text-stone-900">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading staff…</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-stone-900">
                  No staff members found
                </div>
              ) : (
                filtered.map((member) => {
                  const isExisting = existingCollaboratorIds.includes(member._id);
                  const isSelected = selectedId === member._id;
                  return (
                    <button
                      key={member._id}
                      type="button"
                      disabled={isExisting}
                      onClick={() => !isExisting && setSelectedId(member._id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-stone-100 last:border-b-0
                        ${isExisting
                          ? 'opacity-40 cursor-not-allowed bg-stone-50'
                          : isSelected
                          ? 'bg-neutral-50 border-l-2 border-l-neutral-500'
                          : 'hover:bg-stone-50'
                        }`}
                    >
                      {/* Avatar */}
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-900 truncate">{member.name}</p>
                        <p className="text-xs text-stone-900 truncate">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs bg-stone-50 text-stone-900 px-2 py-0.5 rounded-full border border-stone-500">
                          {roleLabel(member.primaryRole)}
                        </span>
                        {isExisting && (
                          <CheckCircle className="w-4 h-4 text-sage-500" />
                        )}
                        {isSelected && !isExisting && (
                          <div className="w-4 h-4 rounded-full bg-neutral-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {existingCollaboratorIds.length > 0 && (
              <p className="text-xs text-stone-900 mt-1">
                Greyed-out members are already collaborating on this review.
              </p>
            )}
          </div>

          {/* Optional message */}
          <div>
            <label className="text-sm font-medium text-ink-900 mb-2 block">
              Message <span className="text-stone-900 font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add context for the collaborator about why they're being brought in…"
              className="w-full px-3 py-2 border border-stone-500 rounded-lg text-sm resize-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-burgundy-50 border border-burgundy-100 rounded-lg text-sm text-burgundy-900">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-stone-500 text-ink-900 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedId}
              className="flex-1 px-4 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Inviting…</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Add Collaborator</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCollaboratorModal;