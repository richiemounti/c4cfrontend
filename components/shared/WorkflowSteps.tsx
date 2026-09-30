// components/shared/WorkflowSteps.tsx — App Mockup .steps/.step. Square
// numeral block (same padding/min-width as the homepage's .why-cell .num),
// a coloured rail, and four states: sage=done, coral=now (the spotlight,
// so its own action button uses variant="spotlight"), outlined=open,
// grey-bg=locked. The numeral and its rail always agree.
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StepState = 'done' | 'now' | 'open' | 'locked';

export function Steps({ children }: { children: ReactNode }) {
  return <div className="mt-[26px] flex flex-col gap-[26px]">{children}</div>;
}

interface StepProps {
  number: number | string;
  state: StepState;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function Step({ number, state, title, description, actions }: StepProps) {
  return (
    <div className="flex items-stretch gap-[18px]">
      <div
        className={cn(
          'w-[3px] flex-shrink-0',
          state === 'done' && 'bg-c4c-sage',
          state === 'now' && 'bg-c4c-coral',
          state === 'open' && 'bg-c4c-rule',
          state === 'locked' && 'bg-c4c-grey-bg'
        )}
      />
      <div className="flex flex-grow flex-wrap items-start gap-[15px]">
        <div
          className={cn(
            'flex min-w-[42px] flex-shrink-0 items-center justify-center px-3 py-2 text-center font-title text-base font-semibold leading-[1.1] text-black',
            state === 'done' && 'bg-c4c-sage',
            state === 'now' && 'bg-c4c-coral',
            state === 'open' && 'bg-white shadow-[inset_0_0_0_2px_#000]',
            state === 'locked' && 'bg-c4c-grey-bg'
          )}
        >
          {number}
        </div>
        <div className="min-w-0 flex-1 basis-80">
          <h3 className={cn('text-[16.5px] font-semibold tracking-[-0.015em]', state === 'locked' ? 'text-c4c-ink/70' : 'text-black')}>
            {title}
          </h3>
          <p className={cn('mt-2 max-w-[74ch] text-[14.5px] leading-[1.6]', state === 'locked' ? 'text-c4c-petrol' : 'text-c4c-ink/80')}>
            {description}
          </p>
        </div>
        {actions && <div className="flex flex-shrink-0 flex-col items-end gap-[11px]">{actions}</div>}
      </div>
    </div>
  );
}
