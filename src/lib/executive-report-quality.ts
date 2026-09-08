export type ExecutiveReportQuality = {
  hasDecisionEvidence: boolean;
  hasOutcomeEvidence: boolean;
  hasApproval: boolean;
  hasWorkItems: boolean;
  learningAvailable: boolean;
  completeness: number;
};

export function summarizeExecutiveReportQuality(input: {
  hasDecisionEvidence: boolean;
  hasOutcomeEvidence: boolean;
  hasApproval: boolean;
  hasWorkItems: boolean;
  learningAvailable: boolean;
}): ExecutiveReportQuality {
  const checks = Object.values(input);
  const completeness = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return { ...input, completeness };
}
