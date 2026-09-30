// components/reviews/modals/SeekInputModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Search, Loader2, Calendar } from 'lucide-react';
import { seekInput } from '@/lib/api/reviews';
import { getMentionableUsers } from '@/lib/api/inbox';
import type { InboxUser } from '@/lib/api/inbox';
import type { Review } from '@/types';

interface SeekInputModalProps {
  review: Review;
  onClose: () => void;
  onSuccess: () => void;
}

export const SeekInputModal: React.FC<SeekInputModalProps> = ({
  review,
  onClose,
  onSuccess,
}) => {
  const [colleagues, setColleagues] = useState<InboxUser[]>([]);
  const [loadingColleagues, setLoadingColleagues] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [deadline, setDeadline] = useState('');
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
        setLoadingColleagues(true);
        const res = await getMentionableUsers({
          organizationId: review.organizationId._id,
          limit: 50,
        });
        setColleagues(res.data ?? []);
      } catch {
        setError('Failed to load colleagues');
      } finally {
        setLoadingColleagues(false);
      }
    };
    load();
  }, [review.organizationId._id]);

  const filtered = colleagues.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) { setError('Select at least one colleague'); return; }
    if (!message.trim()) { setError('Please add a message describing what input you need'); return; }
    if (!deadline) { setError('Please set a response deadline'); return; }

    try {
      setSubmitting(true);
      setError(null);
      const response = await seekInput(review._id, {
        recipientIds: selectedIds,
        message: message.trim(),
        deadline,
      });
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to send input request');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send input request');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-c4c-rule flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-c4c-grey-bg rounded-lg">
              <Users className="w-5 h-5 text-c4c-petrol" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-black">Seek Input</h2>
              <p className="text-xs text-c4c-petrol">Ask a colleague to weigh in on this review</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-c4c-grey-bg rounded-lg transition-colors">
            <X className="w-5 h-5 text-c4c-petrol" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 overflow-y-auto flex-1">
          {/* Colleague picker */}
          <div>
            <label className="text-sm font-medium text-black mb-2 block">
              Select Colleagues <span className="text-c4c-burgundy">*</span>
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-c4c-petrol" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-c4c-rule rounded-lg text-sm focus:ring-2 focus:ring-c4c-petrol focus:border-transparent"
              />
            </div>
            <div className="border border-c4c-rule rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              {loadingColleagues ? (
                <div className="flex items-center justify-center py-6 gap-2 text-c4c-petrol">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-6 text-center text-sm text-c4c-petrol">No colleagues found</div>
              ) : (
                filtered.map((c) => {
                  const selected = selectedIds.includes(c._id);
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => toggle(c._id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left border-b border-c4c-rule last:border-b-0 transition-colors ${
                        selected ? 'bg-c4c-grey-bg' : 'hover:bg-c4c-grey-bg'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        selected ? 'bg-c4c-petrol border-c4c-petrol' : 'border-c4c-rule'
                      }`}>
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-c4c-grey-bg text-black flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {c.name[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">{c.name}</p>
                        <p className="text-xs text-c4c-petrol truncate">{c.email}</p>
                      </div>
                      {c.primaryRole && (
                        <span className="text-xs bg-c4c-grey-bg text-c4c-petrol px-2 py-0.5 rounded-full border border-c4c-rule flex-shrink-0">
                          {c.primaryRole}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            {selectedIds.length > 0 && (
              <p className="text-xs text-c4c-petrol mt-1">{selectedIds.length} colleague{selectedIds.length !== 1 ? 's' : ''} selected</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-black mb-2 block">
              Message <span className="text-c4c-burgundy">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What specific input or perspective do you need from them?"
              className="w-full px-3 py-2 border border-c4c-rule rounded-lg text-sm resize-none focus:ring-2 focus:ring-c4c-petrol focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="text-sm font-medium text-black mb-2 block">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Response deadline <span className="text-c4c-burgundy">*</span></span>
              </div>
            </label>
            <input
              type="date"
              value={deadline}
              min={today}
              required
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-c4c-rule rounded-lg text-sm focus:ring-2 focus:ring-c4c-petrol focus:border-transparent"
            />
            <p className="text-xs text-c4c-petrol mt-1">
              This sets the review's due date and drives its urgency on the reviews page
            </p>
          </div>

          {error && (
            <div className="p-3 bg-c4c-tint-coral border border-c4c-pink rounded-lg text-sm text-c4c-burgundy">
              {error}
            </div>
          )}

          <div className="flex gap-3">
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
              disabled={submitting || selectedIds.length === 0 || !message.trim() || !deadline}
              className="flex-1 px-4 py-2 bg-c4c-coral text-black rounded-lg hover:bg-c4c-petrol hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending…</span></>
              ) : (
                <><Users className="w-4 h-4" /><span>Send Request</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeekInputModal;
