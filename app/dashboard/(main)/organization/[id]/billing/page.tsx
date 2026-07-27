// app/dashboard/(main)/organization/[id]/billing/page.tsx
'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganizationSubscription, useProjectCreationGate, useInvalidateSubscription } from '@/hooks/useSubscription';
import CurrentPlanCard from '@/components/billing/CurrentPlanCard';
import PricingSection from '@/components/billing/PricingSection';
import UpgradeBanner from '@/components/billing/UpgradeBanner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const ENTITLED_STATUSES = ['active', 'trialing'];
const SALES_EMAIL = 'kate@connectgo.co.uk';

function BillingPageContent() {
  const params = useParams();
  const organizationId = params?.id as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const invalidateSubscription = useInvalidateSubscription(organizationId);

  const { data: subResponse, isLoading: subLoading } = useOrganizationSubscription(organizationId);
  const { data: gateResponse, isLoading: gateLoading } = useProjectCreationGate(organizationId);

  const subscription = subResponse?.data ?? null;
  const gate = gateResponse?.data ?? null;
  const isEntitled =
    !!subscription && (ENTITLED_STATUSES.includes(subscription.status) || !!subscription.manuallyManaged);

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (!checkout) return;

    if (checkout === 'success') {
      toast({
        title: 'Payment received',
        description: "Your subscription is being activated — this can take a few seconds to appear below.",
      });
      invalidateSubscription();
    } else if (checkout === 'cancelled') {
      toast({
        title: 'Checkout cancelled',
        description: 'No changes were made to your subscription.',
        variant: 'destructive',
      });
    }

    router.replace(`/dashboard/organization/${organizationId}/billing`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loading = subLoading || gateLoading;

  return (
    <div className="flex-1 min-h-screen bg-c4c-cream">
      <div className="border-b border-c4c-border bg-white px-8 py-6">
        <h1 className="font-title text-2xl font-semibold text-c4c-ink">Billing &amp; Plan</h1>
        <p className="mt-1 text-sm text-c4c-ink/60">
          Manage your organization&apos;s subscription and add-on modules.
        </p>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 p-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-c4c-ink/40" />
          </div>
        ) : (
          <>
            {gate?.upgradeRequired && <UpgradeBanner gate={gate} />}

            {isEntitled && subscription ? (
              <>
                <CurrentPlanCard subscription={subscription} organizationId={organizationId} />

                {!subscription.manuallyManaged && (
                  <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-c4c-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-c4c-ink/60">
                      Need to change tiers, switch tracks, or add/remove a module? We&apos;ll help you migrate
                      without disrupting your current billing period.
                    </p>
                    <a
                      href={`mailto:${SALES_EMAIL}?subject=Change%20subscription%20plan`}
                      className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-c4c-teal hover:underline"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Request a plan change
                    </a>
                  </div>
                )}
              </>
            ) : (
              <PricingSection organizationId={organizationId} defaultProjectCount={gate?.currentProjectCount ?? 0} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  const params = useParams();
  const organizationId = params?.id as string;

  return (
    <ProtectedRoute requireOrgAdmin organizationId={organizationId}>
      <BillingPageContent />
    </ProtectedRoute>
  );
}
