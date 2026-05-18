'use client';

// components/inbox/NotificationFeed.tsx
import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, AtSign, MessageSquare, CheckCheck, Loader2, ExternalLink } from 'lucide-react';
import { useInboxStore } from '@/stores/useInboxStore';
import type { Notification } from '@/lib/api/inbox';
import { formatDistanceToNow } from 'date-fns';

// ─── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

function notificationIcon(type: Notification['type']) {
  switch (type) {
    case 'mention_in_message':
    case 'mention_on_page':
      return <AtSign size={14} className="text-ochre" />;
    case 'new_message':
      return <MessageSquare size={14} className="text-sky-500" />;
    default:
      return <Bell size={14} className="text-concrete-900" />;
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
  const router = useRouter();
  const markNotificationRead = useInboxStore((s) => s.markNotificationRead);
  const openConversation = useInboxStore((s) => s.openConversation);
  const openPanel = useInboxStore((s) => s.openPanel);

  const handleClick = async () => {
    if (!notification.read) {
      await markNotificationRead(notification._id);
    }

    // Navigate based on type
    if (
      (notification.type === 'new_message' || notification.type === 'mention_in_message') &&
      notification.conversation
    ) {
      openConversation(notification.conversation);
      openPanel('messages');
      return;
    }

    if (notification.contextLink?.href) {
      router.push(notification.contextLink.href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full text-left px-4 py-3.5 flex gap-3 items-start
        transition-colors duration-100 group
        ${notification.read
          ? 'bg-white hover:bg-sky-50'
          : 'bg-sky-50 hover:bg-sky-100 border-l-2 border-l-sky-500'
        }
      `}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stratosphere flex items-center justify-center text-white text-xs font-semibold uppercase">
        {notification.triggeredBy?.name?.[0] ?? '?'}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stratosphere leading-snug">
          <span className="font-semibold">{notification.triggeredBy?.name ?? 'Someone'}</span>
          {' '}
          <span className="text-concrete-900">{notificationLabel(notification.type)}</span>
        </p>

        {/* Preview */}
        {notification.preview && (
          <p className="text-xs text-concrete-900 mt-0.5 line-clamp-2">
            {notification.preview}
          </p>
        )}

        {/* Context link chip */}
        {notification.contextLink && (
          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-sky rounded text-xs text-stratosphere font-medium group-hover:border-sky-500 transition-colors">
            {notificationIcon(notification.type)}
            <span className="truncate max-w-[180px]">{notification.contextLink.label}</span>
            <ExternalLink size={10} className="flex-shrink-0 opacity-50" />
          </div>
        )}

        <p className="text-[11px] text-concrete-900 mt-1">
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-ochre mt-1.5" />
      )}
    </button>
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

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load notifications when the feed mounts
  useEffect(() => {
    fetchNotifications({ reset: true });
  }, [fetchNotifications]);

  // Infinite scroll sentinel
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

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-sky bg-white">
        <span className="text-xs font-medium text-concrete-900">
          {unreadNotifications > 0
            ? `${unreadNotifications} unread`
            : 'All caught up'}
        </span>
        {unreadNotifications > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1 text-xs text-sky-500 hover:text-stratosphere transition-colors"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-sky">
        {notifications.length === 0 && !notificationsLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-sky-tint border border-sky flex items-center justify-center">
              <Bell size={20} className="text-concrete-900" />
            </div>
            <p className="text-sm text-concrete-900">No notifications yet</p>
          </div>
        )}

        {notifications.map((n) => (
          <NotificationRow key={n._id} notification={n} />
        ))}

        {/* Infinite scroll sentinel */}
        {notificationsHasMore && (
          <div ref={observerRef} className="py-3 flex justify-center">
            {notificationsLoading && <Loader2 size={16} className="animate-spin text-concrete-900" />}
          </div>
        )}

        {/* Bottom padding so last item isn't flush */}
        <div className="h-4" />
      </div>
    </div>
  );
}