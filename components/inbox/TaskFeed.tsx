'use client';

// components/inbox/TaskFeed.tsx
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList, Loader2, ExternalLink, Calendar,
  CheckCheck, AlertTriangle, Clock,
} from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api/inbox';
import type { Notification } from '@/lib/api/inbox';
import { formatDistanceToNow, format, isPast, isToday, isYesterday } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); } catch { return ''; }
}

function deadlineInfo(deadline: string) {
  try {
    const d   = new Date(deadline);
    const due = isToday(d)
      ? 'Due today'
      : isYesterday(d)
      ? 'Was due yesterday'
      : format(d, 'dd MMM yyyy');
    return { label: due, overdue: isPast(d) };
  } catch { return { label: '', overdue: false }; }
}

// ─── Task row ────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onRead,
}: {
  task: Notification;
  onRead: (id: string) => void;
}) {
  const router = useRouter();
  const [marking, setMarking] = useState(false);
  const deadline = task.deadline ? deadlineInfo(task.deadline) : null;

  const handleNavigate = async (href: string) => {
    if (!task.read) {
      setMarking(true);
      try {
        await markNotificationRead(task._id);
        onRead(task._id);
      } finally {
        setMarking(false);
      }
    }
    router.push(href);
  };

  return (
    <div className={`
      relative px-4 py-4 flex gap-3 items-start transition-colors
      border-b border-concrete-100 last:border-b-0
      ${task.read ? 'bg-white hover:bg-concrete-50' : 'bg-sky-50/60 hover:bg-sky-50'}
    `}>
      {/* Unread accent */}
      {!task.read && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-ochre rounded-r" />
      )}

      {/* Icon */}
      <div className={`
        flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
        ${deadline?.overdue ? 'bg-red-50' : 'bg-sky-50'}
      `}>
        {deadline?.overdue
          ? <AlertTriangle size={14} className="text-red-500" />
          : <ClipboardList size={14} className="text-sky-500" />
        }
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stratosphere leading-snug">
          <span className="font-semibold">{task.triggeredBy?.name ?? 'Someone'}</span>
          <span className="text-concrete-700"> is asking for your input</span>
        </p>

        {task.preview && (
          <p className="text-xs text-concrete-700 mt-1 line-clamp-2 leading-relaxed italic">
            "{task.preview}"
          </p>
        )}

        {/* Action links */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {task.pageContext?.href && (
            <button
              onClick={() => handleNavigate(task.pageContext!.href)}
              disabled={marking}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stratosphere/5 hover:bg-stratosphere/10 border border-stratosphere/20 rounded-full text-xs text-stratosphere font-medium transition-colors"
            >
              {marking ? <Loader2 size={10} className="animate-spin" /> : <ExternalLink size={10} />}
              {task.pageContext.label ?? 'View Review'}
            </button>
          )}
          {task.contextLink?.href && (
            <a
              href={task.contextLink.href}
              onClick={(e) => {
                e.stopPropagation();
                if (!task.read) markNotificationRead(task._id).then(() => onRead(task._id));
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-concrete-100 hover:bg-concrete-200 rounded-full text-xs text-concrete-900 transition-colors"
            >
              <ExternalLink size={10} />
              View source
            </a>
          )}
        </div>

        {/* Deadline */}
        {deadline && (
          <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[11px] font-medium ${
            deadline.overdue ? 'bg-red-50 text-red-600' : 'bg-ochre/10 text-ochre-900'
          }`}>
            {deadline.overdue ? <AlertTriangle size={10} /> : <Clock size={10} />}
            {deadline.label}
          </div>
        )}

        <p className="text-[11px] text-concrete-700 mt-1.5">{timeAgo(task.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!task.read && <div className="flex-shrink-0 w-2 h-2 rounded-full bg-ochre mt-1" />}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function TaskFeed() {
  const [tasks, setTasks]       = useState<Notification[]>([]);
  const [loading, setLoading]   = useState(true);
  const [hasMore, setHasMore]   = useState(false);
  const [page, setPage]         = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchPage = useCallback(async (pageNum: number, reset = false) => {
    try {
      setLoading(true);
      const res = await getNotifications({ type: 'input_request', page: pageNum, limit: 20 });
      setTasks((prev) => reset ? res.data : [...prev, ...res.data]);
      setHasMore(pageNum < res.pages);
      setPage(pageNum);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(1, true); }, [fetchPage]);

  const handleRead = (id: string) => {
    setTasks((prev) => prev.map((t) => t._id === id ? { ...t, read: true } : t));
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setTasks((prev) => prev.map((t) => ({ ...t, read: true })));
    } finally {
      setMarkingAll(false);
    }
  };

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting && hasMore && !loading) fetchPage(page + 1); },
        { threshold: 0.5 }
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasMore, loading, page, fetchPage]
  );

  const unread = tasks.filter((t) => !t.read).length;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-concrete-100 flex-shrink-0">
        <span className="text-xs font-medium text-concrete-700">
          {unread > 0 ? `${unread} pending` : 'No pending tasks'}
        </span>
        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-1 text-xs text-sky-500 hover:text-stratosphere font-medium transition-colors disabled:opacity-50"
          >
            {markingAll ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={13} />}
            Mark all done
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && tasks.length === 0 && (
          <div className="flex justify-center py-16">
            <Loader2 size={18} className="animate-spin text-concrete-700" />
          </div>
        )}

        {tasks.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-concrete-50 border border-concrete-200 flex items-center justify-center">
              <ClipboardList size={22} className="text-concrete-700" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-concrete-900">No pending tasks</p>
              <p className="text-xs text-concrete-700 mt-0.5 px-6">
                When a colleague asks for your input on a review, it'll appear here.
              </p>
            </div>
          </div>
        )}

        {tasks.map((task) => (
          <TaskRow key={task._id} task={task} onRead={handleRead} />
        ))}

        {hasMore && (
          <div ref={sentinelRef} className="py-4 flex justify-center">
            {loading && <Loader2 size={16} className="animate-spin text-concrete-700" />}
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
}
