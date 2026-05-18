'use client';

// components/inbox/NotificationBell.tsx
import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useInboxStore } from '@/stores/useInboxStore';
import NotificationFeed from './NotificationFeed';

export default function NotificationBell() {
  const unreadCount = useInboxStore((s) => s.unreadCount.notifications);
  const fetchUnreadCount = useInboxStore((s) => s.fetchUnreadCount);

  // Ensure count is hydrated (InboxProvider may not be mounted on admin pages)
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-ochre text-white text-[10px] font-bold rounded-full leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="p-0 w-[380px] h-[480px] flex flex-col overflow-hidden rounded-xl border border-sky shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-stratosphere flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-white" />
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-ochre text-white text-[10px] font-bold rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-hidden">
          <NotificationFeed />
        </div>
      </PopoverContent>
    </Popover>
  );
}