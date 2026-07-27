'use client';

import { ArrowRight, Mail, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TIER_LABELS } from '@/lib/billingHelpers';
import type { ProjectCreationGate } from '@/types/subscription';

const SALES_EMAIL = 'kate@connectgo.co.uk';

interface UpgradeBannerProps {
  gate: ProjectCreationGate;
}

export default function UpgradeBanner({ gate }: UpgradeBannerProps) {
  const currentLabel = gate.currentTier ? TIER_LABELS[gate.currentTier] : 'no active plan';

  return (
    <div className="c4c-grad-bg rounded-xl p-[1.5px] shadow-sm">
      <div className="flex flex-col gap-3 rounded-[calc(0.75rem-1.5px)] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-c4c-yellow/20">
            <TrendingUp className="h-4.5 w-4.5 text-c4c-ink" />
          </div>
          <div>
            <p className="font-title text-sm font-semibold text-c4c-ink">
              {gate.requiresSalesContact
                ? "You're growing into Enterprise territory"
                : "Your project count has outgrown your plan"}
            </p>
            <p className="mt-0.5 text-sm text-c4c-ink/60">
              {gate.projectCountAfterCreate} project{gate.projectCountAfterCreate === 1 ? '' : 's'} needs{' '}
              {gate.requiresSalesContact ? 'a negotiated Enterprise plan' : `${TIER_LABELS[gate.requiredBand as 'tier_1' | 'tier_2' | 'tier_3']}`}
              , you're currently on {currentLabel}.
            </p>
          </div>
        </div>

        {gate.requiresSalesContact ? (
          <Button asChild className="shrink-0 bg-c4c-ink text-white hover:bg-c4c-ink/90">
            <a href={`mailto:${SALES_EMAIL}?subject=Enterprise%20pricing%20inquiry`}>
              <Mail className="h-4 w-4" />
              Contact sales
            </a>
          </Button>
        ) : (
          <Button asChild className="shrink-0 bg-c4c-ink text-white hover:bg-c4c-ink/90">
            <a href="#plans">
              View plans
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
