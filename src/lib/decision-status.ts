const ACTIONABLE_RECOMMENDATION_STATUSES = new Set([
  'new',
  'open',
  'proposed',
  'pending',
  'accepted',
  'approved',
  'in_progress',
]);

export function isActionableRecommendationStatus(status: string | null | undefined): boolean {
  const normalized = String(status ?? '').trim().toLowerCase();
  return ACTIONABLE_RECOMMENDATION_STATUSES.has(normalized);
}