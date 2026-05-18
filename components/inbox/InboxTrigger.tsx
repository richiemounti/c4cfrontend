'use client';

// components/inbox/InboxTrigger.tsx
import { MessageSquare } from 'lucide-react';
import { useInboxStore, selectTotalUnread } from '@/stores/useInboxStore';

interface InboxTriggerProps {
  /** 'sidebar' — fits inside the DashboardSidebar nav item slot
   *  'floating' — fixed bottom-right pill, visible on all pages */
  variant: 'sidebar' | 'floating';
  collapsed?: boolean; // only used by sidebar variant
}

export default function InboxTrigger({ variant, collapsed = false }: InboxTriggerProps) {
  const openPanel = useInboxStore((s) => s.openPanel);
  const totalUnread = useInboxStore(selectTotalUnread);

  const badge = totalUnread > 0 && (
    <span
      className={`
        absolute flex items-center justify-center
        bg-ochre text-white text-[10px] font-bold leading-none rounded-full
        ${totalUnread > 99 ? 'min-w-[20px] px-1 h-4' : 'w-4 h-4'}
        ${variant === 'sidebar' ? '-top-1 -right-1' : '-top-1.5 -right-1.5'}
      `}
    >
      {totalUnread > 99 ? '99+' : totalUnread}
    </span>
  );

  // ── Sidebar variant ──────────────────────────────────────────────────────
  if (variant === 'sidebar') {
    return (
      <button
        onClick={() => openPanel('messages')}
        className={`
          w-full flex items-center my-1 px-3 py-2 rounded-md transition-colors
          relative group text-sm text-sky-500 hover:text-white hover:bg-stratosphere-500
          ${collapsed ? 'justify-center' : 'justify-start'}
        `}
        title={collapsed ? 'Inbox' : undefined}
      >
        <div className={`relative flex-shrink-0 ${collapsed ? '' : 'mr-2'}`}>
          <MessageSquare size={20} />
          {badge}
        </div>

        {!collapsed && <span className="text-left leading-tight">Inbox</span>}

        {/* Collapsed tooltip */}
        {collapsed && (
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            Inbox
            {totalUnread > 0 && ` (${totalUnread})`}
          </span>
        )}
      </button>
    );
  }

  // ── Floating variant ─────────────────────────────────────────────────────
  return (
    <button
      onClick={() => openPanel('messages')}
      className="
        fixed bottom-6 right-6 z-40
        flex items-center gap-2
        bg-stratosphere text-white
        pl-4 pr-5 py-3 rounded-full
        shadow-lg shadow-stratosphere/30
        hover:bg-stratosphere-900 active:scale-95
        transition-all duration-150
        group
      "
      aria-label="Open inbox"
    >
      <div className="relative">
        <MessageSquare size={20} />
        {badge}
      </div>
      <span className="text-sm font-medium">Inbox</span>
    </button>
  );
}