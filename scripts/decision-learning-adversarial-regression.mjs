import assert from 'node:assert/strict';
import { buildDecisionCase, recordDecisionOutcome, rankDecisionOptions } from '../src/lib/intelligence/decisionIntelligence.ts';

const evidence = [{ id: 'e1', label: 'verified sales snapshot', value: 100, confidence: 0.95, source: 'SYNTHETIC' }];
const options = [
  { id: 'o1', label: 'reorder', expectedImpact: 0.8, risk: 0.1, reversible: true, assumptions: [] },
  { id: 'o2', label: 'wait', expectedImpact: 0.4, risk: 0.2, reversible: true, assumptions: [] },
];
const ready = buildDecisionCase({ id: 'd1', problem: 'Stockout risk', evidence, options, recommendationId: 'o1', priority: 'HIGH' });
assert.equal(ready.status, 'READY');
assert.equal(ready.blockers.length, 0);
assert.equal(ready.recommendationId, 'o1');
assert.equal(rankDecisionOptions(options)[0].id, 'o1');

const missingEvidence = buildDecisionCase({ id: 'd2', problem: 'Unknown', evidence: [], options, priority: 'NORMAL' });
assert.equal(missingEvidence.status, 'BLOCKED');
assert.ok(missingEvidence.blockers.includes('EVIDENCE_MISSING'));

const weakEvidence = buildDecisionCase({ id: 'd3', problem: 'Weak', evidence: [{ id: 'e2', label: 'weak', confidence: 0.2 }], options, priority: 'NORMAL' });
assert.equal(weakEvidence.status, 'BLOCKED');
assert.ok(weakEvidence.blockers.includes('LOW_EVIDENCE_CONFIDENCE'));

const invalidRecommendation = buildDecisionCase({ id: 'd4', problem: 'Bad recommendation', evidence, options, recommendationId: 'not-an-option', priority: 'NORMAL' });
assert.equal(invalidRecommendation.status, 'BLOCKED');
assert.ok(invalidRecommendation.blockers.includes('INVALID_RECOMMENDATION'));

assert.deepEqual(recordDecisionOutcome({ decision: ready, actualImpact: 120, expectedImpact: 100 }), { error: 20, errorPct: 20, learningSignal: 'BETTER_THAN_EXPECTED' });
assert.deepEqual(recordDecisionOutcome({ decision: ready, actualImpact: 80, expectedImpact: 100 }), { error: -20, errorPct: -20, learningSignal: 'WORSE_THAN_EXPECTED' });
assert.equal(recordDecisionOutcome({ decision: ready, actualImpact: 0, expectedImpact: 0 }).learningSignal, 'AS_EXPECTED');

console.log('PASS decision evidence gate');
console.log('PASS recommendation must reference a real option');
console.log('PASS deterministic option ranking');
console.log('PASS outcome learning signals');
console.log('PASS synthetic decision-intelligence adversarial regression');
