'use client';

// components/inbox/InboxPanel.tsx
import { useEffect } from 'react';
import { X, MessageSquare, Bell, ClipboardList, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useInboxStore, selectTotalUnread } from '@/stores/useInboxStore';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';
import NotificationFeed from './NotificationFeed';
import TaskFeed from './TaskFeed';

export default function InboxPanel() {
  const isPanelOpen   = useInboxStore((s) => s.isPanelOpen);
  const closePanel    = useInboxStore((s) => s.closePanel);
  const activeTab     = useInboxStore((s) => s.activeTab);
  const setActiveTab  = useInboxStore((s) => s.setActiveTab);
  const activeConversationId = useInboxStore((s) => s.activeConversationId);
  const unreadCount   = useInboxStore((s) => s.unreadCount);
  const tasksUnreadCount = useInboxStore((s) => s.tasksUnreadCount);
  const totalUnread   = useInboxStore(selectTotalUnread);

  // Body scroll-lock + Escape key
  useEffect(() => {
    if (!isPanelOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [isPanelOpen, closePanel]);

  const TABS = [
    { id: 'messages',      label: 'Messages',      icon: MessageSquare, count: unreadCount.messages },
    { id: 'notifications', label: 'Alerts',         icon: Bell,          count: unreadCount.notifications },
    { id: 'tasks',         label: 'Tasks',          icon: ClipboardList, count: tasksUnreadCount },
  ] as const;

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={closePanel}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex-shrink-0 border-b border-concrete-100">
              {/* Top row */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-stratosphere flex items-center justify-center">
                    <Inbox size={14} className="text-white" />
                  </div>
                  <span className="text-base font-semibold text-stratosphere">Inbox</span>
                  {totalUnread > 0 && (
                    <Badge className="bg-ochre text-white text-[10px] font-bold px-1.5 py-0 h-5 rounded-full">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={closePanel}
                  className="p-1.5 text-concrete-700 hover:text-stratosphere hover:bg-concrete-100 rounded-lg transition-colors"
                  aria-label="Close inbox"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tab row */}
              <div className="flex items-center gap-1 px-4 pb-3">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                        transition-all duration-150
                        ${active
                          ? 'bg-stratosphere text-white shadow-sm'
                          : 'text-concrete-900 hover:bg-concrete-100 hover:text-stratosphere'
                        }
                      `}
                    >
                      <Icon size={13} />
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`
                          min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold leading-4 text-center
                          ${active ? 'bg-white/25 text-white' : 'bg-ochre text-white'}
                        `}>
                          {tab.count > 99 ? '99+' : tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Body ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden relative">
              {activeTab === 'messages' && (
                <>
                  <div className={`absolute inset-0 transition-transform duration-200 ease-in-out ${
                    activeConversationId ? '-translate-x-full' : 'translate-x-0'
                  }`}>
                    <ConversationList />
                  </div>
                  <div className={`absolute inset-0 transition-transform duration-200 ease-in-out ${
                    activeConversationId ? 'translate-x-0' : 'translate-x-full'
                  }`}>
                    {activeConversationId && <ConversationView />}
                  </div>
                </>
              )}
              {activeTab === 'notifications' && (
                <div className="absolute inset-0"><NotificationFeed /></div>
              )}
              {activeTab === 'tasks' && (
                <div className="absolute inset-0"><TaskFeed /></div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
