'use client';

// components/inbox/InboxPanel.tsx
import { X, MessageSquare, Bell } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInboxStore, selectTotalUnread } from '@/stores/useInboxStore';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import NotificationFeed from './NotificationFeed';

export default function InboxPanel() {
  const isPanelOpen = useInboxStore((s) => s.isPanelOpen);
  const closePanel = useInboxStore((s) => s.closePanel);
  const activeTab = useInboxStore((s) => s.activeTab);
  const setActiveTab = useInboxStore((s) => s.setActiveTab);
  const activeConversationId = useInboxStore((s) => s.activeConversationId);
  const unreadCount = useInboxStore((s) => s.unreadCount);
  const totalUnread = useInboxStore(selectTotalUnread);

  return (
    <Sheet
      open={isPanelOpen}
      onOpenChange={(open) => {
        if (!open) closePanel();
      }}
    >
      <SheetContent
        side="right"
        // Hide the default shadcn close button — we render our own
        className="p-0 w-[380px] sm:w-[420px] flex flex-col bg-white border-l border-sky [&>button]:hidden"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <SheetHeader className="flex-shrink-0 bg-stratosphere px-4 pt-4 pb-0 space-y-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-base font-semibold text-white m-0">
                Inbox
              </SheetTitle>
              {totalUnread > 0 && (
                <Badge className="bg-ochre text-white text-[10px] font-bold px-1.5 py-0 h-5 rounded-full">
                  {totalUnread > 99 ? '99+' : totalUnread} new
                </Badge>
              )}
            </div>

            {/* ── Close button ────────────────────────────────────────── */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closePanel}
              className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
              aria-label="Close inbox"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex">
            <TabButton
              label="Messages"
              icon={<MessageSquare size={14} />}
              count={unreadCount.messages}
              active={activeTab === 'messages'}
              onClick={() => setActiveTab('messages')}
            />
            <TabButton
              label="Notifications"
              icon={<Bell size={14} />}
              count={unreadCount.notifications}
              active={activeTab === 'notifications'}
              onClick={() => setActiveTab('notifications')}
            />
          </div>
        </SheetHeader>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'messages' && (
            <>
              {/* Conversation list — slides out left when a conversation is open */}
              <div
                className={`
                  absolute inset-0 transition-transform duration-200 ease-in-out
                  ${activeConversationId ? '-translate-x-full' : 'translate-x-0'}
                `}
              >
                <ConversationList />
              </div>

              {/* Conversation view — slides in from right */}
              <div
                className={`
                  absolute inset-0 transition-transform duration-200 ease-in-out
                  ${activeConversationId ? 'translate-x-0' : 'translate-x-full'}
                `}
              >
                {activeConversationId && <ConversationView />}
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="absolute inset-0">
              <NotificationFeed />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  label,
  icon,
  count,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium
        border-b-2 transition-colors
        ${active
          ? 'border-b-white text-white'
          : 'border-b-transparent text-white/60 hover:text-white/90'
        }
      `}
    >
      {icon}
      {label}
      {count > 0 && (
        <Badge
          className={`
            text-[10px] font-bold px-1.5 py-0 h-4 rounded-full leading-none
            ${active ? 'bg-white text-stratosphere' : 'bg-white/20 text-white'}
          `}
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </button>
  );
}