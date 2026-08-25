export type ExplainabilityEvidence = {
  id: string;
  label: string;
  sourceId?: string | null;
};

export type DecisionSafetyState = 'allowed' | 'blocked' | 'unknown';

export type DecisionExplanation = {
  summary: string;
  calculation?: string | null;
  assumptions: string[];
  uncertainty?: string | null;
  alternatives: string[];
  whyNot?: string | null;
  evidence: ExplainabilityEvidence[];
  safety: DecisionSafetyState;
};

export function classifyDecisionSafety(input: {
  evidenceCount: number;
  freshnessKnown: boolean;
  approvalRequired: boolean;
  approved: boolean;
}): DecisionSafetyState {
  if (input.evidenceCount === 0 || !input.freshnessKnown) return 'unknown';
  if (input.approvalRequired && !input.approved) return 'blocked';
  return 'allowed';
}

export function explainWhyNot(reason: string | null | undefined): string {
  return reason?.trim() || 'No authoritative reason is available.';
}
