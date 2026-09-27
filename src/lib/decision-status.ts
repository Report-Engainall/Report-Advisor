export const ACTIONABLE_RECOMMENDATION_STATUSES = new Set([
  'new',
  'OPEN',
  'approved',
  'in_progress',
  // Backward-compatible client state retained only while legacy rows remain.
  'accepted',
]);

export function isActionableRecommendationStatus(status: string | null | undefined): boolean {
  return typeof status === 'string' && ACTIONABLE_RECOMMENDATION_STATUSES.has(status);
}
