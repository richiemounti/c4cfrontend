// components/shared/Toolbar.tsx — App Mockup .toolbar/.search/.filters/
// .seg. Only the search field grows; everything else sits at its own
// width, so a row of filters reads as a row rather than a stack.
'use client';

import { Search } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>;
}

export function FilterRow({ children }: { children: ReactNode }) {
  return <div className="mt-3 flex flex-wrap gap-2.5">{children}</div>;
}

export function SearchField({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative min-w-0 flex-[1_1_280px]">
      <Search className="pointer-events-none absolute left-[13px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-c4c-petrol" />
      <Input type="search" className={cn('pl-[38px]', className)} {...props} />
    </div>
  );
}

export function SegmentedToggle({ children }: { children: ReactNode }) {
  return <div className="inline-flex border border-c4c-rule bg-white">{children}</div>;
}

export function SegmentedButton({
  active,
  icon,
  children,
  onClick,
}: {
  active?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={!!active}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-10 items-center gap-1.5 px-4 font-title text-[11.5px] font-semibold uppercase tracking-[0.06em] text-c4c-petrol',
        active && 'bg-c4c-petrol text-white'
      )}
    >
      {icon}
      {children}
    </button>
  );
}
