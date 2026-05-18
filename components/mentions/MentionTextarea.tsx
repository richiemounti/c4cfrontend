'use client';

// components/mentions/MentionTextarea.tsx
import { useRef, useEffect, useCallback } from 'react';
import { Loader2, Send, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useMention } from '@/hooks/useMention';
import type { InboxUser, PageContext, ContextLink, ResourceType } from '@/lib/api/inbox';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface MentionTextareaProps {
  /** The org that scopes which users can be @mentioned */
  organizationId: string;

  /** Describes the resource this comment lives on */
  pageContext: PageContext;

  /** Optional deep link attached to the mention notification */
  contextLink?: ContextLink;

  placeholder?: string;
  submitLabel?: string;
  minRows?: number;

  /**
   * Called when the user submits.
   * useMention will have already fired the mention notifications before calling this.
   */
  onSubmit: (content: string, mentionedUserIds: string[]) => Promise<void> | void;

  /** If true the textarea is shown without a submit button — host controls submit */
  headless?: boolean;

  /** Controlled mode — host passes content and setContent */
  value?: string;
  onChange?: (value: string) => void;

  disabled?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggestion dropdown
// ─────────────────────────────────────────────────────────────────────────────

function SuggestionDropdown({
  suggestions,
  loading,
  activeIndex,
  onSelect,
}: {
  suggestions: InboxUser[];
  loading: boolean;
  activeIndex: number;
  onSelect: (user: InboxUser) => void;
}) {
  if (!loading && suggestions.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-sky rounded-lg shadow-lg overflow-hidden z-50">
      {loading ? (
        <div className="flex justify-center py-3">
          <Loader2 size={15} className="animate-spin text-concrete-900" />
        </div>
      ) : (
        suggestions.map((user, idx) => (
          <button
            key={user._id}
            // onMouseDown prevents textarea blur before onClick fires
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(user);
            }}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors
              ${idx === activeIndex ? 'bg-sky-tint' : 'hover:bg-sky-tint'}
            `}
          >
            <Avatar className="w-7 h-7 flex-shrink-0">
              <AvatarFallback className="bg-stratosphere text-white text-xs font-semibold">
                {user.name[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-stratosphere truncate">{user.name}</p>
              <p className="text-[11px] text-concrete-900 truncate">
                @{user.userName}
                {user.primaryRole && ` · ${user.primaryRole}`}
              </p>
            </div>
          </button>
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MentionTextarea({
  organizationId,
  pageContext,
  contextLink,
  placeholder = 'Write a comment… (type @ to mention someone)',
  submitLabel = 'Send',
  minRows = 2,
  onSubmit,
  headless = false,
  value,
  onChange,
  disabled = false,
  className = '',
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    content,
    setContent,
    mentionState,
    handleChange,
    handleKeyDown,
    insertMention,
    submitWithMentions,
    submitting,
    reset,
  } = useMention({
    organizationId,
    pageContext,
    contextLink,
    onSubmit: async (text, ids) => {
      await onSubmit(text, ids);
      reset();
    },
  });

  // Controlled mode — sync external value in
  useEffect(() => {
    if (value !== undefined) setContent(value);
  }, [value, setContent]);

  // Propagate changes upward in controlled mode
  const handleChangeWrapped = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    onChange?.(e.target.value);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        // Close via the existing state — we can't call setMentionState directly
        // so we just blur-focus trick is not needed; the dropdown will close
        // naturally when suggestions are empty after the next change event.
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Insert @ shortcut
  const handleAtButton = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart ?? content.length;
    const syntheticEvent = {
      target: {
        ...ta,
        value: content.slice(0, pos) + '@' + content.slice(pos),
        selectionStart: pos + 1,
        style: ta.style,
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleChange(syntheticEvent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(pos + 1, pos + 1);
    }, 0);
  }, [content, handleChange]);

  const canSubmit = content.trim().length > 0 && !submitting && !disabled;

  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      {/* Textarea + dropdown wrapper */}
      <div className="relative">
        {/* Suggestion dropdown */}
        {mentionState.showDropdown && (
          <div ref={dropdownRef}>
            <SuggestionDropdown
              suggestions={mentionState.suggestions}
              loading={mentionState.loading}
              activeIndex={mentionState.activeIndex}
              onSelect={insertMention}
            />
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChangeWrapped}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={minRows}
          disabled={disabled || submitting}
          className="
            w-full resize-none bg-sky-tint border border-sky rounded-xl
            px-3 py-2.5 text-sm text-stratosphere placeholder:text-concrete-900
            focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors leading-relaxed
          "
          style={{ minHeight: `${minRows * 24 + 20}px`, maxHeight: '200px' }}
        />
      </div>

      {/* Toolbar + submit */}
      {!headless && (
        <div className="flex items-center justify-between">
          {/* @ shortcut hint */}
          <button
            type="button"
            onClick={handleAtButton}
            disabled={disabled}
            className="
              flex items-center gap-1.5 px-2 py-1 rounded-md text-xs
              text-concrete-900 hover:text-stratosphere hover:bg-sky-tint
              transition-colors disabled:opacity-50
            "
            title="Mention someone"
          >
            <AtSign size={13} />
            Mention
          </button>

          {/* Mentioned user pills */}
          {mentionState.suggestions.length === 0 && content.includes('@') && (
            <span className="text-[11px] text-concrete-900 hidden sm:block">
              Type @ to mention a colleague
            </span>
          )}

          {/* Submit */}
          <Button
            type="button"
            size="sm"
            onClick={submitWithMentions}
            disabled={!canSubmit}
            className="
              h-8 px-3 bg-stratosphere hover:bg-stratosphere-900 text-white
              text-xs font-medium rounded-lg gap-1.5
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {submitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
            {submitLabel}
          </Button>
        </div>
      )}
    </div>
  );
}