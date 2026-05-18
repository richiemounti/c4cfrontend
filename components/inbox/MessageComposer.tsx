'use client';

// components/inbox/MessageComposer.tsx
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
} from 'react';
import { Send, Paperclip, X, AtSign, Loader2 } from 'lucide-react';
import { getMentionableUsers } from '@/lib/api/inbox';
import { useInboxStore, selectActiveConversation } from '@/stores/useInboxStore';
import type { InboxUser, ContextLink } from '@/lib/api/inbox';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MentionSuggestion extends InboxUser {}

/** Build a ContextLink from the current page */
function buildContextLinkFromPage(): ContextLink | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  const label =
    parts
      .filter((p) => !/^[0-9a-f]{24}$/i.test(p))
      .map((p) => p.replace(/-/g, ' '))
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' › ') || 'Current page';

  return {
    label,
    resourceType: 'project',
    resourceId: parts.find((p) => /^[0-9a-f]{24}$/i.test(p)) ?? '',
    href: path,
  };
}

interface MessageComposerProps {
  onSent?: () => void;
}

export default function MessageComposer({ onSent }: MessageComposerProps) {
  const { user } = useAuth();
  const sendMessage = useInboxStore((s) => s.sendMessage);

  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [contextLink, setContextLink] = useState<ContextLink | null>(null);

  // @mention state
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // ── Stable org ID — never changes for a given user session ───────────────
  const isStaff = (user as any)?.isConnectGoStaff;
  const organizationId: string = isStaff
    ? ''
    : ((user as any)?.roles?.find((r: any) => r.organization)?.organization?.toString() ?? '');

  // ── @mention fetch ────────────────────────────────────────────────────────

  const fetchSuggestions = useCallback(
    async (query: string) => {
      setLoadingSuggestions(true);
      try {
        const res = await getMentionableUsers({
          organizationId: organizationId || undefined,
          search: query,
          limit: 6,
        } as any);
        setMentionSuggestions(res.data);
        setActiveSuggestionIdx(0);
      } catch {
        setMentionSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    },
    [organizationId]
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';

    // Detect @ trigger
    const cursor = e.target.selectionStart ?? val.length;
    const textBefore = val.slice(0, cursor);
    const match = textBefore.match(/@(\w*)$/);

    if (match) {
      setMentionStart(cursor - match[0].length);
      setShowSuggestions(true);
      fetchSuggestions(match[1]);
    } else {
      setShowSuggestions(false);
      setMentionStart(null);
    }
  };

  const insertMention = (u: MentionSuggestion) => {
    if (mentionStart === null) return;
    const before = content.slice(0, mentionStart);
    const after = content.slice(textareaRef.current?.selectionStart ?? content.length);
    setContent(`${before}@${u.name} ${after}`);
    setMentionIds((prev) => (prev.includes(u._id) ? prev : [...prev, u._id]));
    setShowSuggestions(false);
    setMentionStart(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIdx((i) => Math.min(i + 1, mentionSuggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionSuggestions[activeSuggestionIdx]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await sendMessage({
        content: trimmed,
        mentionIds: mentionIds.length > 0 ? mentionIds : undefined,
        contextLink: contextLink ?? undefined,
      });
      setContent('');
      setMentionIds([]);
      setContextLink(null);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      onSent?.();
    } catch {
      // handle upstream
    } finally {
      setSending(false);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const canSend = content.trim().length > 0 && !sending;

  return (
    <div className="border-t border-sky bg-white flex-shrink-0">
      {/* Context link chip */}
      {contextLink && (
        <div className="px-3 pt-2.5 flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-tint border-sky text-stratosphere font-medium max-w-xs rounded-full h-auto"
          >
            <Paperclip size={11} className="flex-shrink-0 text-sky-500" />
            <span className="truncate text-xs">{contextLink.label}</span>
            <button
              onClick={() => setContextLink(null)}
              className="flex-shrink-0 hover:text-ochre transition-colors ml-0.5"
            >
              <X size={11} />
            </button>
          </Badge>
        </div>
      )}

      {/* Mention suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 mx-3 mb-1 bg-white border border-sky rounded-lg shadow-lg overflow-hidden z-50"
        >
          {loadingSuggestions ? (
            <div className="flex justify-center py-3">
              <Loader2 size={15} className="animate-spin text-concrete-900" />
            </div>
          ) : mentionSuggestions.length === 0 ? (
            <p className="text-xs text-concrete-900 px-3 py-2">No users found</p>
          ) : (
            mentionSuggestions.map((u, idx) => (
              <button
                key={u._id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(u);
                }}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors
                  ${idx === activeSuggestionIdx ? 'bg-sky-tint' : 'hover:bg-sky-tint'}
                `}
              >
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarFallback className="bg-stratosphere text-white text-xs font-semibold">
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
            ))
          )}
        </div>
      )}

      {/* Input row */}
      <div className="relative flex items-end gap-2 px-3 py-2.5">
        {/* Attach context */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            const link = buildContextLinkFromPage();
            if (link) setContextLink(link);
          }}
          title="Attach current page as context"
          className={`
            flex-shrink-0 h-8 w-8 mb-0.5
            ${contextLink ? 'text-sky-500 bg-sky-tint' : 'text-concrete-900 hover:text-stratosphere hover:bg-sky-tint'}
          `}
        >
          <Paperclip size={17} />
        </Button>

        {/* @ shortcut */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            const ta = textareaRef.current;
            if (!ta) return;
            const pos = ta.selectionStart ?? content.length;
            const newVal = content.slice(0, pos) + '@' + content.slice(pos);
            setContent(newVal);
            ta.focus();
            setTimeout(() => {
              ta.setSelectionRange(pos + 1, pos + 1);
              const event = new Event('input', { bubbles: true });
              ta.dispatchEvent(event);
            }, 0);
          }}
          title="Mention someone"
          className="flex-shrink-0 h-8 w-8 mb-0.5 text-concrete-900 hover:text-stratosphere hover:bg-sky-tint"
        >
          <AtSign size={17} />
        </Button>

        {/* Textarea — using native textarea for auto-resize, styled to match shadcn */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message… (@mention someone)"
          rows={1}
          className="
            flex-1 resize-none bg-sky-tint border border-sky rounded-xl
            px-3 py-2 text-sm text-stratosphere placeholder:text-concrete-900
            focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
            transition-colors leading-relaxed
          "
          style={{ minHeight: '38px', maxHeight: '160px' }}
        />

        {/* Send */}
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!canSend}
          className={`
            flex-shrink-0 h-9 w-9 mb-0.5 rounded-xl transition-all duration-150
            ${canSend
              ? 'bg-stratosphere hover:bg-stratosphere-900 text-white shadow-sm active:scale-95'
              : 'bg-concrete text-concrete-900 cursor-not-allowed'
            }
          `}
        >
          {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
        </Button>
      </div>
    </div>
  );
}