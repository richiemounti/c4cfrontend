'use client';

// components/inbox/ConversationView.tsx
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  ArrowLeft, MoreVertical, Loader2, ExternalLink,
  Pencil, Trash2, Check, CheckCheck, Users, Search,
} from 'lucide-react';
import { useInboxStore, selectActiveConversation, selectActiveTypingUsers } from '@/stores/useInboxStore';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import MessageComposer from './MessageComposer';
import type { Message } from '@/lib/api/inbox';
import { format, isToday, isYesterday } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMessageTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return `Yesterday ${format(d, 'HH:mm')}`;
    return format(d, 'dd MMM, HH:mm');
  } catch { return ''; }
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { label: string; messages: Message[] }[] = [];
  let currentLabel = '';
  for (const msg of messages) {
    try {
      const d = new Date(msg.createdAt);
      const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'EEEE, d MMMM');
      if (label !== currentLabel) {
        groups.push({ label, messages: [] });
        currentLabel = label;
      }
      groups[groups.length - 1].messages.push(msg);
    } catch { /* skip */ }
  }
  return groups;
}

function getAvatarColor(name: string) {
  const colors = ['bg-stratosphere', 'bg-sky-600', 'bg-teal-600', 'bg-violet-600', 'bg-rose-600', 'bg-amber-600'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message, isMine, showAvatar, showSenderName,
}: {
  message: Message; isMine: boolean; showAvatar: boolean; showSenderName: boolean;
}) {
  const { user } = useAuth();
  const editMessage   = useInboxStore((s) => s.editMessage);
  const deleteMessage = useInboxStore((s) => s.deleteMessage);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const readByCount = message.readBy.filter((r) => r.user !== user?._id).length;
  const senderName = message.sender?.name ?? '?';

  const handleEditSave = async () => {
    if (!editContent.trim() || editContent === message.content) { setEditing(false); return; }
    await editMessage(message._id, editContent.trim());
    setEditing(false);
  };

  if (message.deleted) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1 px-4`}>
        <p className="text-xs text-concrete-700 italic px-3 py-1.5 bg-concrete-100 rounded-2xl">
          Message deleted
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 px-4 group ${isMine ? 'flex-row-reverse' : 'flex-row'} ${showAvatar ? 'mb-1' : 'mb-0.5'}`}>

      {/* Avatar slot */}
      <div className="flex-shrink-0 w-8">
        {!isMine && showAvatar && (
          <Avatar className="w-8 h-8">
            <AvatarFallback className={`${getAvatarColor(senderName)} text-white text-xs font-bold`}>
              {senderName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Bubble column */}
      <div className={`relative max-w-[72%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {/* Sender name for group conversations */}
        {!isMine && showSenderName && (
          <span className="text-[11px] text-concrete-700 mb-1 ml-1 font-semibold">
            {senderName}
          </span>
        )}

        <div className="relative flex items-end gap-1">
          {/* Edit/delete menu */}
          {isMine && !message.deleted && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 text-concrete-700 hover:text-stratosphere hover:bg-concrete-100 rounded-md transition-colors">
                    <MoreVertical size={13} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[120px]">
                  <DropdownMenuItem onClick={() => setEditing(true)} className="text-xs gap-2">
                    <Pencil size={12} /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteMessage(message._id)}
                    className="text-xs gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 size={12} /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Bubble body */}
          <div className={`
            px-3.5 py-2.5 text-sm leading-relaxed shadow-sm
            ${isMine
              ? 'bg-stratosphere text-white rounded-2xl rounded-br-md'
              : 'bg-white border border-concrete-100 text-concrete-900 rounded-2xl rounded-bl-md'
            }
          `}>
            {editing ? (
              <div className="flex flex-col gap-2 min-w-[200px]">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-white/20 text-white placeholder-white/60 text-sm rounded-lg p-1.5 resize-none outline-none w-full border border-white/30"
                  rows={2}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave(); }
                    if (e.key === 'Escape') setEditing(false);
                  }}
                />
                <div className="flex gap-1 justify-end">
                  <button onClick={() => setEditing(false)} className="text-[11px] text-white/70 hover:text-white px-2 py-0.5 rounded transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleEditSave} className="text-[11px] bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded transition-colors">
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap break-words">{message.content}</p>

                {message.contextLink && (
                  <a
                    href={message.contextLink.href}
                    className={`
                      mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium
                      ${isMine
                        ? 'bg-white/15 text-white hover:bg-white/25'
                        : 'bg-concrete-50 border border-concrete-200 text-stratosphere hover:bg-concrete-100'
                      }
                      transition-colors
                    `}
                  >
                    <ExternalLink size={11} className="flex-shrink-0" />
                    <span className="truncate">{message.contextLink.label}</span>
                  </a>
                )}

                {message.editedAt && (
                  <span className={`text-[10px] block mt-0.5 ${isMine ? 'text-white/40' : 'text-concrete-700'}`}>
                    edited
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Timestamp + read receipt */}
        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-concrete-700">{formatMessageTime(message.createdAt)}</span>
          {isMine && (
            readByCount > 0
              ? <CheckCheck size={12} className="text-sky-500" />
              : <Check size={12} className="text-concrete-700" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 bg-concrete-700 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <span className="text-xs text-concrete-700 italic">
        {names.length === 1 ? `${names[0]} is typing` : `${names.slice(0, 2).join(', ')} are typing`}
      </span>
    </div>
  );
}

// ─── Manage members panel ──────────────────────────────────────────────────────

function ManageMembersPanel({
  conversation,
  currentUserId,
  onClose,
}: {
  conversation: NonNullable<ReturnType<typeof selectActiveConversation>>;
  currentUserId?: string;
  onClose: () => void;
}) {
  const addParticipant = useInboxStore((s) => s.addParticipant);
  const removeParticipant = useInboxStore((s) => s.removeParticipant);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const { getMentionableUsers } = await import('@/lib/api/inbox');
        const res = await getMentionableUsers({ organizationId: conversation.organization, search, limit: 8 });
        const existingIds = new Set(conversation.participants.map((p) => p._id));
        setResults(res.data.filter((u: any) => !existingIds.has(u._id)));
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [search, conversation.organization, conversation.participants]);

  const handleAdd = async (userId: string) => {
    setBusyUserId(userId);
    try {
      await addParticipant(conversation._id, userId);
      setSearch('');
      setResults([]);
    } catch (err) {
      console.error('Failed to add member:', err);
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRemove = async (userId: string) => {
    setBusyUserId(userId);
    try {
      await removeParticipant(conversation._id, userId);
    } catch (err) {
      console.error('Failed to remove member:', err);
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className="absolute inset-0 z-20 bg-white flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-concrete-100 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 text-concrete-700 hover:text-stratosphere hover:bg-concrete-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-stratosphere">
          Members ({conversation.participants.length})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Current members */}
        <div className="px-2 py-2">
          {conversation.participants.map((p) => (
            <div key={p._id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className={`${getAvatarColor(p.name)} text-white text-sm font-semibold`}>
                  {p.name[0]?.toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stratosphere truncate">
                  {p.name} {p._id === currentUserId && <span className="text-concrete-700">(you)</span>}
                </p>
                <p className="text-[11px] text-concrete-700 truncate">{p.primaryRole}</p>
              </div>
              <button
                onClick={() => handleRemove(p._id)}
                disabled={busyUserId === p._id}
                className="text-xs text-clay-600 hover:text-clay-900 hover:underline disabled:opacity-50 flex-shrink-0"
              >
                {p._id === currentUserId ? 'Leave' : 'Remove'}
              </button>
            </div>
          ))}
        </div>

        {/* Add people */}
        <div className="px-4 pt-2 pb-1 border-t border-concrete-100">
          <p className="text-xs font-medium text-concrete-700 mb-2">Add people</p>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-700 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people…"
              className="pl-9 text-sm bg-concrete-50 border-concrete-200 focus-visible:ring-sky-500"
            />
          </div>
        </div>

        {searching && (
          <div className="flex justify-center py-4">
            <Loader2 size={16} className="animate-spin text-concrete-700" />
          </div>
        )}

        <div className="px-2 py-1">
          {results.map((u) => (
            <button
              key={u._id}
              onClick={() => handleAdd(u._id)}
              disabled={busyUserId === u._id}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-concrete-50 rounded-lg transition-colors text-left disabled:opacity-50"
            >
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className={`${getAvatarColor(u.name)} text-white text-sm font-semibold`}>
                  {u.name[0]?.toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-stratosphere truncate">{u.name}</p>
                <p className="text-[11px] text-concrete-700 truncate">{u.primaryRole}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ConversationView({ onBack }: { onBack?: () => void } = {}) {
  const { user } = useAuth();
  const conversation         = useInboxStore(selectActiveConversation);
  const typingUsers          = useInboxStore(selectActiveTypingUsers);
  const messages             = useInboxStore((s) => s.messages);
  const messagesLoading      = useInboxStore((s) => s.messagesLoading);
  const activeConversationId = useInboxStore((s) => s.activeConversationId);
  const closeConversation    = useInboxStore((s) => s.closeConversation);
  const [showMembers, setShowMembers] = useState(false);

  const handleBack = useCallback(() => {
    closeConversation();
    onBack?.();
  }, [closeConversation, onBack]);

  const { joinConversation, leaveConversation } = useSocket();
  const bottomRef          = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight   = useRef(0);

  useEffect(() => {
    if (!activeConversationId) return;
    joinConversation(activeConversationId);
    return () => leaveConversation(activeConversationId);
  }, [activeConversationId, joinConversation, leaveConversation]);

  useEffect(() => {
    if (!messagesLoading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, messagesLoading]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const newScrollHeight = container.scrollHeight;
    if (prevScrollHeight.current > 0) {
      container.scrollTop = newScrollHeight - prevScrollHeight.current;
    }
    prevScrollHeight.current = newScrollHeight;
  }, [messages.length]);

  const topSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = topSentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const { messagesHasMore, messagesLoading } = useInboxStore.getState();
          if (messagesHasMore && !messagesLoading) {
            prevScrollHeight.current = scrollContainerRef.current?.scrollHeight ?? 0;
            useInboxStore.getState().loadMoreMessages();
          }
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!conversation) return null;

  const groups = groupMessagesByDate(messages);
  const typingNames = typingUsers.map((t) => t.userName);
  const otherParticipants = conversation.participants.filter((p) => p._id !== user?._id);
  const displayName =
    conversation.type === 'group'
      ? (conversation.name ?? 'Group')
      : otherParticipants.map((p) => p.name).join(', ') || 'Conversation';
  const isGroup = conversation.type === 'group';
  const avatarName = isGroup ? (conversation.name ?? 'G') : (otherParticipants[0]?.name ?? 'U');

  return (
    <div className="relative flex flex-col h-full bg-white">
      {showMembers && isGroup && (
        <ManageMembersPanel conversation={conversation} currentUserId={user?._id} onClose={() => setShowMembers(false)} />
      )}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-concrete-100 bg-white flex-shrink-0">
        <button
          onClick={handleBack}
          className="p-1.5 text-concrete-700 hover:text-stratosphere hover:bg-concrete-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft size={17} />
        </button>

        <Avatar className="w-9 h-9 flex-shrink-0">
          <AvatarFallback className={`${getAvatarColor(avatarName)} text-white text-sm font-bold`}>
            {isGroup ? <Users size={16} className="text-white" /> : avatarName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stratosphere truncate">{displayName}</p>
          {isGroup ? (
            <button
              onClick={() => setShowMembers(true)}
              className="text-[11px] text-concrete-700 hover:text-sky-600 hover:underline truncate"
            >
              {conversation.participants.length} members
            </button>
          ) : (
            <p className="text-[11px] text-concrete-700 truncate">
              {otherParticipants[0]?.primaryRole ?? ''}
            </p>
          )}
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────────────── */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto py-4 bg-slate-50">
        <div ref={topSentinelRef} className="h-1" />

        {messagesLoading && messages.length === 0 && (
          <div className="flex justify-center py-12">
            <Loader2 size={20} className="animate-spin text-concrete-700" />
          </div>
        )}
        {messagesLoading && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <Loader2 size={14} className="animate-spin text-concrete-700" />
          </div>
        )}
        {messages.length === 0 && !messagesLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-2 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-concrete-200 flex items-center justify-center shadow-sm">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm font-medium text-concrete-900">Say hello to {displayName}</p>
            <p className="text-xs text-concrete-700">Be the first to send a message</p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label}>
            {/* Date separator */}
            <div className="flex items-center gap-3 px-4 my-4">
              <div className="flex-1 h-px bg-concrete-200" />
              <span className="text-[11px] text-concrete-700 font-medium bg-slate-50 px-2">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-concrete-200" />
            </div>

            {group.messages.map((msg, idx) => {
              const isMine      = msg.sender?._id === user?._id;
              const prev        = group.messages[idx - 1];
              const next        = group.messages[idx + 1];
              const showAvatar  = !next || next.sender?._id !== msg.sender?._id;
              const showSender  = isGroup && (!prev || prev.sender?._id !== msg.sender?._id);
              return (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isMine={isMine}
                  showAvatar={showAvatar}
                  showSenderName={showSender}
                />
              );
            })}
          </div>
        ))}

        <TypingIndicator names={typingNames} />
        <div ref={bottomRef} />
      </div>

      {/* ── Composer ───────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0">
        <MessageComposer onSent={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      </div>
    </div>
  );
}
