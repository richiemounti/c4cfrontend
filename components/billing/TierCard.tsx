'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatGBP, TIER_LABELS } from '@/lib/billingHelpers';
import type { CatalogueTierPrice, BillingInterval } from '@/types/subscription';

interface TierCardProps {
  tierPrice: CatalogueTierPrice;
  interval: BillingInterval;
  selected: boolean;
  recommended?: boolean;
  onSelect: () => void;
}

export default function TierCard({ tierPrice, interval, selected, recommended, onSelect }: TierCardProps) {
  const amount = interval === 'year' ? tierPrice.annualAmountPence : tierPrice.monthlyAmountPence;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative flex w-full flex-col rounded-xl border bg-white p-5 text-left shadow-sm transition-colors',
        selected
          ? 'border-c4c-teal ring-2 ring-c4c-teal shadow-md'
          : 'border-c4c-border hover:border-c4c-teal/50 hover:shadow-md'
      )}
    >
      {selected && (
        <span className="absolute -top-px left-0 right-0 h-1 rounded-t-xl c4c-grad-bg" aria-hidden />
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className="font-title text-sm font-semibold tracking-wide text-c4c-ink/60 uppercase">
            {TIER_LABELS[tierPrice.tier]}
          </p>
          <p className="mt-0.5 text-xs text-c4c-ink/50">{tierPrice.projectRange}</p>
        </div>
        {recommended && (
          <span className="rounded-full bg-c4c-yellow/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-c4c-ink/70">
            Your plan
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-title text-3xl font-bold text-c4c-ink">{formatGBP(amount)}</span>
        <span className="text-sm text-c4c-ink/50">/{interval === 'year' ? 'yr' : 'mo'}</span>
      </div>
      <p className="mt-0.5 text-xs text-c4c-ink/40">Ex VAT</p>

      <div
        className={cn(
          'mt-4 flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors',
          selected ? 'bg-c4c-ink text-white' : 'bg-c4c-cream-2 text-c4c-ink/70'
        )}
      >
        {selected && <Check className="h-4 w-4" />}
        {selected ? 'Selected' : 'Select'}
      </div>
    </motion.button>
  );
}
