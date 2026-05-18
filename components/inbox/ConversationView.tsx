'use client';

// components/inbox/ConversationView.tsx
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  ArrowLeft, MoreVertical, Loader2, ExternalLink,
  Pencil, Trash2, Check, CheckCheck,
} from 'lucide-react';
import { useInboxStore, selectActiveConversation, selectActiveTypingUsers } from '@/stores/useInboxStore';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';
import MessageComposer from './MessageComposer';
import type { Message } from '@/lib/api/inbox';
import { format, isToday, isYesterday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  } catch {
    return '';
  }
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

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message, isMine, showAvatar,
}: {
  message: Message; isMine: boolean; showAvatar: boolean;
}) {
  const { user } = useAuth();
  const editMessage = useInboxStore((s) => s.editMessage);
  const deleteMessage = useInboxStore((s) => s.deleteMessage);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const readByCount = message.readBy.filter((r) => r.user !== user?._id).length;

  const handleEditSave = async () => {
    if (!editContent.trim() || editContent === message.content) { setEditing(false); return; }
    await editMessage(message._id, editContent.trim());
    setEditing(false);
  };

  if (message.deleted) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
        <p className="text-xs text-concrete-900 italic px-3 py-1.5 bg-concrete rounded-xl">
          Message deleted
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 mb-1 group ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
        {!isMine && (
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-stratosphere text-white text-xs font-semibold">
              {message.sender?.name?.[0]?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
        )}
        {isMine && <div className="w-7" />}
      </div>

      {/* Bubble */}
      <div className={`relative max-w-[72%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {!isMine && showAvatar && (
          <span className="text-[11px] text-concrete-900 mb-0.5 ml-1 font-medium">
            {message.sender?.name}
          </span>
        )}

        <div className="relative flex items-end gap-1">
          {/* Edit/delete menu — only for own messages */}
          {isMine && !message.deleted && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-concrete-900 hover:text-stratosphere hover:bg-sky-tint"
                  >
                    <MoreVertical size={13} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[120px]">
                  <DropdownMenuItem onClick={() => setEditing(true)} className="text-xs gap-2">
                    <Pencil size={12} /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteMessage(message._id)}
                    className="text-xs gap-2 text-ochre focus:text-ochre"
                  >
                    <Trash2 size={12} /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Bubble body */}
          <div
            className={`
              px-3 py-2 rounded-2xl text-sm leading-relaxed
              ${isMine
                ? 'bg-stratosphere text-white rounded-br-sm'
                : 'bg-white border border-sky text-stratosphere rounded-bl-sm'
              }
            `}
          >
            {editing ? (
              <div className="flex flex-col gap-1.5 min-w-[200px]">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-white/20 text-white placeholder-white/60 text-sm rounded p-1 resize-none outline-none w-full"
                  rows={2}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave(); }
                    if (e.key === 'Escape') setEditing(false);
                  }}
                />
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}
                    className="text-[11px] text-white/70 hover:text-white h-6 px-2">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleEditSave}
                    className="text-[11px] bg-white/20 hover:bg-white/30 text-white h-6 px-2">
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap break-words">{message.content}</p>

                {message.contextLink && (
                  <a
                    href={message.contextLink.href}
                    className={`
                      mt-2 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium
                      ${isMine
                        ? 'bg-white/15 text-white hover:bg-white/25'
                        : 'bg-sky-tint border border-sky text-stratosphere hover:bg-sky-100'
                      }
                      transition-colors
                    `}
                  >
                    <ExternalLink size={11} className="flex-shrink-0" />
                    <span className="truncate">{message.contextLink.label}</span>
                  </a>
                )}

                {message.editedAt && (
                  <span className={`text-[10px] block mt-0.5 ${isMine ? 'text-white/50' : 'text-concrete-900'}`}>
                    edited
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Timestamp + read receipt */}
        <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'} ml-1`}>
          <span className="text-[11px] text-concrete-900">{formatMessageTime(message.createdAt)}</span>
          {isMine && (
            readByCount > 0
              ? <CheckCheck size={13} className="text-sky-500" />
              : <Check size={13} className="text-concrete-900" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const label = names.length === 1 ? `${names[0]} is typing` : `${names.slice(0, 2).join(', ')} are typing`;
  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 bg-concrete-900 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <span className="text-xs text-concrete-900 italic">{label}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ConversationView() {
  const { user } = useAuth();
  const conversation = useInboxStore(selectActiveConversation);
  const typingUsers = useInboxStore(selectActiveTypingUsers);
  const messages = useInboxStore((s) => s.messages);
  const messagesLoading = useInboxStore((s) => s.messagesLoading);
  const messagesHasMore = useInboxStore((s) => s.messagesHasMore);
  const activeConversationId = useInboxStore((s) => s.activeConversationId);
  const closeConversation = useInboxStore((s) => s.closeConversation);
  const loadMoreMessages = useInboxStore((s) => s.loadMoreMessages);

  const { joinConversation, leaveConversation } = useSocket();

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef(0);

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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 border-b border-sky bg-white flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={closeConversation}
          className="h-8 w-8 text-concrete-900 hover:text-stratosphere hover:bg-sky-tint"
        >
          <ArrowLeft size={17} />
        </Button>

        <div className="flex -space-x-1.5 flex-shrink-0">
          {otherParticipants.slice(0, 3).map((p) => (
            <Avatar key={p._id} className="w-8 h-8 border-2 border-white">
              <AvatarFallback className="bg-stratosphere text-white text-xs font-semibold">
                {p.name[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stratosphere truncate">{displayName}</p>
          {conversation.type === 'direct' && otherParticipants[0] && (
            <p className="text-[11px] text-concrete-900 truncate">
              @{otherParticipants[0].userName} · {otherParticipants[0].primaryRole}
            </p>
          )}
          {conversation.type === 'group' && (
            <p className="text-[11px] text-concrete-900">{conversation.participants.length} members</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 py-3 bg-sky-tint">
        <div ref={topSentinelRef} className="h-1" />

        {messagesLoading && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-concrete-900" />
          </div>
        )}
        {messagesLoading && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <Loader2 size={15} className="animate-spin text-concrete-900" />
          </div>
        )}
        {messages.length === 0 && !messagesLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-sm text-concrete-900">No messages yet</p>
            <p className="text-xs text-concrete-900">Say hello 👋</p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-sky" />
              <span className="text-[11px] text-concrete-900 font-medium px-2 bg-sky-tint">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-sky" />
            </div>
            {group.messages.map((msg, idx) => {
              const isMine = msg.sender?._id === user?._id;
              const prev = group.messages[idx - 1];
              const showAvatar = !prev || prev.sender?._id !== msg.sender?._id;
              return (
                <MessageBubble key={msg._id} message={msg} isMine={isMine} showAvatar={showAvatar} />
              );
            })}
          </div>
        ))}

        <TypingIndicator names={typingNames} />
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="relative flex-shrink-0">
        <MessageComposer onSent={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      </div>
    </div>
  );
}