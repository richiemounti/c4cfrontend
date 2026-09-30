// components/shared/Lists.tsx — smaller App Mockup list/strip patterns:
// .next (numbered next-steps), .ticks (what a module will capture),
// .how/.how-step (approvals strip), .bars/.bar, .chips/.chip.
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ---- Numbered next-steps -------------------------------------------------
export function NumberedList({ items }: { items: ReactNode[] }) {
  return (
    <div className="mt-4 bg-c4c-grey-bg px-5 py-[18px]">
      <ol className="mt-3 flex flex-col gap-[11px]">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span className="flex min-w-6 flex-shrink-0 items-center justify-center px-[7px] py-0.5 text-center font-title text-[11px] font-semibold text-c4c-ink/80 bg-white shadow-[inset_0_0_0_1px_var(--c4c-rule)]">
              {i + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---- Ticked list — petrol ticks: sage is too pale to read as an icon on
// white. -------------------------------------------------------------------
export function TickList({ items, icon }: { items: ReactNode[]; icon: ReactNode }) {
  return (
    <ul className="mt-3.5 flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-[11px] text-sm">
          <span className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-c4c-petrol [&_svg]:h-3.5 [&_svg]:w-3.5">{icon}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ---- Approvals strip ------------------------------------------------------
export function ApprovalSteps({ children }: { children: ReactNode }) {
  return <div className="mt-[18px] grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">{children}</div>;
}

export function ApprovalStep({ number, title, description }: { number: number | string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex min-w-[26px] flex-shrink-0 items-center justify-center bg-c4c-petrol px-2 py-[3px] text-center font-title text-[11px] font-semibold text-white">
        {number}
      </span>
      <div>
        <h4 className="text-[13.5px] font-semibold tracking-[-0.01em] text-black">{title}</h4>
        <p className="mt-1.5 text-[12.5px] text-c4c-petrol">{description}</p>
      </div>
    </div>
  );
}

// ---- Bars — a number and its caption, flat tinted block ------------------
export function BarGrid({ children, minWidth = 150 }: { children: ReactNode; minWidth?: number }) {
  return <div className="mt-[18px] grid gap-3.5" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))` }}>{children}</div>;
}

export function Bar({ value, caption, attention }: { value: ReactNode; caption: string; attention?: boolean }) {
  return (
    <div className={cn('bg-c4c-grey-bg px-5 py-[18px] text-center', attention && 'bg-c4c-tint-gold shadow-[inset_0_0_0_1px_var(--c4c-yellow)]')}>
      <div className="font-title text-[26px] font-semibold leading-none tracking-[-0.03em] text-black">{value}</div>
      <div className="mt-2 text-xs text-c4c-petrol">{caption}</div>
    </div>
  );
}

// ---- Step chip strip — horizontal scroll of workflow steps ---------------
export function ChipStrip({ children }: { children: ReactNode }) {
  return <div className="mt-5 flex gap-2.5 overflow-x-auto pb-3">{children}</div>;
}

export function Chip({ label, title, icon, current }: { label: string; title: string; icon?: ReactNode; current?: boolean }) {
  return (
    <div
      className={cn(
        'flex w-[158px] flex-shrink-0 flex-col gap-[5px] border bg-white px-3.5 py-3',
        current ? 'bg-c4c-coral border-c4c-coral' : 'border-c4c-rule'
      )}
    >
      <span className={cn('font-title text-[10px] font-semibold uppercase tracking-[0.11em]', current ? 'text-black' : 'text-c4c-petrol')}>
        {label}
      </span>
      <span className={cn('flex items-center gap-1 truncate font-title text-[12.5px] font-semibold leading-[1.3]', current ? 'text-black' : 'text-c4c-ink/80')}>
        {icon && <span className="mt-0.5 h-[13px] w-[13px] flex-shrink-0 text-c4c-petrol [&_svg]:h-[13px] [&_svg]:w-[13px]">{icon}</span>}
        {title}
      </span>
    </div>
  );
}
