export type OutcomeLearningBinding = {
  outcomeId: string;
  recommendationId: string;
  archetypeId: string;
  profileVersion: number;
  ruleId: string | null;
  sourceHash: string;
  reportExecutionJobId: string;
  evidenceSnapshotId: string | null;
  expectedOutcome: string | null;
  actualOutcome: string | null;
  outcomeState: 'OBSERVED' | 'INSUFFICIENT' | 'NOT_AVAILABLE';
};

export function buildOutcomeLearningBinding(input: {
  outcomeId: string;
  recommendationId: string;
  archetypeId: string | null | undefined;
  profileVersion: number | null | undefined;
  ruleId: string | null | undefined;
  sourceHash: string;
  reportExecutionJobId: string;
  evidenceSnapshotId?: string | null;
  expectedOutcome?: string | null;
  actualOutcome?: string | null;
}): OutcomeLearningBinding {
  const outcomeState: OutcomeLearningBinding['outcomeState'] =
    input.actualOutcome?.trim() ? 'OBSERVED' : input.expectedOutcome?.trim() ? 'INSUFFICIENT' : 'NOT_AVAILABLE';

  return {
    outcomeId: input.outcomeId,
    recommendationId: input.recommendationId,
    archetypeId: input.archetypeId ?? 'generic.report',
    profileVersion: input.profileVersion ?? 1,
    ruleId: input.ruleId ?? null,
    sourceHash: input.sourceHash,
    reportExecutionJobId: input.reportExecutionJobId,
    evidenceSnapshotId: input.evidenceSnapshotId ?? null,
    expectedOutcome: input.expectedOutcome ?? null,
    actualOutcome: input.actualOutcome ?? null,
    outcomeState,
  };
}
