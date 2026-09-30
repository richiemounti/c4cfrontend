// components/shared/Callout.tsx — App Mockup .callout. Anchor (navy) by
// default; cyan variant for informational asides.
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Callout({ icon, children, variant = 'anchor' }: { icon?: ReactNode; children: ReactNode; variant?: 'anchor' | 'cyan' }) {
  return (
    <div
      className={cn(
        'mt-5 flex gap-[13px] bg-c4c-grey-bg py-[17px] pl-[19px] pr-[19px] border-l-4',
        variant === 'cyan' ? 'border-c4c-paleblue' : 'border-c4c-petrol'
      )}
    >
      {icon && (
        <span className={cn('mt-0.5 h-4 w-4 flex-shrink-0 [&_svg]:h-4 [&_svg]:w-4', variant === 'cyan' ? 'text-c4c-petrol' : 'text-c4c-petrol')}>
          {icon}
        </span>
      )}
      <p className="max-w-[78ch] text-[13.5px] text-c4c-ink/80">{children}</p>
    </div>
  );
}
