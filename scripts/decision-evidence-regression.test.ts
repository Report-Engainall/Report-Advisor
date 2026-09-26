import assert from 'node:assert/strict';
import { createDecision } from '../src/lib/free-toolbox/decision-log.ts';
import { alternativeGroupDecisions } from '../src/lib/intelligence/decisionEngine.ts';

assert.throws(() => createDecision({
  title: 'بدون دليل', reason: 'invalid', status: 'proposed', priority: 1, evidenceIds: [], action: 'HOLD',
}), /DECISION_EVIDENCE_REQUIRED/);

const decision = createDecision({
  title: 'قرار موثق', reason: 'evidence-backed', status: 'proposed', priority: 1,
  evidenceIds: [' evidence-1 ', 'evidence-1', 'evidence-2'], action: 'BUY_SOON',
});
assert.deepEqual(decision.evidenceIds, ['evidence-1', 'evidence-2']);
const criticalWithoutCoverage = alternativeGroupDecisions([{
  id: 'g-null', name: 'مجموعة بلا تغطية', stockoutRisk: 'critical', normalizedStock: 10, normalizedDemand: 5,
  coverageDays: null, recommendedOrder: 20, trendPct: 4,
} as never])[0];
assert.ok(criticalWithoutCoverage);
assert.equal(criticalWithoutCoverage.evidence.some((item) => item.metric === 'group_coverage'), false);
assert.equal(criticalWithoutCoverage.evidence.some((item) => item.metric === 'group_coverage' && item.value === 0), false);

console.log('PASS: decision evidence stays fail-closed and never substitutes unavailable coverage with zero.');
