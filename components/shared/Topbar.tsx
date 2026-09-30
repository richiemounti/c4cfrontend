// components/shared/Topbar.tsx
//
// The App Mockup's .topbar: white panel, rule border-bottom, the pixel
// motif bleeding off the top-right corner with a reserved clear lane so
// headings/actions never run underneath it. Composable rather than one
// rigid layout, since the mockup itself uses a few different arrangements
// (Project Home's simple back+title+links+meta vs. Risk Register's
// title-and-actions split) — pull in the pieces a given page needs.
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { PixelMotif, type MotifColour } from './PixelMotif';

// The mockup's --motif-lane: the clear space the topbar reserves on the
// right so text/buttons never run under the motif.
const MOTIF_LANE = 132;

export function Topbar({ motif, children }: { motif: MotifColour; children: ReactNode }) {
  return (
    <header
      className="relative overflow-hidden border-b border-c4c-rule bg-white px-10 py-6"
      style={{ paddingRight: `calc(2.5rem + ${MOTIF_LANE}px)` }}
    >
      <PixelMotif colour={motif} />
      <div className="relative z-[1]">{children}</div>
    </header>
  );
}

export function TopbarBack({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 font-title text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-c4c-petrol hover:text-black"
    >
      <ArrowLeft size={13} />
      {children}
    </Link>
  );
}

export function TopbarTitle({ children }: { children: ReactNode }) {
  return <h1 className="mt-3.5 font-title text-[clamp(26px,3.2vw,34px)] font-semibold text-black">{children}</h1>;
}

export function TopbarSub({ children }: { children: ReactNode }) {
  return <p className="mt-2.5 max-w-[74ch] text-[14.5px] text-c4c-ink/80">{children}</p>;
}

export function TopbarHead({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-4">{children}</div>;
}

export function TopbarActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2.5">{children}</div>;
}

export function TopbarLinks({ children }: { children: ReactNode }) {
  return <div className="mt-3 flex flex-wrap items-center gap-6">{children}</div>;
}

export function TopbarLink({ href, icon, children }: { href: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <a href={href} className="inline-flex items-center gap-1.5 text-[13.5px] text-c4c-ink/80 hover:text-black">
      {icon}
      {children}
    </a>
  );
}

export function TopbarMeta({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex flex-wrap items-center gap-3.5">{children}</div>;
}
