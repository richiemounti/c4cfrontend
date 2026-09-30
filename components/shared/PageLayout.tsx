// components/shared/PageLayout.tsx — smaller App Mockup layout helpers
// used inside cards: .divider, .row-head, .card-lede, .desc, .meta/
// .meta-item, .module-head/.byline, .step-meta.
import type { ReactNode } from 'react';

export function Divider() {
  return <hr className="my-[30px] border-0 border-t border-c4c-rule" />;
}

export function RowHead({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-4">{children}</div>;
}

export function CardLede({ children }: { children: ReactNode }) {
  return <p className="mt-2.5 text-[14.5px] text-c4c-petrol">{children}</p>;
}

// The "Description" box on Project Home — a grey-bg block inside a card.
export function DescBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-5 bg-c4c-grey-bg px-5 py-[18px]">
      <span className="font-title text-[10px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">{label}</span>
      <p className="mt-[7px] text-[15px] text-black">{children}</p>
    </div>
  );
}

export function MetaGrid({ children }: { children: ReactNode }) {
  return <div className="mt-6 grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">{children}</div>;
}

export function MetaItem({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 h-4 w-4 flex-shrink-0 text-c4c-petrol [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <div>
        <div className="font-title text-[10px] font-semibold uppercase tracking-[0.12em] text-c4c-petrol">{label}</div>
        <div className="mt-1.5 text-[15px] font-medium text-black">{value}</div>
      </div>
    </div>
  );
}

// The module-complete header (e.g. "100% complete" summary card).
export function ModuleHead({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start justify-between gap-4">{children}</div>;
}

export function Byline({ children }: { children: ReactNode }) {
  return <div className="mt-[11px] flex flex-wrap gap-[18px]">{children}</div>;
}

export function BylineItem({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-c4c-petrol">
      {icon && <span className="h-[13px] w-[13px] [&_svg]:h-[13px] [&_svg]:w-[13px]">{icon}</span>}
      {children}
    </span>
  );
}

// The Project Home "Project Sites" grid — a generic tinted info tile.
export function TileGrid({ children }: { children: ReactNode }) {
  return <div className="mt-4.5 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">{children}</div>;
}

export function Tile({ title, tag, caption }: { title: string; tag?: ReactNode; caption?: string }) {
  return (
    <div className="border border-c4c-rule bg-c4c-grey-bg px-[18px] py-[17px]">
      <div className="flex items-center justify-between gap-2.5">
        <span className="font-title text-[15px] font-semibold tracking-[-0.015em] text-black">{title}</span>
        {tag}
      </div>
      {caption && <div className="mt-2.5 text-[13px] text-c4c-petrol">{caption}</div>}
    </div>
  );
}

// The survey-builder stage header (eyebrow label + question title).
export function StepMeta({ children }: { children: ReactNode }) {
  return <div className="mt-[26px] flex flex-wrap items-baseline justify-between gap-3">{children}</div>;
}

export function StepMetaLabel({ children }: { children: ReactNode }) {
  return <p className="font-title text-[10.5px] font-semibold uppercase tracking-[0.11em] text-c4c-petrol">{children}</p>;
}

export function StepMetaTitle({ children }: { children: ReactNode }) {
  return <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-black">{children}</h3>;
}
