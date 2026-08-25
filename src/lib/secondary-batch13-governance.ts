export type RecommendationOption = {
  id: string;
  title: string;
  summary?: string;
  expectedBenefit?: number | null;
  cost?: number | null;
  risk?: number | null;
  confidence?: number | null;
  evidenceId?: string | null;
};

export type ApprovalRequirement = {
  required: boolean;
  reason: string;
  roles: string[];
  expiresAt?: string | null;
};

export type SafeRecommendation = {
  id: string;
  title: string;
  reason?: string;
  options: RecommendationOption[];
  approval: ApprovalRequirement;
  status: 'proposed' | 'blocked' | 'approved' | 'rejected' | 'unknown';
};

export function hasAuthoritativeEvidence(option: RecommendationOption): boolean {
  return Boolean(option.evidenceId);
}

export function classifyRecommendationStatus(input: Pick<SafeRecommendation, 'status' | 'options'>): SafeRecommendation['status'] {
  if (input.status === 'proposed' && input.options.length === 0) return 'unknown';
  if (input.status === 'proposed' && input.options.every(option => !hasAuthoritativeEvidence(option))) return 'blocked';
  return input.status;
}

export function requiresApproval(input: ApprovalRequirement): boolean {
  return input.required || input.roles.length > 0;
}
