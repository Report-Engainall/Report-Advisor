import assert from 'node:assert/strict';
import { rankAlternativeCandidates } from '../src/lib/alternative-ranking.ts';

const candidate = {
  memberId: 'member-1',
  sku: 'ALT-001',
  conversionFactor: 1,
  productId: 'product-1',
  productName: 'Alternative',
  unit: 'piece',
  productActive: true,
  costPrice: null,
  sellingPrice: null,
};

const insufficient = rankAlternativeCandidates([candidate], {
  decisionFingerprint: 'd-1',
  decisionType: null,
  policyKey: null,
  recommendationId: null,
  outcomes: 2,
  measured: 2,
  correct: 2,
  partial: 0,
  incorrect: 0,
  unknown: 0,
  successRate: 1,
  averageImpact: 10,
  signal: 'positive',
});
assert.equal(insufficient[0].learningAdjustment, 0, 'learning must not activate below three outcomes');
assert.equal(insufficient[0].learningStatus, 'positive', 'raw signal is retained for explainability');
assert.match(insufficient[0].reason, /below governance threshold/);

const qualifiedPositive = rankAlternativeCandidates([candidate], {
  decisionFingerprint: 'd-2',
  decisionType: null,
  policyKey: null,
  recommendationId: null,
  outcomes: 3,
  measured: 3,
  correct: 3,
  partial: 0,
  incorrect: 0,
  unknown: 0,
  successRate: 1,
  averageImpact: 10,
  signal: 'positive',
});
assert.equal(qualifiedPositive[0].learningAdjustment, 0.15);
assert.equal(qualifiedPositive[0].finalScore, qualifiedPositive[0].baseScore + 0.15);

const qualifiedNegative = rankAlternativeCandidates([candidate], {
  decisionFingerprint: 'd-3',
  decisionType: null,
  policyKey: null,
  recommendationId: null,
  outcomes: 3,
  measured: 3,
  correct: 0,
  partial: 0,
  incorrect: 3,
  unknown: 0,
  successRate: 0,
  averageImpact: -10,
  signal: 'negative',
});
assert.equal(qualifiedNegative[0].learningAdjustment, -0.15);
assert.equal(qualifiedNegative[0].finalScore, qualifiedNegative[0].baseScore - 0.15);

const mixed = rankAlternativeCandidates([candidate], {
  decisionFingerprint: 'd-4',
  decisionType: null,
  policyKey: null,
  recommendationId: null,
  outcomes: 10,
  measured: 10,
  correct: 5,
  partial: 2,
  incorrect: 3,
  unknown: 0,
  successRate: 0.5,
  averageImpact: 0,
  signal: 'mixed',
});
assert.equal(mixed[0].learningAdjustment, 0, 'mixed learning must not change ranking');

console.log('PASS alternative ranking governance contract');
