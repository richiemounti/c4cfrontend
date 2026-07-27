'use client';

import { Loader2, CreditCard, CalendarClock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { TIER_LABELS } from '@/lib/billingHelpers';
import { useCreatePortalSession } from '@/hooks/useSubscription';
import type { Subscription } from '@/types/subscription';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  trialing: 'bg-c4c-teal/10 text-c4c-teal border-c4c-teal/30',
  past_due: 'bg-c4c-orange/15 text-c4c-orange border-c4c-orange/30',
  unpaid: 'bg-c4c-red/10 text-c4c-red border-c4c-red/30',
  canceled: 'bg-c4c-ink/5 text-c4c-ink/60 border-c4c-border',
  paused: 'bg-c4c-ink/5 text-c4c-ink/60 border-c4c-border',
  incomplete: 'bg-c4c-ink/5 text-c4c-ink/60 border-c4c-border',
  incomplete_expired: 'bg-c4c-ink/5 text-c4c-ink/60 border-c4c-border',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Payment overdue',
  unpaid: 'Unpaid',
  canceled: 'Canceled',
  paused: 'Paused',
  incomplete: 'Incomplete',
  incomplete_expired: 'Expired',
};

const TRACK_LABELS: Record<string, string> = {
  self_serve: 'Self-Serve',
  supported: 'Supported',
};

interface CurrentPlanCardProps {
  subscription: Subscription;
  organizationId: string;
}

export default function CurrentPlanCard({ subscription, organizationId }: CurrentPlanCardProps) {
  const portalMutation = useCreatePortalSession(organizationId);

  const addOns = subscription.items.filter((item) => {
    const isCore = item.catalogueKey === 'om_self_serve' || item.catalogueKey === 'om_supported';
    return !isCore;
  });

  const renewalDate = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="overflow-hidden rounded-xl border border-c4c-border bg-white shadow-sm">
      <div className="c4c-grad-bg h-1.5 w-full" />
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-title text-lg font-semibold text-c4c-ink">
              {subscription.manuallyManaged
                ? 'Enterprise plan'
                : `${subscription.bundleTrack ? TRACK_LABELS[subscription.bundleTrack] : 'Plan'}${
                    subscription.currentTier ? ` — ${TIER_LABELS[subscription.currentTier]}` : ''
                  }`}
            </h2>
            <Badge
              variant="outline"
              className={cn('font-medium', STATUS_STYLES[subscription.status] ?? STATUS_STYLES.incomplete)}
            >
              {subscription.manuallyManaged ? 'Managed' : STATUS_LABELS[subscription.status] ?? subscription.status}
            </Badge>
          </div>

          {addOns.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {addOns.map((item) => (
                <Badge key={item.catalogueKey} variant="secondary" className="font-normal">
                  {item.catalogueKey.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-1.5 text-sm text-c4c-ink/60">
            {renewalDate && !subscription.manuallyManaged && (
              <div className="flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                {subscription.cancelAtPeriodEnd
                  ? `Ends on ${renewalDate} — will not renew`
                  : `Renews on ${renewalDate}`}
              </div>
            )}
            {subscription.manuallyManaged && (
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Managed directly by ConnectGo — no self-serve billing
              </div>
            )}
          </div>
        </div>

        {!subscription.manuallyManaged && (
          <div className="shrink-0">
            <Button
              variant="outline"
              onClick={() => portalMutation.mutate()}
              disabled={portalMutation.isPending}
            >
              {portalMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Manage billing
            </Button>
          </div>
        )}
      </div>

      {subscription.status === 'past_due' && (
        <>
          <Separator />
          <div className="bg-c4c-orange/10 px-6 py-3 text-sm text-c4c-orange">
            Your last payment failed. Update your payment method via &ldquo;Manage billing&rdquo; to avoid
            losing access.
          </div>
        </>
      )}
    </div>
  );
}
