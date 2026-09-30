// components/shared/QuestionBlock.tsx — App Mockup .q/.q-head/.q-body,
// the survey builder's per-question card. Header is white, body is
// grey-bg so the field stands out against it.
import type { ReactNode } from 'react';

export function QuestionBlock({ icon, headerActions, children }: { icon?: ReactNode; headerActions?: ReactNode; children: ReactNode }) {
  return (
    <div className="mt-4 border border-c4c-rule bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-c4c-rule px-[18px] py-3.5">
        {icon && <span className="h-[15px] w-[15px] text-c4c-petrol [&_svg]:h-[15px] [&_svg]:w-[15px]">{icon}</span>}
        {headerActions && <div className="ml-auto flex items-center gap-2.5">{headerActions}</div>}
      </div>
      <div className="bg-c4c-grey-bg px-[22px] py-5">{children}</div>
    </div>
  );
}

export function QuestionTitle({ required, children }: { required?: boolean; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3.5">
      <h4 className="text-[15px] font-semibold tracking-[-0.01em] text-black">
        {children}
        {required && <span className="text-black"> *</span>}
      </h4>
    </div>
  );
}

export function QuestionHint({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-[13px] text-c4c-petrol">{children}</p>;
}

export function QuestionActions({ children }: { children: ReactNode }) {
  return <div className="mt-3.5 flex justify-end">{children}</div>;
}

export function CheckList({ children }: { children: ReactNode }) {
  return <div className="mt-3.5 flex flex-col gap-2.5">{children}</div>;
}

export function CheckItem({ label, checked, onChange }: { label: string; checked?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-black">
      <input
        type="checkbox"
        className="h-[15px] w-[15px] flex-shrink-0 accent-c4c-petrol"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      {label}
    </label>
  );
}
