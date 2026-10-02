import { evaluateDecisionReadiness, isClaimDecisionReady, validateClaim } from './claim-ledger.ts';

const check = (condition, message) => { if (!condition) throw new Error(message); };
const claim = (overrides = {}) => ({
  claimId: 'claim-1',
  tenantId: 'tenant-1',
  sourceHash: 'sha256:test',
  reportExecutionJobId: 'job-1',
  evidenceSnapshotId: 'snapshot-1',
  evidencePassportId: 'passport-1',
  status: 'DERIVED',
  state: 'VALID',
  statement: 'إجمالي المبيعات ارتفع خلال الفترة.',
  inputFields: ['documentDate', 'netAmount'],
  calculationMethod: 'monthly_sum_delta',
  scope: { period: '2026-01/2026-09' },
  sampleSize: 9,
  limitations: ['لا يثبت هذا التحليل سبب التغير.'],
  supportingEvidence: ['monthly totals'],
  archetypeId: 'sales.transaction-detail',
  profileVersion: 1,
  ruleId: 'sales.trend.v1',
  ...overrides,
});

check(validateClaim(claim()).valid === true, 'fully source-bound claim should validate');
check(isClaimDecisionReady(claim()) === true, 'valid derived claim should be decision-ready when evidence exists');
const missing = validateClaim(claim({ sourceHash: '', evidenceSnapshotId: null, evidencePassportId: null }));
check(missing.valid === false && missing.reasons.includes('SOURCE_HASH_MISSING') && missing.reasons.includes('EVIDENCE_REFERENCE_MISSING'), 'missing provenance must fail');
check(isClaimDecisionReady(claim({ status: 'INFERRED' })) === false, 'inference cannot become decision-ready');
check(validateClaim(claim({ status: 'INFERRED', supportingEvidence: [] })).valid === false, 'unsupported inference must fail');
const readiness = evaluateDecisionReadiness({
  readiness: { evidenceStrength: 0.45, materiality: 0.95, actionability: 0.9, urgency: 0.9 },
  sampleSize: 24,
  minimumSample: 12,
  hasEvidence: true,
  hasAction: true,
});
check(readiness.state === 'READY_WITH_REVIEW', 'weak evidence must require review');
const small = evaluateDecisionReadiness({
  readiness: { evidenceStrength: 1, materiality: 1, actionability: 1, urgency: 1 },
  sampleSize: 3,
  minimumSample: 12,
  hasEvidence: true,
  hasAction: true,
});
check(small.state === 'INSUFFICIENT_SAMPLE', 'small sample must fail closed');
console.log('claim-ledger: PASS');
