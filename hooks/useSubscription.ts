// hooks/useSubscription.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as subscriptionApi from '@/lib/api/subscription';
import type { CreateCheckoutSessionRequest } from '@/types/subscription';

export const subscriptionKeys = {
  all: ['subscription'] as const,
  catalogue: () => [...subscriptionKeys.all, 'catalogue'] as const,
  organization: (organizationId: string) => [...subscriptionKeys.all, 'organization', organizationId] as const,
  projectGate: (organizationId: string) => [...subscriptionKeys.all, 'project-gate', organizationId] as const,
};

export function usePricingCatalogue() {
  return useQuery({
    queryKey: subscriptionKeys.catalogue(),
    queryFn: () => subscriptionApi.getPricingCatalogue(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOrganizationSubscription(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionKeys.organization(organizationId),
    queryFn: () => subscriptionApi.getOrganizationSubscription(organizationId),
    enabled: !!organizationId && options?.enabled !== false,
  });
}

export function useProjectCreationGate(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subscriptionKeys.projectGate(organizationId),
    queryFn: () => subscriptionApi.getProjectCreationGate(organizationId),
    enabled: !!organizationId && options?.enabled !== false,
  });
}

export function useCreateCheckoutSession(organizationId: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateCheckoutSessionRequest) =>
      subscriptionApi.createCheckoutSession(organizationId, payload),
    onSuccess: (response) => {
      const url = response.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast({ title: 'Error', description: 'Stripe did not return a checkout URL', variant: 'destructive' });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Checkout failed',
        description: error?.message || 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useCreatePortalSession(organizationId: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => subscriptionApi.createPortalSession(organizationId),
    onSuccess: (response) => {
      const url = response.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast({ title: 'Error', description: 'Stripe did not return a billing portal URL', variant: 'destructive' });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to open the billing portal.',
        variant: 'destructive',
      });
    },
  });
}

/** Call after a checkout/portal round-trip (or webhook-driven change) to refresh billing state. */
export function useInvalidateSubscription(organizationId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.organization(organizationId) });
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.projectGate(organizationId) });
  };
}
