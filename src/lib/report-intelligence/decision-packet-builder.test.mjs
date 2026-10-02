import { buildDecisionPacket } from './decision-packet-builder.ts';

const check = (condition, message) => { if (!condition) throw new Error(message); };

const claims = [{
  claimId: 'recommendation:rec-1',
  tenantId: 'tenant-1',
  sourceHash: 'sha256:test',
  reportExecutionJobId: 'job-1',
  evidenceSnapshotId: 'snapshot-1',
  evidencePassportId: 'passport-1',
  status: 'RECOMMENDED',
  state: 'VALID',
  statement: 'راجع السجلات ذات الانحراف.',
  inputFields: ['netAmount'],
  calculationMethod: 'signal',
  scope: {},
  sampleSize: 20,
  limitations: ['ليست إثباتًا سببيًا.'],
  supportingEvidence: ['field=x'],
  archetypeId: 'sales.transaction-detail',
  profileVersion: 1,
  ruleId: 'sales.signal.v1',
}];

const questions = [
  { id: 'report.what-happened', label: 'WHAT', requiredFields: [], minimumSample: 1, priority: 100, answer: { summary: 'ارتفع الانحراف.' }, state: 'ANSWERED', missingFields: [], evidenceBoundary: 'source-bound' },
  { id: 'report.why', label: 'WHY', requiredFields: [], minimumSample: 1, priority: 80, answer: { observation: 'ظهرت سجلات متباينة.' }, state: 'ANSWERED', missingFields: [], evidenceBoundary: 'review' },
  { id: 'report.what-next', label: 'WHAT NEXT', requiredFields: [], minimumSample: 1, priority: 70, answer: { action: 'راجع السجلات.' }, state: 'ANSWERED', missingFields: [], evidenceBoundary: 'review' },
];

const packet = buildDecisionPacket({
  sourcePath: 'report.xlsx',
  sourceHash: 'sha256:test',
  reportExecutionJobId: 'job-1',
  evidenceSnapshotId: 'snapshot-1',
  evidencePassportId: 'passport-1',
  archetypeId: 'sales.transaction-detail',
  profileVersion: 1,
  businessQuestion: 'ما الخطوة التالية؟',
  questions,
  claims,
  readiness: 'READY_WITH_REVIEW',
  recommendationId: 'recommendation:rec-1',
  decisionId: 'decision-1',
  decisionStatus: 'EXECUTED',
  approvalStatus: 'APPROVED',
  workItemId: 'work-1',
  workStatus: 'COMPLETED',
  expectedOutcome: 'تحسين الجودة',
  actualOutcome: null,
  generatedAt: '2026-10-02T00:00:00.000Z',
});
check(packet.interpretation.what === 'ارتفع الانحراف.', 'WHAT should come from question engine');
check(packet.interpretation.why === 'ظهرت سجلات متباينة.', 'WHY should remain observable');
check(packet.action.recommendation === 'راجع السجلات ذات الانحراف.', 'recommendation should be resolved from claim');
check(packet.source.evidencePassportId === 'passport-1', 'packet must retain passport');
check(packet.action.actualOutcome === null, 'missing outcome must remain missing');
check(packet.audit.ruleIds.includes('sales.signal.v1'), 'rule lineage must be retained');
console.log('decision-packet-builder: PASS');
