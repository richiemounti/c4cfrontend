// types/subscription.ts
// Mirrors c4cbackend/constants/stripeCatalogue.constants.ts and models/subscription.model.ts.

export type TierKey = 'tier_1' | 'tier_2' | 'tier_3';
export type ProjectCountBand = TierKey | 'enterprise';
export type BundleTrack = 'self_serve' | 'supported' | 'any';
export type SellableBundleTrack = 'self_serve' | 'supported';
export type BillingInterval = 'year' | 'month';

export interface CatalogueTierPrice {
  tier: TierKey;
  projectRange: string;
  annualAmountPence: number;
  monthlyAmountPence: number;
}

export interface CatalogueProduct {
  key: string;
  name: string;
  description: string;
  isCoreBundle: boolean;
  bundleTrack: BundleTrack;
  tiers: CatalogueTierPrice[];
}

export interface SubscriptionItem {
  catalogueKey: string;
  tier: TierKey;
  interval: BillingInterval;
  stripePriceId: string;
  stripeSubscriptionItemId?: string;
}

export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

export interface Subscription {
  _id: string;
  organization: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  status: SubscriptionStatus;
  bundleTrack?: SellableBundleTrack;
  currentTier?: TierKey;
  items: SubscriptionItem[];
  manuallyManaged?: boolean;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreationGate {
  isEntitled: boolean;
  manuallyManaged: boolean;
  currentProjectCount: number;
  projectCountAfterCreate: number;
  currentTier: TierKey | null;
  requiredBand: ProjectCountBand | null;
  upgradeRequired: boolean;
  requiresSalesContact: boolean;
}

export interface CreateCheckoutSessionRequest {
  bundleTrack: SellableBundleTrack;
  tier: TierKey;
  interval: BillingInterval;
  addOns?: string[];
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}
