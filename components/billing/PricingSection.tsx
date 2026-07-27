'use client';

import { useMemo, useState } from 'react';
import { Loader2, Mail, Sparkles, Users2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import TierCard from './TierCard';
import AddOnCard from './AddOnCard';
import OrderSummary from './OrderSummary';
import { usePricingCatalogue, useCreateCheckoutSession } from '@/hooks/useSubscription';
import { formatGBP, getProjectCountBand, resolveTierForProduct, TIER_LABELS } from '@/lib/billingHelpers';
import type { BillingInterval, SellableBundleTrack, TierKey } from '@/types/subscription';

const SALES_EMAIL = 'kate@connectgo.co.uk';

const TRACK_OPTIONS: { value: SellableBundleTrack; label: string; blurb: string; icon: typeof Users2 }[] = [
  {
    value: 'self_serve',
    label: 'Self-Serve',
    blurb: 'Run the platform yourselves — stakeholder mapping, ToC design, survey builds & data visualisation.',
    icon: Sparkles,
  },
  {
    value: 'supported',
    label: 'Supported',
    blurb: 'Everything in Self-Serve, plus dedicated account management and mentoring from our team.',
    icon: Users2,
  },
];

const CORE_KEY_FOR_TRACK: Record<SellableBundleTrack, string> = {
  self_serve: 'om_self_serve',
  supported: 'om_supported',
};

interface PricingSectionProps {
  organizationId: string;
  defaultProjectCount: number;
}

export default function PricingSection({ organizationId, defaultProjectCount }: PricingSectionProps) {
  const { data: catalogueResponse, isLoading, isError } = usePricingCatalogue();
  const checkoutMutation = useCreateCheckoutSession(organizationId);

  const catalogue = catalogueResponse?.data ?? [];

  const recommendedBand = getProjectCountBand(defaultProjectCount);
  const initialTier: TierKey | null =
    recommendedBand === 'tier_1' || recommendedBand === 'tier_2' || recommendedBand === 'tier_3'
      ? recommendedBand
      : null;

  const [track, setTrack] = useState<SellableBundleTrack>('self_serve');
  const [interval, setInterval] = useState<BillingInterval>('year');
  const [selectedTier, setSelectedTier] = useState<TierKey | null>(initialTier);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const coreProduct = useMemo(
    () => catalogue.find((p) => p.key === CORE_KEY_FOR_TRACK[track]),
    [catalogue, track]
  );

  const availableAddOns = useMemo(
    () => catalogue.filter((p) => !p.isCoreBundle && (p.bundleTrack === track || p.bundleTrack === 'any')),
    [catalogue, track]
  );

  const handleTrackChange = (next: SellableBundleTrack) => {
    setTrack(next);
    setSelectedAddOns((prev) =>
      prev.filter((key) => {
        const product = catalogue.find((p) => p.key === key);
        return product && (product.bundleTrack === next || product.bundleTrack === 'any');
      })
    );
  };

  const toggleAddOn = (key: string) => {
    setSelectedAddOns((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const coreTierPrice = coreProduct && selectedTier ? coreProduct.tiers.find((t) => t.tier === selectedTier) : null;

  const coreLine =
    coreProduct && coreTierPrice
      ? {
          label: `${coreProduct.name} (${TIER_LABELS[coreTierPrice.tier]})`,
          amountPence: interval === 'year' ? coreTierPrice.annualAmountPence : coreTierPrice.monthlyAmountPence,
        }
      : null;

  const addOnLines = selectedAddOns
    .map((key) => {
      const product = catalogue.find((p) => p.key === key);
      if (!product || !selectedTier) return null;
      const resolvedTier = resolveTierForProduct(product, selectedTier);
      const tierPrice = product.tiers.find((t) => t.tier === resolvedTier) ?? product.tiers[0];
      const amountPence = interval === 'year' ? tierPrice.annualAmountPence : tierPrice.monthlyAmountPence;
      return { label: product.name, amountPence };
    })
    .filter((line): line is { label: string; amountPence: number } => line !== null);

  const handleSubscribe = () => {
    if (!selectedTier) return;
    checkoutMutation.mutate({
      bundleTrack: track,
      tier: selectedTier,
      interval,
      addOns: selectedAddOns,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-c4c-border bg-white py-16">
        <Loader2 className="h-6 w-6 animate-spin text-c4c-ink/40" />
      </div>
    );
  }

  if (isError || catalogue.length === 0) {
    return (
      <div className="rounded-xl border border-c4c-border bg-white p-8 text-center text-sm text-c4c-ink/60">
        Couldn&apos;t load pricing right now. Please refresh the page.
      </div>
    );
  }

  return (
    <div id="plans" className="scroll-mt-6">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="font-title text-xl font-semibold text-c4c-ink">Plans &amp; pricing</h2>
        <p className="text-sm text-c4c-ink/60">Pricing scales with the number of active projects in your portfolio.</p>
      </div>

      {/* Track toggle */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TRACK_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = track === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleTrackChange(option.value)}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                active
                  ? 'border-c4c-teal bg-c4c-teal/5 ring-1 ring-c4c-teal'
                  : 'border-c4c-border bg-white hover:border-c4c-teal/40'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  active ? 'bg-c4c-teal text-white' : 'bg-c4c-cream-2 text-c4c-ink/50'
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-title text-sm font-semibold text-c4c-ink">{option.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-c4c-ink/60">{option.blurb}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interval toggle */}
      <div className="mb-6 inline-flex rounded-lg bg-c4c-cream-2 p-1">
        {(['year', 'month'] as BillingInterval[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setInterval(value)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              interval === value ? 'bg-white text-c4c-ink shadow-sm' : 'text-c4c-ink/50 hover:text-c4c-ink/70'
            )}
          >
            {value === 'year' ? 'Billed annually' : 'Billed monthly'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {/* Tier cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coreProduct?.tiers.map((tierPrice) => (
              <TierCard
                key={tierPrice.tier}
                tierPrice={tierPrice}
                interval={interval}
                selected={selectedTier === tierPrice.tier}
                recommended={recommendedBand === tierPrice.tier}
                onSelect={() => setSelectedTier(tierPrice.tier)}
              />
            ))}

            {/* Enterprise - always sales-assisted, never self-serve checkout */}
            <div className="flex flex-col rounded-xl border border-dashed border-c4c-border bg-c4c-cream-2/50 p-5">
              <p className="font-title text-sm font-semibold uppercase tracking-wide text-c4c-ink/60">
                Enterprise
              </p>
              <p className="mt-0.5 text-xs text-c4c-ink/50">5+ projects</p>
              <p className="mt-4 font-title text-xl font-bold text-c4c-ink">Custom pricing</p>
              <p className="mt-1 text-xs text-c4c-ink/40">Volume-negotiated rate</p>
              <Button asChild variant="outline" className="mt-4">
                <a href={`mailto:${SALES_EMAIL}?subject=Enterprise%20pricing%20inquiry`}>
                  <Mail className="h-3.5 w-3.5" />
                  Contact us
                </a>
              </Button>
            </div>
          </div>

          {/* Add-ons */}
          {availableAddOns.length > 0 && (
            <div className="mt-8">
              <h3 className="font-title text-sm font-semibold uppercase tracking-wide text-c4c-ink/60">
                Add-on modules
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {availableAddOns.map((product) => (
                  <AddOnCard
                    key={product.key}
                    product={product}
                    tier={selectedTier ?? 'tier_1'}
                    interval={interval}
                    selected={selectedAddOns.includes(product.key)}
                    onToggle={() => toggleAddOn(product.key)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <OrderSummary
          coreLine={coreLine}
          addOnLines={addOnLines}
          interval={interval}
          onSubscribe={handleSubscribe}
          submitting={checkoutMutation.isPending}
          disabled={!selectedTier}
        />
      </div>
    </div>
  );
}
