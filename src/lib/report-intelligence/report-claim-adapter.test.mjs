import { buildClaimsFromReportIntelligence } from './report-claim-adapter.ts';

const check = (condition, message) => { if (!condition) throw new Error(message); };
const intelligence = {
  summary: 'اختبار',
  signals: [{
    id: 'sales:date-missing',
    severity: 'medium',
    title: 'الفترة الزمنية غير مثبتة',
    message: 'لا يوجد حقل تاريخ واضح.',
    evidence: ['dateField=missing'],
  }],
  recommendations: [{
    id: 'rec:sales:date-missing',
    status: 'PROPOSED',
    priority: 'medium',
    title: 'راجع: الفترة الزمنية غير مثبتة',
    action: 'ثبّت تاريخًا موحدًا للمصدر.',
    why: 'لا يوجد حقل تاريخ واضح.',
    evidence: ['dateField=missing'],
  }],
  forecast: { status: 'INSUFFICIENT_SAMPLE', metric: null, method: 'deterministic-monthly-trend', observedPeriods: 0, nextPeriod: null, nextValue: null, direction: null, note: 'لا يوجد توقع.' },
  guidance: { focus: 'الفترة الزمنية غير مثبتة', inspect: ['لا يوجد حقل تاريخ واضح.'], ownerHint: 'المسؤول', boundary: 'الإشارة تحتاج تدقيقًا.' },
};
const base = {
  intelligence,
  provenance: { tenantId: 'tenant-1', sourceHash: 'sha256:test', reportExecutionJobId: 'job-1', evidenceSnapshotId: 'snapshot-1', evidencePassportId: 'passport-1' },
  inputFields: ['netAmount'],
  sampleSize: 20,
  archetypeId: 'sales.transaction-detail',
  profileVersion: 1,
};
const claims = buildClaimsFromReportIntelligence(base);
check(claims.length === 2, 'signals and recommendations should become two claims');
check(claims[0].status === 'DERIVED' && claims[0].state === 'VALID', 'signal claim should be derived and evidence-bound');
check(claims[1].status === 'RECOMMENDED' && claims[1].state === 'VALID', 'recommendation claim should be evidence-bound');
check(claims[1].supportingEvidence.includes('dateField=missing'), 'recommendation must keep evidence');
check(!claims[1].supportingEvidence.includes('لا يوجد حقل تاريخ واضح.'), 'rationale must not be mislabeled as evidence');
const noEvidence = buildClaimsFromReportIntelligence({
  ...base,
  provenance: { ...base.provenance, evidenceSnapshotId: null, evidencePassportId: null },
});
check(noEvidence.every((claim) => claim.state === 'REVIEW_REQUIRED'), 'missing evidence must require review');
console.log('report-claim-adapter: PASS');
