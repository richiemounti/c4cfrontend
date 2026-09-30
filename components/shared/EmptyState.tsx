// components/shared/EmptyState.tsx — App Mockup .empty. Grey, not
// charcoal, so it reads as an absence rather than a sentence to take in.
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function EmptyState({ icon, title, description, actions }: EmptyStateProps) {
  return (
    <div className="px-7 py-[62px] text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center bg-c4c-grey-bg">
        <span className="h-[26px] w-[26px] text-c4c-petrol [&_svg]:h-[26px] [&_svg]:w-[26px]">{icon}</span>
      </div>
      <h3 className="text-[19px] font-semibold tracking-[-0.02em] text-black">{title}</h3>
      {description && <p className="mx-auto mt-[9px] max-w-[44ch] text-sm text-c4c-petrol">{description}</p>}
      {actions && <div className="mt-[22px] flex flex-wrap justify-center gap-2.5">{actions}</div>}
    </div>
  );
}
