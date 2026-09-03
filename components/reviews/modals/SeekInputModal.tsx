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
      setError(err.response?.data?.error || 'Failed to send input request');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-concrete-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 rounded-lg">
              <Users className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stratosphere-900">Seek Input</h2>
              <p className="text-xs text-concrete-700">Ask a colleague to weigh in on this review</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-concrete-50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-concrete-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 overflow-y-auto flex-1">
          {/* Colleague picker */}
          <div>
            <label className="text-sm font-medium text-stratosphere-900 mb-2 block">
              Select Colleagues <span className="text-clay-900">*</span>
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-concrete-700" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-concrete-500 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div className="border border-concrete-500 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              {loadingColleagues ? (
                <div className="flex items-center justify-center py-6 gap-2 text-concrete-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-6 text-center text-sm text-concrete-700">No colleagues found</div>
              ) : (
                filtered.map((c) => {
                  const selected = selectedIds.includes(c._id);
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => toggle(c._id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left border-b border-concrete-100 last:border-b-0 transition-colors ${
                        selected ? 'bg-sky-50' : 'hover:bg-concrete-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        selected ? 'bg-sky-500 border-sky-500' : 'border-concrete-400'
                      }`}>
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-stratosphere-100 text-stratosphere-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {c.name[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stratosphere-900 truncate">{c.name}</p>
                        <p className="text-xs text-concrete-700 truncate">{c.email}</p>
                      </div>
                      {c.primaryRole && (
                        <span className="text-xs bg-concrete-50 text-concrete-700 px-2 py-0.5 rounded-full border border-concrete-300 flex-shrink-0">
                          {c.primaryRole}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            {selectedIds.length > 0 && (
              <p className="text-xs text-sky-600 mt-1">{selectedIds.length} colleague{selectedIds.length !== 1 ? 's' : ''} selected</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-stratosphere-900 mb-2 block">
              Message <span className="text-clay-900">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What specific input or perspective do you need from them?"
              className="w-full px-3 py-2 border border-concrete-500 rounded-lg text-sm resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="text-sm font-medium text-stratosphere-900 mb-2 block">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Response deadline <span className="text-clay-900">*</span></span>
              </div>
            </label>
            <input
              type="date"
              value={deadline}
              min={today}
              required
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-concrete-500 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <p className="text-xs text-concrete-700 mt-1">
              This sets the review's due date and drives its urgency on the reviews page
            </p>
          </div>

          {error && (
            <div className="p-3 bg-clay-50 border border-clay-100 rounded-lg text-sm text-clay-900">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-concrete-500 text-stratosphere-900 rounded-lg hover:bg-concrete-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedIds.length === 0 || !message.trim() || !deadline}
              className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
