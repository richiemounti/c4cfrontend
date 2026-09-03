'use client';

// components/inbox/NotificationFeed.tsx
import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, AtSign, MessageSquare, CheckCheck, Loader2,
  ExternalLink, ClipboardCheck, Info,
} from 'lucide-react';
import { useInboxStore } from '@/stores/useInboxStore';
import type { Notification } from '@/lib/api/inbox';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); } catch { return ''; }
}

function dateGroup(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'EEEE, d MMMM');
  } catch { return 'Earlier'; }
}

function groupNotificationsByDate(items: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = [];
  let currentLabel = '';
  for (const n of items) {
    const label = dateGroup(n.createdAt);
    if (label !== currentLabel) {
      groups.push({ label, items: [] });
      currentLabel = label;
    }
    groups[groups.length - 1].items.push(n);
  }
  return groups;
}

type IconConfig = { icon: React.ReactNode; bg: string; color: string };

function getIconConfig(type: Notification['type']): IconConfig {
  switch (type) {
    case 'mention_in_message':
    case 'mention_on_page':
      return { icon: <AtSign size={13} />, bg: 'bg-ochre/10', color: 'text-ochre' };
    case 'new_message':
      return { icon: <MessageSquare size={13} />, bg: 'bg-sky-100', color: 'text-sky-600' };
    default:
      // review notifications or generic
      return { icon: <ClipboardCheck size={13} />, bg: 'bg-stratosphere/10', color: 'text-stratosphere' };
  }
}

function notificationLabel(type: Notification['type']) {
  switch (type) {
    case 'mention_in_message': return 'mentioned you in a message';
    case 'mention_on_page':    return 'mentioned you';
    case 'new_message':        return 'sent you a message';
    default:                   return 'sent a notification';
  }
}

// ─── Single notification row ─────────────────────────────────────────────────

function NotificationRow({ notification }: { notification: Notification }) {
  const router               = useRouter();
  const markNotificationRead = useInboxStore((s) => s.markNotificationRead);
  const openConversation     = useInboxStore((s) => s.openConversation);
  const openPanel            = useInboxStore((s) => s.openPanel);

  const isReviewNotification = notification.pageContext?.resourceType === 'review';
  const { icon, bg, color }  = getIconConfig(notification.type);

  const markRead = async () => {
    if (!notification.read) await markNotificationRead(notification._id);
  };

  const handleClick = async () => {
    await markRead();
    if (
      (notification.type === 'new_message' || notification.type === 'mention_in_message') &&
      notification.conversation
    ) {
      openConversation(notification.conversation);
      openPanel('messages');
      return;
    }
    if (isReviewNotification && notification.pageContext?.href) {
      router.push(notification.pageContext.href);
      return;
    }
    if (notification.contextLink?.href) {
      router.push(notification.contextLink.href);
    }
  };

  return (
    <div className={`
      relative px-4 py-3.5 flex gap-3 items-start transition-colors duration-100
      ${notification.read ? 'hover:bg-concrete-50' : 'bg-sky-50/60 hover:bg-sky-50'}
    `}>
      {/* Unread accent */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sky-500 rounded-r" />
      )}

      {/* Icon circle */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full ${bg} flex items-center justify-center`}>
        <span className={color}>{icon}</span>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <button onClick={handleClick} className="w-full text-left">
          <p className="text-sm text-stratosphere leading-snug">
            <span className="font-semibold">{notification.triggeredBy?.name ?? 'Someone'}</span>
            {' '}
            <span className="text-concrete-700">{notificationLabel(notification.type)}</span>
          </p>
          {notification.preview && (
            <p className="text-xs text-concrete-700 mt-0.5 line-clamp-2 leading-relaxed">
              {notification.preview}
            </p>
          )}
        </button>

        {/* Action links */}
        {isReviewNotification ? (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {notification.pageContext?.href && (
              <button
                onClick={handleClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stratosphere/5 hover:bg-stratosphere/10 border border-stratosphere/20 rounded-full text-xs text-stratosphere font-medium transition-colors"
              >
                <ClipboardCheck size={11} />
                View Review
              </button>
            )}
            {notification.contextLink?.href && (
              <a
                href={notification.contextLink.href}
                onClick={(e) => { e.stopPropagation(); markRead(); }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-concrete-100 hover:bg-concrete-200 rounded-full text-xs text-concrete-900 transition-colors"
              >
                <ExternalLink size={10} />
                View source
              </a>
            )}
          </div>
        ) : notification.contextLink ? (
          <button
            onClick={handleClick}
            className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-concrete-100 hover:bg-concrete-200 rounded-full text-xs text-concrete-900 font-medium transition-colors"
          >
            <ExternalLink size={10} className="flex-shrink-0" />
            <span className="truncate max-w-[180px]">{notification.contextLink.label}</span>
          </button>
        ) : null}

        <p className="text-[11px] text-concrete-700 mt-1.5">{timeAgo(notification.createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-ochre mt-1" />
      )}
    </div>
  );
}

// ─── Date section header ──────────────────────────────────────────────────────

function DateSectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 py-2 bg-concrete-50 border-y border-concrete-100">
      <p className="text-[11px] font-semibold text-concrete-700 uppercase tracking-wide">{label}</p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function NotificationFeed() {
  const {
    notifications,
    notificationsLoading,
    notificationsHasMore,
    fetchNotifications,
    fetchMoreNotifications,
    markAllNotificationsRead,
    unreadCount,
  } = useInboxStore();

  useEffect(() => {
    fetchNotifications({ reset: true });
  }, [fetchNotifications]);

  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) fetchMoreNotifications(); },
        { threshold: 0.5 }
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [fetchMoreNotifications]
  );

  const unreadNotifications = unreadCount.notifications;
  const filtered = notifications.filter((n) => n.type !== 'input_request');
  const groups = groupNotificationsByDate(filtered);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-concrete-100 flex-shrink-0">
        <span className="text-xs font-medium text-concrete-700">
          {unreadNotifications > 0
            ? `${unreadNotifications} unread`
            : 'All caught up'}
        </span>
        {unreadNotifications > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1 text-xs text-sky-500 hover:text-stratosphere font-medium transition-colors"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 && !notificationsLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-concrete-50 border border-concrete-200 flex items-center justify-center">
              <Bell size={22} className="text-concrete-700" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-concrete-900">You're all caught up!</p>
              <p className="text-xs text-concrete-700 mt-0.5">No notifications right now</p>
            </div>
          </div>
        )}

        {notificationsLoading && notifications.length === 0 && (
          <div className="flex justify-center py-16">
            <Loader2 size={18} className="animate-spin text-concrete-700" />
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label}>
            <DateSectionHeader label={group.label} />
            {group.items.map((n) => (
              <NotificationRow key={n._id} notification={n} />
            ))}
          </div>
        ))}

        {notificationsHasMore && (
          <div ref={observerRef} className="py-4 flex justify-center">
            {notificationsLoading && <Loader2 size={16} className="animate-spin text-concrete-700" />}
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
}
