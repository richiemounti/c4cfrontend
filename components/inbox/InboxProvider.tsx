// components/inbox/InboxProvider.tsx
'use client';

import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useInboxStore } from '@/stores/useInboxStore';
import { isAuthenticated } from '@/lib/utils/token';

/**
 * Drop this once inside your dashboard layout (or root authenticated layout).
 * It boots the socket connection and fetches the initial unread count.
 * No visible UI — purely a data/connection layer.
 *
 * Example placement in app/dashboard/layout.tsx:
 *
 *   import InboxProvider from '@/components/inbox/InboxProvider';
 *
 *   export default function DashboardLayout({ children }) {
 *     return (
 *       <>
 *         <InboxProvider />
 *         {children}
 *       </>
 *     );
 *   }
 */
export default function InboxProvider() {
  // Boots socket and registers all event handlers
  useSocket();

  const fetchUnreadCount = useInboxStore((s) => s.fetchUnreadCount);
  const fetchConversations = useInboxStore((s) => s.fetchConversations);

  useEffect(() => {
    if (!isAuthenticated()) return;

    // Hydrate on mount
    fetchUnreadCount();
    fetchConversations();

    // Refresh unread count every 60 seconds as a fallback
    // (socket handles real-time; this is a safety net for missed events)
    const interval = setInterval(fetchUnreadCount, 60_000);

    // Listen for the auth:logout event — reset store state
    const handleLogout = () => {
      useInboxStore.setState({
        conversations: [],
        messages: [],
        notifications: [],
        unreadCount: { notifications: 0, messages: 0, total: 0 },
        activeConversationId: null,
        isPanelOpen: false,
      });
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      clearInterval(interval);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [fetchUnreadCount, fetchConversations]);

  return null;
}