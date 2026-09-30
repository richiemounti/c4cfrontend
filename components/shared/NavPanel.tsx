// components/shared/NavPanel.tsx
//
// Shared sidebar building blocks (App Mockup 23 09 26, .nav-panel /
// .nav-link / .nav-count / .brand-tile). This is styling only, not a full
// AppShell: ProjectSidebar, DashboardSidebar and the admin layout each
// still own their own nav items, auth/collapse state and desktop-vs-mobile
// (Sheet) wiring — they just render through these instead of hand-rolling
// their own button/link markup three times over, so the light grey-bg
// look (replacing the old dark petrol theme) only has to be right once.
'use client';

import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

// Matches the mockup's --nav-w exactly.
export const NAV_PANEL_WIDTH = 264;

interface NavPanelLinkProps {
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  count?: number;
}

// The mockup's .nav-link: ink-soft text, no fill by default; active state
// is a white background with a 3px navy left border and navy text; hover
// is a plain white background. Gold count badge = "a thing waiting for a
// person" (unread items), never used for anything else.
export function NavPanelLink({ href, onClick, icon, label, active, collapsed, count }: NavPanelLinkProps) {
  const classes = cn(
    'group relative flex w-full items-center gap-3 border-l-[3px] px-3.5 py-2.5 text-left font-title text-[13.5px] font-semibold transition-colors',
    collapsed && 'justify-center px-0',
    active
      ? 'border-c4c-petrol bg-white text-c4c-petrol'
      : 'border-transparent text-c4c-ink/70 hover:bg-white hover:text-black'
  );

  const content = (
    <>
      <span className="flex-shrink-0 [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      {!collapsed && <span className="flex-1 truncate leading-tight">{label}</span>}
      {!collapsed && !!count && (
        <span className="ml-auto flex-shrink-0 bg-c4c-yellow px-2 py-0.5 font-title text-[10.5px] font-semibold text-black">
          {count}
        </span>
      )}
      {collapsed && (
        <span className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap bg-c4c-petrol px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          {label}
        </span>
      )}
    </>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {href ? (
              <Link href={href} className={classes}>{content}</Link>
            ) : (
              <button type="button" onClick={onClick} className={classes}>{content}</button>
            )}
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return href ? (
    <Link href={href} className={classes}>{content}</Link>
  ) : (
    <button type="button" onClick={onClick} className={classes}>{content}</button>
  );
}

// The mockup's .label — a small uppercase group heading ("Map", "Listen"…).
export function NavPanelGroupLabel({ children, collapsed }: { children: ReactNode; collapsed?: boolean }) {
  if (collapsed) return <div className="mx-3 border-t border-c4c-rule" />;
  return (
    <p className="px-3.5 pb-1.5 pt-3 font-title text-[10px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">
      {children}
    </p>
  );
}

// The navy brand-tile mark — the mockup's rationale: the full wordmark
// falls below 14px at sidebar width, so a single strong glyph carries the
// brand here instead.
export function NavPanelBrandTile({ src, alt = 'Citizens for Change' }: { src: string; alt?: string }) {
  return (
    <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center bg-c4c-petrol">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-5 w-auto" />
    </span>
  );
}
