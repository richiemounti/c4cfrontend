// lib/billingHelpers.ts
// Small pure display/selection helpers shared by the billing components. Mirrors the
// equivalent logic in c4cbackend/services/subscriptionGating.service.ts and
// controllers/subscription.controller.ts (resolveTierForProduct) - kept here only for
// client-side rendering/selection, never for enforcement (the backend is authoritative).
import type { CatalogueProduct, ProjectCountBand, TierKey } from '@/types/subscription';

export function formatGBP(amountPence: number): string {
  return `£${(amountPence / 100).toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
}

export function getProjectCountBand(projectCount: number): ProjectCountBand | null {
  if (projectCount <= 0) return null;
  if (projectCount === 1) return 'tier_1';
  if (projectCount <= 3) return 'tier_2';
  if (projectCount <= 5) return 'tier_3';
  return 'enterprise';
}

/** Flat-rate add-ons (e.g. SROI) were only seeded with a single tier's Price. */
export function resolveTierForProduct(product: CatalogueProduct, requestedTier: TierKey): TierKey {
  return product.tiers.length === 1 ? product.tiers[0].tier : requestedTier;
}

export const TIER_LABELS: Record<TierKey, string> = {
  tier_1: 'Tier 1',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',
};

export const TIER_ORDER: Record<TierKey, number> = {
  tier_1: 1,
  tier_2: 2,
  tier_3: 3,
};
