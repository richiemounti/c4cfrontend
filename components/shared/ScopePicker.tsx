// components/shared/ScopePicker.tsx — App Mockup .scope/.scope-row. Used
// by Results Dashboard's "choose project-level or a specific site" step.
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function ScopeList({ children }: { children: ReactNode }) {
  return <div className="mt-5 flex flex-col gap-3">{children}</div>;
}

interface ScopeRowProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  chosen?: boolean;
  onClick?: () => void;
}

export function ScopeRow({ icon, title, subtitle, chosen, onClick }: ScopeRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-[15px] border bg-white px-5 py-[18px] text-left hover:border-c4c-petrol',
        chosen ? 'bg-c4c-tint-sage border-c4c-sage' : 'border-c4c-rule'
      )}
    >
      <span className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center bg-c4c-grey-bg">
        <span className="h-[18px] w-[18px] text-c4c-petrol [&_svg]:h-[18px] [&_svg]:w-[18px]">{icon}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-title text-[15px] font-semibold tracking-[-0.015em] text-black">{title}</span>
        {subtitle && <span className="mt-1 block text-[13px] text-c4c-petrol">{subtitle}</span>}
      </span>
      <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0 text-c4c-petrol" />
    </button>
  );
}
