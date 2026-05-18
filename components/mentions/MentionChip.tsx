'use client';

// components/mentions/MentionChip.tsx
import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// MentionChip — a single styled @name pill
// ─────────────────────────────────────────────────────────────────────────────

interface MentionChipProps {
  name: string;
  className?: string;
}

export function MentionChip({ name, className = '' }: MentionChipProps) {
  return (
    <span
      className={`
        inline-flex items-center px-1.5 py-0.5 rounded-md
        bg-sky-tint border border-sky text-sky-500 font-medium text-[13px]
        ${className}
      `}
    >
      @{name}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// renderWithMentions — parses plain text and replaces @Name tokens with chips
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Takes a plain-text string like "Hey @Jane Smith, please check this"
 * and returns a React node with @mentions rendered as MentionChip elements.
 *
 * Usage:
 *   <p>{renderWithMentions(comment.content)}</p>
 */
export function renderWithMentions(text: string): React.ReactNode {
  if (!text) return null;

  // Split on @Word sequences — handles single and multi-word names
  // Matches @FirstName or @First Last (up to 3 words)
  const parts = text.split(/(@[A-Z][a-zA-Z]*(?: [A-Z][a-zA-Z]*)?(?: [A-Z][a-zA-Z]*)?)/);

  return parts.map((part, i) => {
    if (part.startsWith('@') && part.length > 1) {
      const name = part.slice(1); // strip the @
      return <MentionChip key={i} name={name} />;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MentionText — convenience wrapper component
// ─────────────────────────────────────────────────────────────────────────────

interface MentionTextProps {
  content: string;
  className?: string;
}

/**
 * Drop-in replacement for a <p> or <span> that renders @mentions as chips.
 *
 * Usage:
 *   <MentionText content={comment.content} className="text-sm text-stratosphere" />
 */
export function MentionText({ content, className = '' }: MentionTextProps) {
  return (
    <p className={`leading-relaxed ${className}`}>
      {renderWithMentions(content)}
    </p>
  );
}

export default MentionChip;