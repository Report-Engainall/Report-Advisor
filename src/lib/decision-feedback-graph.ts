export type DecisionFeedbackGraph = {
  tenantId: string;
  sourceId: string;
  evidenceId: string;
  metricId: string;
  analysisId: string;
  recommendationId: string;
  decisionId: string;
  actionId: string;
  outcomeId?: string;
  feedbackId?: string;
  evidenceSnapshotId: string;
  expectedImpact?: number | null;
  actualImpact?: number | null;
};

function optionalFinite(value: number | null | undefined, field: string): void {
  if (value !== undefined && value !== null && !Number.isFinite(value)) throw new Error(`DECISION_GRAPH_INVALID_NUMBER:${field}`);
}

export function validateDecisionFeedbackGraph(graph: DecisionFeedbackGraph, options: { requireOutcome?: boolean; requireFeedback?: boolean } = {}): DecisionFeedbackGraph {
  const required = ['tenantId', 'sourceId', 'evidenceId', 'metricId', 'analysisId', 'recommendationId', 'decisionId', 'actionId', 'evidenceSnapshotId'] as const;
  for (const key of required) if (!graph[key]) throw new Error(`DECISION_GRAPH_MISSING:${key}`);
  if (options.requireOutcome && !graph.outcomeId) throw new Error('DECISION_GRAPH_MISSING:outcomeId');
  if (options.requireFeedback && !graph.feedbackId) throw new Error('DECISION_GRAPH_MISSING:feedbackId');
  optionalFinite(graph.expectedImpact, 'expectedImpact');
  optionalFinite(graph.actualImpact, 'actualImpact');
  return Object.freeze({ ...graph });
}

export function impactTruth(expectedImpact: number | null | undefined, actualImpact: number | null | undefined): { expected: number | null; actual: number | null; measured: boolean } {
  return { expected: expectedImpact ?? null, actual: actualImpact ?? null, measured: Number.isFinite(expectedImpact) && Number.isFinite(actualImpact) };
}
