// Shared encode/decode for survey-builder URL segments that carry one or more IDs
// (stakeholder group IDs, theory-of-change stage IDs) as a single comma-joined string.
export const encodeIdList = (ids: string[]): string => ids.join(',');

export const decodeIdList = (raw?: string | null): string[] =>
  raw ? decodeURIComponent(raw).split(',').filter(Boolean) : [];

// Scopes a sessionStorage key to the exact combo it belongs to, so backing out of one
// combo and starting a different one in the same tab can't leak the previous combo's
// question/demographic selections into the new one's create flow. actionId/impactId
// disambiguate distinct Action/Impact records that happen to share the same
// stakeholder-group set — without them, two different combos would collide on this key.
export const builderStorageKey = (
  base: string,
  stakeholderGroupIds: string[],
  stageIds: string[],
  sourceIds?: { actionId?: string; impactId?: string }
): string =>
  `${base}:${encodeIdList(stakeholderGroupIds)}:${encodeIdList(stageIds)}:${sourceIds?.actionId || ''}:${sourceIds?.impactId || ''}`;
