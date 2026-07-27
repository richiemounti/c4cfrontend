'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatGBP } from '@/lib/billingHelpers';
import type { CatalogueProduct, BillingInterval, TierKey } from '@/types/subscription';
import { resolveTierForProduct } from '@/lib/billingHelpers';

interface AddOnCardProps {
  product: CatalogueProduct;
  tier: TierKey;
  interval: BillingInterval;
  selected: boolean;
  onToggle: () => void;
}

export default function AddOnCard({ product, tier, interval, selected, onToggle }: AddOnCardProps) {
  const resolvedTier = resolveTierForProduct(product, tier);
  const tierPrice = product.tiers.find((t) => t.tier === resolvedTier) ?? product.tiers[0];
  const amount = interval === 'year' ? tierPrice.annualAmountPence : tierPrice.monthlyAmountPence;
  const flatRate = product.tiers.length === 1;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border bg-white p-4 text-left transition-colors',
        selected ? 'border-c4c-teal ring-1 ring-c4c-teal' : 'border-c4c-border hover:border-c4c-teal/50'
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
          selected ? 'border-c4c-teal bg-c4c-teal text-white' : 'border-c4c-border bg-white'
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" />}
      </div>

      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-title text-sm font-semibold text-c4c-ink">{product.name}</p>
          <p className="whitespace-nowrap text-sm font-semibold text-c4c-ink">
            {formatGBP(amount)}
            <span className="text-xs font-normal text-c4c-ink/50">/{interval === 'year' ? 'yr' : 'mo'}</span>
          </p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-c4c-ink/60">{product.description}</p>
        {flatRate && (
          <span className="mt-1 inline-block text-[10px] font-medium uppercase tracking-wide text-c4c-teal">
            Flat rate — same price at every tier
          </span>
        )}
      </div>
    </button>
  );
}
