import { buildAdvisoryPacket } from '../src/lib/report-intelligence/report-advisory-orchestrator.ts';
import { buildDecisionPacket } from '../src/lib/report-intelligence/decision-packet-builder.ts';
import { validateAdvisoryInvariants } from '../src/lib/report-intelligence/advisory-invariants.ts';
import { buildOutcomeLearningBinding } from '../src/lib/report-intelligence/outcome-learning-binding.ts';

const check = (condition, message) => { if (!condition) throw new Error(message); };

const intelligence = {
  summary: 'يوجد استثناء يحتاج مراجعة قبل القرار.',
  signals: [{
    id: 'sales:date-missing',
    severity: 'medium',
    title: 'التاريخ غير مثبت',
    message: 'لا يوجد تاريخ واضح.',
    evidence: ['dateField=missing'],
  }],
  recommendations: [{
    id: 'rec:sales:date-missing',
    status: 'PROPOSED',
    priority: 'medium',
    title: 'راجع التاريخ',
    action: 'ثبّت تاريخًا موحدًا.',
    why: 'لا يوجد تاريخ واضح.',
    evidence: ['dateField=missing'],
  }],
  forecast: { status: 'INSUFFICIENT_SAMPLE', metric: null, method: 'deterministic-monthly-trend', observedPeriods: 0, nextPeriod: null, nextValue: null, direction: null, note: 'لا يوجد توقع.' },
  guidance: { focus: 'التاريخ غير مثبت', inspect: ['لا يوجد تاريخ واضح.'], ownerHint: 'المسؤول', boundary: 'تحتاج مراجعة.' },
};

const base = {
  intelligence,
  provenance: {
    tenantId: 'tenant-1',
    sourceHash: 'sha256:integration',
    reportExecutionJobId: 'job-1',
    evidenceSnapshotId: 'snapshot-1',
    evidencePassportId: 'passport-1',
  },
  availableFields: ['netAmount'],
  sampleSize: 20,
  archetypeId: 'sales.transaction-detail',
  profileVersion: 1,
};

const advisory = buildAdvisoryPacket(base);
check(advisory.proofState === 'VERIFIED', 'evidence should produce VERIFIED');
check(advisory.actionState === 'ACTIONABLE', 'verified recommendation should be actionable');
check(advisory.questions.find((q) => q.id === 'report.why')?.state === 'REVIEW_REQUIRED', 'why should retain causal review boundary');

const recommendation = advisory.nextRecommendation;
check(Boolean(recommendation), 'vertical slice needs a recommendation claim');

const packet = buildDecisionPacket({
  sourcePath: 'integration.xlsx',
  sourceHash: 'sha256:integration',
  reportExecutionJobId: 'job-1',
  evidenceSnapshotId: 'snapshot-1',
  evidencePassportId: 'passport-1',
  archetypeId: 'sales.transaction-detail',
  profileVersion: 1,
  businessQuestion: 'ما الخطوة التالية؟',
  questions: advisory.questions,
  claims: advisory.claims,
  readiness: 'READY_WITH_REVIEW',
  recommendationId: recommendation?.claimId ?? null,
  decisionId: 'decision-1',
  decisionStatus: 'EXECUTED',
  approvalStatus: 'APPROVED',
  workItemId: 'work-1',
  workStatus: 'COMPLETED',
  expectedOutcome: 'تحسن',
  actualOutcome: null,
  generatedAt: '2026-10-02T00:00:00Z',
});
check(packet.source.sourceHash === 'sha256:integration', 'decision packet source must match');
check(packet.action.actualOutcome === null, 'unmeasured actual outcome must remain null');

const invariant = validateAdvisoryInvariants(advisory, packet);
check(invariant.valid, 'advisory packet and decision packet must share lineage');

const learning = buildOutcomeLearningBinding({
  outcomeId: 'outcome-1',
  recommendationId: recommendation?.claimId ?? 'missing',
  archetypeId: 'sales.transaction-detail',
  profileVersion: 1,
  ruleId: recommendation?.ruleId ?? null,
  sourceHash: 'sha256:integration',
  reportExecutionJobId: 'job-1',
  evidenceSnapshotId: 'snapshot-1',
  expectedOutcome: 'تحسن',
});
check(learning.outcomeState === 'INSUFFICIENT', 'expected outcome alone must not be observed');

const broken = validateAdvisoryInvariants({
  ...advisory,
  claims: advisory.claims.map((claim, index) => index === 0 ? { ...claim, sourceHash: 'sha256:other' } : claim),
}, packet);
check(!broken.valid && broken.violations.includes('CLAIM_SOURCE_HASH_MISMATCH'), 'lineage drift must fail closed');

console.log('intelligence-vertical-slice: PASS');
