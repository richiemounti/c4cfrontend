// hooks/useMention.ts
'use client';

import {
  useState,
  useRef,
  useCallback,
  KeyboardEvent,
} from 'react';
import { getMentionableUsers, sendPageMention } from '@/lib/api/inbox';
import type { InboxUser, PageContext, ContextLink } from '@/lib/api/inbox';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MentionState {
  showDropdown: boolean;
  suggestions: InboxUser[];
  loading: boolean;
  activeIndex: number;
  // Character index in `content` where the current @ token started
  triggerStart: number | null;
}

export interface UseMentionOptions {
  organizationId: string;
  pageContext: PageContext;
  contextLink?: ContextLink;
  /** Max suggestions to show — default 6 */
  limit?: number;
  /**
   * Called when the host component wants to submit.
   * useMention will fire the mention notifications then call this with
   * the final plain-text content.
   */
  onSubmit?: (content: string, mentionedUserIds: string[]) => Promise<void> | void;
}

export interface UseMentionReturn {
  // Text content the textarea should display
  content: string;
  setContent: (value: string) => void;

  // All IDs that have been @mentioned so far in this session
  mentionedUserIds: string[];

  // Dropdown state (pass to your dropdown renderer)
  mentionState: MentionState;

  // Wire these to the <textarea> element
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;

  // Call when user clicks a suggestion in the dropdown
  insertMention: (user: InboxUser) => void;

  // Call this on form submit — sends mention notifications + calls onSubmit
  submitWithMentions: () => Promise<void>;

  // Whether a submission is in flight
  submitting: boolean;

  // Reset content + mentions (e.g. after a successful submit)
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useMention({
  organizationId,
  pageContext,
  contextLink,
  limit = 6,
  onSubmit,
}: UseMentionOptions): UseMentionReturn {
  const [content, setContent] = useState('');
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [mentionState, setMentionState] = useState<MentionState>({
    showDropdown: false,
    suggestions: [],
    loading: false,
    activeIndex: 0,
    triggerStart: null,
  });

  // Ref to the textarea element — needed for cursor position reads
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Debounce timer for user search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Suggestion fetch ────────────────────────────────────────────────────

  const fetchSuggestions = useCallback(
    (query: string) => {
      if (searchTimer.current) clearTimeout(searchTimer.current);

      setMentionState((prev) => ({ ...prev, loading: true }));

      searchTimer.current = setTimeout(async () => {
        try {
          const res = await getMentionableUsers({
            organizationId: organizationId || undefined,
            search: query,
            limit,
          } as any);
          setMentionState((prev) => ({
            ...prev,
            suggestions: res.data,
            loading: false,
            activeIndex: 0,
          }));
        } catch {
          setMentionState((prev) => ({
            ...prev,
            suggestions: [],
            loading: false,
          }));
        }
      }, 250);
    },
    [organizationId, limit]
  );

  // ── Content change — detect @ trigger ────────────────────────────────────

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setContent(val);

      // Auto-resize if the textarea has inline style
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';

      const cursor = e.target.selectionStart ?? val.length;
      const textBefore = val.slice(0, cursor);
      const match = textBefore.match(/@(\w*)$/);

      if (match) {
        const triggerStart = cursor - match[0].length;
        setMentionState((prev) => ({
          ...prev,
          showDropdown: true,
          triggerStart,
        }));
        fetchSuggestions(match[1]);
      } else {
        setMentionState((prev) => ({
          ...prev,
          showDropdown: false,
          triggerStart: null,
          suggestions: [],
        }));
      }
    },
    [fetchSuggestions]
  );

  // ── Keyboard navigation ───────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (mentionState.showDropdown && mentionState.suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setMentionState((prev) => ({
            ...prev,
            activeIndex: Math.min(prev.activeIndex + 1, prev.suggestions.length - 1),
          }));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setMentionState((prev) => ({
            ...prev,
            activeIndex: Math.max(prev.activeIndex - 1, 0),
          }));
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          insertMention(mentionState.suggestions[mentionState.activeIndex]);
          return;
        }
        if (e.key === 'Escape') {
          setMentionState((prev) => ({ ...prev, showDropdown: false }));
          return;
        }
      }
    },
    [mentionState]
  );

  // ── Insert mention into text ──────────────────────────────────────────────

  const insertMention = useCallback(
    (user: InboxUser) => {
      const { triggerStart } = mentionState;
      if (triggerStart === null) return;

      const textarea = textareaRef.current;
      const cursorPos = textarea?.selectionStart ?? content.length;

      const before = content.slice(0, triggerStart);
      const after = content.slice(cursorPos);
      const newContent = `${before}@${user.name} ${after}`;

      setContent(newContent);
      setMentionedUserIds((prev) =>
        prev.includes(user._id) ? prev : [...prev, user._id]
      );
      setMentionState((prev) => ({
        ...prev,
        showDropdown: false,
        triggerStart: null,
        suggestions: [],
      }));

      // Restore focus and move cursor to end of inserted mention
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          const newCursor = before.length + user.name.length + 2; // '@' + name + ' '
          textarea.setSelectionRange(newCursor, newCursor);
        }
      }, 0);
    },
    [content, mentionState]
  );

  // ── Submit — send mention notifications, then call host onSubmit ──────────

  const submitWithMentions = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);

    try {
      // Fire mention notifications for all @mentioned users
      if (mentionedUserIds.length > 0 && organizationId) {
        await sendPageMention({
          recipientIds: mentionedUserIds,
          organizationId,
          preview: trimmed.length > 120 ? trimmed.slice(0, 120) + '…' : trimmed,
          pageContext,
          contextLink,
        });
      }

      // Delegate to the host component's submit handler
      await onSubmit?.(trimmed, mentionedUserIds);
    } finally {
      setSubmitting(false);
    }
  }, [content, mentionedUserIds, organizationId, pageContext, contextLink, onSubmit, submitting]);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setContent('');
    setMentionedUserIds([]);
    setMentionState({
      showDropdown: false,
      suggestions: [],
      loading: false,
      activeIndex: 0,
      triggerStart: null,
    });
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, []);

  // Expose textareaRef so MentionTextarea can attach it
  (useMention as any).__textareaRef = textareaRef;

  return {
    content,
    setContent,
    mentionedUserIds,
    mentionState,
    handleChange,
    handleKeyDown,
    insertMention,
    submitWithMentions,
    submitting,
    reset,
  };
}

/**
 * Helper to get the internal textarea ref from a useMention return value.
 * Used by MentionTextarea to attach the ref.
 */
export function getMentionTextareaRef(
  mention: UseMentionReturn
): React.RefObject<HTMLTextAreaElement> {
  return (useMention as any).__textareaRef;
}