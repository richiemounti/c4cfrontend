// hooks/usePageContext.ts
'use client';

import { useMemo } from 'react';
import type { PageContext, ContextLink, ResourceType } from '@/lib/api/inbox';

interface UsePageContextOptions {
  resourceType: ResourceType;
  resourceId: string;
  label: string;
  // Optional: override the href instead of using window.location.pathname
  href?: string;
}

interface PageContextResult {
  pageContext: PageContext;
  contextLink: ContextLink;
}

/**
 * Builds a PageContext and ContextLink from the current URL and passed metadata.
 * Drop into any component that hosts a MentionTextarea.
 *
 * Example:
 *   const { pageContext, contextLink } = usePageContext({
 *     resourceType: 'review',
 *     resourceId: review._id,
 *     label: `Review: ${review.title}`,
 *   });
 */
export function usePageContext({
  resourceType,
  resourceId,
  label,
  href,
}: UsePageContextOptions): PageContextResult {
  return useMemo(() => {
    const resolvedHref =
      href ?? (typeof window !== 'undefined' ? window.location.pathname : '/');

    const pageContext: PageContext = {
      resourceType,
      resourceId,
      label,
      href: resolvedHref,
    };

    const contextLink: ContextLink = {
      resourceType,
      resourceId,
      label,
      href: resolvedHref,
    };

    return { pageContext, contextLink };
  }, [resourceType, resourceId, label, href]);
}