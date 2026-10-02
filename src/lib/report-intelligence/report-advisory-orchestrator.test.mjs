import { buildAdvisoryPacket } from './report-advisory-orchestrator.ts';

const check = (condition, message) => { if (!condition) throw new Error(message); };

const intelligence = {
  summary: 'المصدر يحتوي على إشارة تحتاج مراجعة.',
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
  provenance: {
    tenantId: 'tenant-1',
    sourceHash: 'sha256:test',
    reportExecutionJobId: 'job-1',
    evidenceSnapshotId: 'snapshot-1',
    evidencePassportId: 'passport-1',
  },
  availableFields: ['netAmount'],
  sampleSize: 20,
  archetypeId: 'sales.transaction-detail',
  profileVersion: 1,
};

const packet = buildAdvisoryPacket(base);
check(packet.claims.length === 2, 'packet must expose signal and recommendation claims');
check(packet.proofState === 'VERIFIED', 'evidence references should produce verified proof state');
check(packet.actionState === 'ACTIONABLE', 'evidence-backed recommendation should be actionable');
check(packet.questions.find((q) => q.id === 'report.what-happened')?.state === 'ANSWERED', 'what question should answer');
check(packet.questions.find((q) => q.id === 'report.primary-signal')?.state === 'ANSWERED', 'signal question should answer');
check(packet.questions.find((q) => q.id === 'report.why')?.state === 'REVIEW_REQUIRED', 'why should preserve causal review boundary');
check(packet.questions.find((q) => q.id === 'report.after-action')?.state === 'REVIEW_REQUIRED', 'after action without observed outcome must not claim success');

const reviewPacket = buildAdvisoryPacket({
  ...base,
  provenance: { ...base.provenance, evidenceSnapshotId: null, evidencePassportId: null },
});
check(reviewPacket.proofState === 'REVIEW_REQUIRED', 'missing evidence must require review');
check(reviewPacket.actionState === 'REVIEW_REQUIRED', 'missing evidence must prevent direct actionability');

console.log('report-advisory-orchestrator: PASS');
