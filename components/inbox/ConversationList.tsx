'use client';

// components/inbox/ConversationList.tsx
import { useEffect, useState, useRef } from 'react';
import { Search, Plus, Loader2, MessageSquareDashed, ArrowLeft } from 'lucide-react';
import { useInboxStore } from '@/stores/useInboxStore';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Conversation } from '@/lib/api/inbox';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function previewTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'dd/MM');
  } catch {
    return '';
  }
}

// ─── New conversation modal ───────────────────────────────────────────────────

function NewConversationModal({
  onClose,
  organizationId,
}: {
  onClose: () => void;
  organizationId: string;
}) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const startConversation = useInboxStore((s) => s.startConversation);
  const openConversation = useInboxStore((s) => s.openConversation);
  // Track whether a DM start is in progress to prevent double-clicks
  const startingRef = useRef(false);

  useEffect(() => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { getMentionableUsers } = await import('@/lib/api/inbox');
        const res = await getMentionableUsers({ organizationId, search, limit: 8 });
        setUsers(res.data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search, organizationId]);

  const handleStartDM = async (userId: string) => {
    if (startingRef.current) return;
    startingRef.current = true;
    try {
      const conv = await startConversation({
        type: 'direct',
        participantIds: [userId],
        organizationId,
      });
      openConversation(conv._id);
      onClose();
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      startingRef.current = false;
    }
  };

  return (
    <div className="absolute inset-0 z-10 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-sky flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 px-2 text-concrete-900 hover:text-stratosphere"
        >
          <ArrowLeft size={14} className="mr-1" />
          Back
        </Button>
        <span className="text-sm font-semibold text-stratosphere">New Message</span>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 flex-shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-900 pointer-events-none" />
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or username…"
            className="pl-8 text-sm bg-sky-tint border-sky text-stratosphere placeholder:text-concrete-900 focus-visible:ring-sky-500"
          />
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1 mt-2">
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 size={16} className="animate-spin text-concrete-900" />
          </div>
        )}
        {!loading && search && users.length === 0 && (
          <p className="text-xs text-concrete-900 text-center py-6">No users found</p>
        )}
        {users.map((u) => (
          <button
            key={u._id}
            onClick={() => handleStartDM(u._id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-sky-tint transition-colors text-left"
          >
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className="bg-stratosphere text-white text-sm font-semibold">
                {u.name[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-stratosphere truncate">{u.name}</p>
              <p className="text-[11px] text-concrete-900 truncate">
                @{u.userName} · {u.primaryRole}
              </p>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
}

// ─── Conversation row ─────────────────────────────────────────────────────────

function ConversationRow({
  conversation,
  currentUserId,
}: {
  conversation: Conversation;
  currentUserId: string;
}) {
  const openConversation = useInboxStore((s) => s.openConversation);
  const activeId = useInboxStore((s) => s.activeConversationId);

  const isActive = activeId === conversation._id;
  const hasUnread = conversation.unreadCount > 0;

  const displayName =
    conversation.type === 'group'
      ? (conversation.name ?? 'Group')
      : conversation.participants
          .filter((p) => p._id !== currentUserId)
          .map((p) => p.name)
          .join(', ') || 'Conversation';

  const avatarInitial =
    conversation.type === 'group'
      ? (conversation.name?.[0]?.toUpperCase() ?? 'G')
      : (conversation.participants
          .find((p) => p._id !== currentUserId)
          ?.name?.[0]?.toUpperCase() ?? '?');

  const lastMsgPreview = conversation.lastMessage?.deleted
    ? 'Message deleted'
    : (conversation.lastMessage?.content ?? 'No messages yet');

  return (
    <button
      onClick={() => openConversation(conversation._id)}
      className={`
        w-full flex items-start gap-3 px-3 py-3 transition-colors text-left
        border-l-2
        ${isActive ? 'bg-sky-tint border-l-sky-500' : 'hover:bg-sky-50 border-l-transparent'}
      `}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-stratosphere text-white text-sm font-semibold">
            {avatarInitial}
          </AvatarFallback>
        </Avatar>
        {conversation.type === 'group' && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-sky-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">G</span>
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1 mb-0.5">
          <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-stratosphere' : 'font-medium text-stratosphere'}`}>
            {displayName}
          </p>
          <span className="flex-shrink-0 text-[11px] text-concrete-900">
            {previewTime(conversation.lastActivityAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <p className={`text-xs truncate ${hasUnread ? 'text-stratosphere' : 'text-concrete-900'}`}>
            {lastMsgPreview}
          </p>
          {hasUnread && (
            <Badge className="flex-shrink-0 min-w-[18px] h-[18px] bg-ochre text-white text-[10px] font-bold rounded-full px-1 flex items-center justify-center">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ConversationList() {
  const { user } = useAuth();

  // ── FIX: Pull fetchConversations via getState() so it never goes into
  // the useEffect dependency array and causes an infinite re-render loop.
  const conversations = useInboxStore((s) => s.conversations);
  const conversationsLoading = useInboxStore((s) => s.conversationsLoading);

  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);

  const isStaff = (user as any)?.isConnectGoStaff;
  const organizationId: string = isStaff
    ? ''
    : ((user as any)?.roles?.find((r: any) => r.organization)?.organization?.toString() ?? '');

  // ── Safe: getState().fetchConversations is a stable reference ──────────────
  useEffect(() => {
    useInboxStore.getState().fetchConversations();
  }, []);

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const name =
      c.type === 'group'
        ? (c.name ?? '')
        : c.participants
            .filter((p) => p._id !== user?._id)
            .map((p) => p.name)
            .join(' ');
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="relative flex flex-col h-full">
      {showNew && (
        <NewConversationModal
          organizationId={organizationId}
          onClose={() => setShowNew(false)}
        />
      )}

      {/* Search + new */}
      <div className="px-3 py-2.5 border-b border-sky bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-concrete-900 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="pl-8 py-1.5 h-8 text-xs bg-sky-tint border-sky text-stratosphere placeholder:text-concrete-900 focus-visible:ring-sky-500"
            />
          </div>
          <Button
            size="icon"
            onClick={() => setShowNew(true)}
            className="h-8 w-8 flex-shrink-0 bg-stratosphere hover:bg-stratosphere-900 text-white"
            title="New conversation"
          >
            <Plus size={15} />
          </Button>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-sky">
          {conversationsLoading && conversations.length === 0 && (
            <div className="flex justify-center py-10">
              <Loader2 size={18} className="animate-spin text-concrete-900" />
            </div>
          )}

          {!conversationsLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full bg-sky-tint border border-sky flex items-center justify-center">
                <MessageSquareDashed size={20} className="text-concrete-900" />
              </div>
              <p className="text-sm text-concrete-900">
                {search ? 'No conversations found' : 'No conversations yet'}
              </p>
              {!search && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowNew(true)}
                  className="text-xs text-sky-500 hover:text-stratosphere h-auto p-0"
                >
                  Start one
                </Button>
              )}
            </div>
          )}

          {filtered.map((c) => (
            <ConversationRow
              key={c._id}
              conversation={c}
              currentUserId={user?._id ?? ''}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}