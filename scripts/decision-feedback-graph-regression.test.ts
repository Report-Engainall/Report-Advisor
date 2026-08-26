import assert from 'node:assert/strict';
import { impactTruth, validateDecisionFeedbackGraph } from '../src/lib/decision-feedback-graph.ts';

const base = {
  tenantId: 'tenant-a', sourceId: 'source-1', evidenceId: 'evidence-1', metricId: 'metric-1', analysisId: 'analysis-1',
  recommendationId: 'recommendation-1', decisionId: 'decision-1', actionId: 'action-1', evidenceSnapshotId: 'snapshot-1',
};
assert.doesNotThrow(() => validateDecisionFeedbackGraph(base));
assert.throws(() => validateDecisionFeedbackGraph({ ...base, evidenceId: '' }), /DECISION_GRAPH_MISSING:evidenceId/);
assert.throws(() => validateDecisionFeedbackGraph(base, { requireOutcome: true }), /DECISION_GRAPH_MISSING:outcomeId/);
assert.throws(() => validateDecisionFeedbackGraph({ ...base, expectedImpact: Number.NaN }), /INVALID_NUMBER/);
assert.deepEqual(impactTruth(undefined, undefined), { expected: null, actual: null, measured: false });
assert.deepEqual(impactTruth(100, undefined), { expected: 100, actual: null, measured: false });
assert.deepEqual(impactTruth(100, 80), { expected: 100, actual: 80, measured: true });
assert.doesNotThrow(() => validateDecisionFeedbackGraph({ ...base, outcomeId: 'outcome-1', feedbackId: 'feedback-1' }, { requireOutcome: true, requireFeedback: true }));

console.log('Decision → Action → Outcome → Feedback graph regression: PASS');
