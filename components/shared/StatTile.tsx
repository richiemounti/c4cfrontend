// components/shared/StatTile.tsx — App Mockup .stats/.stat. A tile is only
// tinted when the colour means something: gold when the figure is a queue
// waiting for a person, sage when it's a healthy zero, white otherwise.
// Figures stay black — accent colours are never used for type (p.8).
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">{children}</div>;
}

interface StatTileProps {
  label: string;
  value: ReactNode;
  caption?: string;
  icon?: ReactNode;
  variant?: 'default' | 'attention' | 'done';
}

export function StatTile({ label, value, caption, icon, variant = 'default' }: StatTileProps) {
  return (
    <div
      className={cn(
        'border bg-white p-5 pb-[22px]',
        variant === 'attention' && 'bg-c4c-tint-gold border-c4c-yellow',
        variant === 'done' && 'bg-c4c-tint-sage border-c4c-sage',
        variant === 'default' && 'border-c4c-rule'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-title text-[10px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">{label}</span>
        {icon && <span className="h-4 w-4 flex-shrink-0 text-c4c-petrol [&_svg]:h-4 [&_svg]:w-4">{icon}</span>}
      </div>
      <div className="mt-3.5 font-title text-[32px] font-semibold leading-none tracking-[-0.03em] text-black">{value}</div>
      {caption && <div className="mt-2 text-[12.5px] text-c4c-petrol">{caption}</div>}
    </div>
  );
}
