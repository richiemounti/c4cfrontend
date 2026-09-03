'use client';

// components/inbox/ConversationList.tsx
import { useEffect, useState, useRef } from 'react';
import { Search, Plus, Loader2, MessageSquareDashed, ArrowLeft, Users, X } from 'lucide-react';
import { useInboxStore } from '@/stores/useInboxStore';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import { Input } from '@/components/ui/input';
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
  } catch { return ''; }
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-stratosphere', 'bg-sky-600', 'bg-teal-600',
    'bg-violet-600',   'bg-rose-600', 'bg-amber-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── New conversation modal ───────────────────────────────────────────────────

function NewConversationModal({
  onClose,
  organizationId,
  isStaff,
}: {
  onClose: () => void;
  organizationId: string;
  isStaff: boolean;
}) {
  const [mode, setMode] = useState<'direct' | 'group'>('direct');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selected, setSelected] = useState<Map<string, string>>(new Map()); // userId -> name
  const [creating, setCreating] = useState(false);
  const [orgOptions, setOrgOptions] = useState<{ _id: string; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const startConversation = useInboxStore((s) => s.startConversation);
  const openConversation  = useInboxStore((s) => s.openConversation);
  const startingRef = useRef(false);

  // Staff accounts aren't tied to a single organisation — they must pick which
  // org a new conversation belongs to (the backend can't infer it if every
  // participant they message is also staff).
  const effectiveOrgId = isStaff ? selectedOrgId : organizationId;

  useEffect(() => {
    if (!isStaff) return;
    (async () => {
      try {
        const { getOrganizations } = await import('@/lib/api/organization');
        const res = await getOrganizations(1, 100);
        setOrgOptions(res.data.map((o: any) => ({ _id: o._id, name: o.name })));
      } catch { setOrgOptions([]); }
    })();
  }, [isStaff]);

  useEffect(() => {
    if (!search.trim()) { setUsers([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const { getMentionableUsers } = await import('@/lib/api/inbox');
        const res = await getMentionableUsers({ organizationId: effectiveOrgId, search, limit: 8 });
        setUsers(res.data);
      } catch { setUsers([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [search, effectiveOrgId]);

  const handleStartDM = async (userId: string, userName: string) => {
    if (startingRef.current) return;
    startingRef.current = true;
    try {
      const conv = await startConversation({ type: 'direct', participantIds: [userId], organizationId: effectiveOrgId });
      openConversation(conv._id);
      onClose();
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      startingRef.current = false;
    }
  };

  const toggleSelected = (userId: string, userName: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(userId)) next.delete(userId);
      else next.set(userId, userName);
      return next;
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selected.size === 0 || creating || (isStaff && !selectedOrgId)) return;
    setCreating(true);
    try {
      const conv = await startConversation({
        type: 'group',
        participantIds: Array.from(selected.keys()),
        organizationId: effectiveOrgId,
        name: groupName.trim(),
      });
      openConversation(conv._id);
      onClose();
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="absolute inset-0 z-10 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-concrete-100 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 text-concrete-700 hover:text-stratosphere hover:bg-concrete-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-stratosphere">
          {mode === 'direct' ? 'New Message' : 'New Group'}
        </span>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 px-4 pt-3 flex-shrink-0">
        <button
          onClick={() => setMode('direct')}
          className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
            mode === 'direct' ? 'bg-stratosphere text-white' : 'bg-concrete-50 text-concrete-700 hover:bg-concrete-100'
          }`}
        >
          Direct message
        </button>
        <button
          onClick={() => setMode('group')}
          className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
            mode === 'group' ? 'bg-stratosphere text-white' : 'bg-concrete-50 text-concrete-700 hover:bg-concrete-100'
          }`}
        >
          Group chat
        </button>
      </div>

      {/* Organisation picker — staff only, since staff accounts aren't tied to one org */}
      {isStaff && (
        <div className="px-4 pt-3 flex-shrink-0">
          <select
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="w-full text-sm border border-concrete-200 rounded-lg px-3 py-2 bg-concrete-50 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="">Select an organisation…</option>
            {orgOptions.map((org) => (
              <option key={org._id} value={org._id}>{org.name}</option>
            ))}
          </select>
          {!selectedOrgId && (
            <p className="text-[11px] text-concrete-700 mt-1">
              Pick the organisation this conversation belongs to.
            </p>
          )}
        </div>
      )}

      {/* Group name (group mode only) */}
      {mode === 'group' && (
        <div className="px-4 pt-3 flex-shrink-0">
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Name this group…"
            className="text-sm bg-concrete-50 border-concrete-200 focus-visible:ring-sky-500"
          />
        </div>
      )}

      {/* Selected members (group mode only) */}
      {mode === 'group' && selected.size > 0 && (
        <div className="px-4 pt-2 flex flex-wrap gap-1.5 flex-shrink-0">
          {Array.from(selected.entries()).map(([userId, name]) => (
            <span
              key={userId}
              className="flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-700 text-xs rounded-full"
            >
              {name}
              <button onClick={() => toggleSelected(userId, name)} className="hover:text-sky-900">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-700 pointer-events-none" />
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people…"
            className="pl-9 text-sm bg-concrete-50 border-concrete-200 focus-visible:ring-sky-500"
          />
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 size={16} className="animate-spin text-concrete-700" />
          </div>
        )}
        {!loading && search && users.length === 0 && (
          <p className="text-xs text-concrete-700 text-center py-8">No people found</p>
        )}
        {!loading && !search && (
          <p className="text-xs text-concrete-700 text-center py-8">Type a name to search</p>
        )}
        <div className="px-2 py-1">
          {users.map((u) => (
            <button
              key={u._id}
              onClick={() => (mode === 'direct' ? handleStartDM(u._id, u.name) : toggleSelected(u._id, u.name))}
              disabled={mode === 'direct' && isStaff && !selectedOrgId}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-concrete-50 rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'group' && (
                <input
                  type="checkbox"
                  checked={selected.has(u._id)}
                  onChange={() => toggleSelected(u._id, u.name)}
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className={`${getAvatarColor(u.name)} text-white text-sm font-semibold`}>
                  {u.name[0]?.toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-stratosphere truncate">{u.name}</p>
                <p className="text-[11px] text-concrete-700 truncate">
                  {u.primaryRole}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Create group button */}
      {mode === 'group' && (
        <div className="p-4 border-t border-concrete-100 flex-shrink-0">
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selected.size === 0 || creating || (isStaff && !selectedOrgId)}
            className="w-full py-2 rounded-lg text-sm font-medium bg-stratosphere text-white hover:bg-stratosphere-600 transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating…' : `Create group${selected.size > 0 ? ` (${selected.size})` : ''}`}
          </button>
        </div>
      )}
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
  const activeId         = useInboxStore((s) => s.activeConversationId);
  const isActive  = activeId === conversation._id;
  const hasUnread = conversation.unreadCount > 0;

  const otherParticipants = conversation.participants.filter((p) => p._id !== currentUserId);
  const displayName =
    conversation.type === 'group'
      ? (conversation.name ?? 'Group')
      : otherParticipants.map((p) => p.name).join(', ') || 'Conversation';

  const avatarName = conversation.type === 'group'
    ? (conversation.name ?? 'Group')
    : (otherParticipants[0]?.name ?? 'U');

  const lastMsgPreview = conversation.lastMessage?.deleted
    ? 'Message deleted'
    : (conversation.lastMessage?.content ?? 'No messages yet');

  return (
    <button
      onClick={() => openConversation(conversation._id)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 transition-colors text-left rounded-lg mx-1
        ${isActive ? 'bg-sky-50 text-stratosphere' : 'hover:bg-concrete-50'}
      `}
    >
      {/* Avatar with group indicator */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-11 w-11">
          <AvatarFallback className={`${getAvatarColor(avatarName)} text-white text-sm font-bold`}>
            {conversation.type === 'group'
              ? <Users size={18} className="text-white" />
              : avatarName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-ochre rounded-full border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <p className={`text-sm truncate ${hasUnread ? 'font-bold text-stratosphere' : 'font-medium text-concrete-900'}`}>
            {displayName}
          </p>
          <span className={`flex-shrink-0 text-[11px] ${hasUnread ? 'text-ochre font-medium' : 'text-concrete-700'}`}>
            {previewTime(conversation.lastActivityAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={`text-xs truncate ${hasUnread ? 'text-stratosphere font-medium' : 'text-concrete-700'}`}>
            {lastMsgPreview}
          </p>
          {hasUnread && (
            <span className="flex-shrink-0 min-w-[20px] h-5 bg-ochre text-white text-[10px] font-bold rounded-full px-1.5 flex items-center justify-center">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ConversationList() {
  const { user } = useAuth();
  const conversations        = useInboxStore((s) => s.conversations);
  const conversationsLoading = useInboxStore((s) => s.conversationsLoading);
  const [search, setSearch]  = useState('');
  const [showNew, setShowNew] = useState(false);

  const isStaff = (user as any)?.isConnectGoStaff;
  const organizationId: string = isStaff
    ? ''
    : ((user as any)?.roles?.find((r: any) => r.organization)?.organization?.toString() ?? '');

  useEffect(() => {
    useInboxStore.getState().fetchConversations();
  }, []);

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const name = c.type === 'group'
      ? (c.name ?? '')
      : c.participants.filter((p) => p._id !== user?._id).map((p) => p.name).join(' ');
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="relative flex flex-col h-full bg-white">
      {showNew && (
        <NewConversationModal organizationId={organizationId} isStaff={!!isStaff} onClose={() => setShowNew(false)} />
      )}

      {/* Search + compose */}
      <div className="px-4 py-3 border-b border-concrete-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-700 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="pl-9 h-9 text-xs bg-concrete-50 border-concrete-200 focus-visible:ring-sky-500"
            />
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="h-9 w-9 flex items-center justify-center bg-stratosphere hover:bg-stratosphere/90 text-white rounded-lg flex-shrink-0 transition-colors"
            title="New conversation"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="py-2 space-y-0.5">
          {conversationsLoading && conversations.length === 0 && (
            <div className="flex justify-center py-16">
              <Loader2 size={18} className="animate-spin text-concrete-700" />
            </div>
          )}

          {!conversationsLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-concrete-50 border border-concrete-200 flex items-center justify-center">
                <MessageSquareDashed size={22} className="text-concrete-700" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-concrete-900">
                  {search ? 'No conversations found' : 'No conversations yet'}
                </p>
                {!search && (
                  <p className="text-xs text-concrete-700 mt-0.5">Start a new conversation</p>
                )}
              </div>
              {!search && (
                <button
                  onClick={() => setShowNew(true)}
                  className="text-xs text-sky-500 hover:text-stratosphere font-medium transition-colors"
                >
                  + New message
                </button>
              )}
            </div>
          )}

          {filtered.map((c) => (
            <ConversationRow key={c._id} conversation={c} currentUserId={user?._id ?? ''} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
