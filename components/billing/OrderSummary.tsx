'use client';

import { Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatGBP } from '@/lib/billingHelpers';
import type { BillingInterval } from '@/types/subscription';

interface SummaryLine {
  label: string;
  amountPence: number;
}

interface OrderSummaryProps {
  coreLine: SummaryLine | null;
  addOnLines: SummaryLine[];
  interval: BillingInterval;
  onSubscribe: () => void;
  submitting: boolean;
  disabled: boolean;
}

export default function OrderSummary({
  coreLine,
  addOnLines,
  interval,
  onSubscribe,
  submitting,
  disabled,
}: OrderSummaryProps) {
  const total = (coreLine?.amountPence ?? 0) + addOnLines.reduce((sum, line) => sum + line.amountPence, 0);

  return (
    <div className="rounded-xl border border-c4c-border bg-white p-5 shadow-sm lg:sticky lg:top-6">
      <p className="font-title text-sm font-semibold uppercase tracking-wide text-c4c-ink/60">
        Order summary
      </p>

      <div className="mt-4 space-y-2.5">
        {coreLine ? (
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="text-c4c-ink/70">{coreLine.label}</span>
            <span className="whitespace-nowrap font-medium text-c4c-ink">
              {formatGBP(coreLine.amountPence)}
            </span>
          </div>
        ) : (
          <p className="text-sm text-c4c-ink/40">Choose a tier to get started</p>
        )}

        {addOnLines.map((line) => (
          <div key={line.label} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-c4c-ink/70">{line.label}</span>
            <span className="whitespace-nowrap font-medium text-c4c-ink">{formatGBP(line.amountPence)}</span>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="flex items-baseline justify-between">
        <span className="font-title text-sm font-semibold text-c4c-ink">
          Total, billed {interval === 'year' ? 'annually' : 'monthly'}
        </span>
        <span className="font-title text-2xl font-bold text-c4c-ink">{formatGBP(total)}</span>
      </div>
      <p className="mt-1 text-xs text-c4c-ink/40">Ex VAT — tax is calculated at checkout</p>

      <Button
        onClick={onSubscribe}
        disabled={disabled || submitting}
        className="mt-5 w-full bg-c4c-ink text-white hover:bg-c4c-ink/90"
        size="lg"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? 'Redirecting to checkout…' : 'Subscribe'}
      </Button>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-c4c-ink/40">
        <ShieldCheck className="h-3.5 w-3.5" />
        Secure checkout powered by Stripe
      </div>
    </div>
  );
}
