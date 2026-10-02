import { validateAdvisoryInvariants } from './advisory-invariants.ts';

const check = (condition, message) => { if (!condition) throw new Error(message); };

const baseClaim = {
  claimId: 'recommendation:rec-1',
  tenantId: 'tenant-1',
  sourceHash: 'sha256:test',
  reportExecutionJobId: 'job-1',
  evidenceSnapshotId: 'snapshot-1',
  evidencePassportId: 'passport-1',
  status: 'RECOMMENDED',
  state: 'VALID',
  statement: 'راجع السجلات.',
  inputFields: ['netAmount'],
  calculationMethod: 'signal',
  scope: {},
  sampleSize: 20,
  limitations: ['ليست إثباتًا سببيًا.'],
  supportingEvidence: ['field=x'],
  archetypeId: 'sales.transaction-detail',
  profileVersion: 1,
  ruleId: 'sales.signal.v1',
};

const packet = {
  claims: [baseClaim],
  questions: [],
  primarySignal: null,
  nextRecommendation: baseClaim,
  proofState: 'VERIFIED',
  actionState: 'ACTIONABLE',
  outcomeState: 'INSUFFICIENT',
};

check(validateAdvisoryInvariants(packet).valid, 'valid advisory packet should pass invariants');

const drifted = {
  ...packet,
  claims: [baseClaim, { ...baseClaim, claimId: 'signal:x', sourceHash: 'sha256:other', status: 'DERIVED' }],
};
const driftResult = validateAdvisoryInvariants(drifted);
check(!driftResult.valid && driftResult.violations.includes('CLAIM_SOURCE_HASH_MISMATCH'), 'mixed source claims must fail closed');

const packetWithoutEvidence = {
  ...packet,
  claims: [{ ...baseClaim, evidenceSnapshotId: null, evidencePassportId: null }],
};
const evidenceResult = validateAdvisoryInvariants(packetWithoutEvidence);
check(!evidenceResult.valid && evidenceResult.violations.includes('VERIFIED_WITHOUT_EVIDENCE_REFERENCE'), 'verified packet without proof must fail');

const decisionPacket = {
  generatedAt: '2026-10-02T00:00:00Z',
  source: { sourcePath: 'r.xlsx', sourceHash: 'sha256:test', reportExecutionJobId: 'job-1', evidenceSnapshotId: 'snapshot-1', evidencePassportId: 'passport-1' },
  interpretation: { archetypeId: 'sales.transaction-detail', profileVersion: 1, businessQuestion: 'ما الخطوة التالية؟', what: 'راجع', why: null, soWhat: null, impact: null, whatNext: 'راجع', },
  evidence: { claims: ['recommendation:rec-1'], limitations: ['review'], readiness: 'READY' },
  action: { recommendationId: 'recommendation:rec-1', recommendation: 'راجع السجلات.', decisionId: null, decisionStatus: null, approvalStatus: null, workItemId: null, workStatus: null, expectedOutcome: 'تحسن', actualOutcome: null },
  audit: { ruleIds: ['sales.signal.v1'], claimIds: ['recommendation:rec-1'] },
};
check(validateAdvisoryInvariants(packet, decisionPacket).valid, 'decision packet with matching lineage should pass');

const mismatch = validateAdvisoryInvariants(packet, { ...decisionPacket, source: { ...decisionPacket.source, sourceHash: 'sha256:other' } });
check(!mismatch.valid && mismatch.violations.includes('DECISION_PACKET_SOURCE_HASH_MISMATCH'), 'decision packet source drift must fail');

console.log('advisory-invariants: PASS');
