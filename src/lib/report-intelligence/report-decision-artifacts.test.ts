import { strict as assert } from 'node:assert';
import { buildReportDecisionArtifacts } from './report-decision-artifacts.ts';
import type { ReportIntelligence } from './report-smart-insights.ts';

const intelligence: ReportIntelligence = { businessQuestion: 'ما أهم ما يثبته المصدر؟', summary: 'اختبار',
  signals: [{ id: 'inventory:missing-price', severity: 'high', title: 'أصناف بلا سعر', message: 'هناك 3 صفوف بلا سعر مثبت.', evidence: ['missingPriceRows'], affectedRows: 3, soWhat: 'يلزم مراجعة 3 صفوف.', impact: 'الأثر غير مثبت.', ownerHint: 'مسؤول المخزون', priority: 'P1', priorityReason: ['test'] }],
  recommendations: [{ id: 'rec:inventory:missing-price', status: 'PROPOSED', priority: 'high', title: 'راجع الأصناف بلا سعر', action: 'افتح الصفوف المتأثرة وثبت السعر.', why: 'هناك 3 صفوف بلا سعر.', evidence: ['missingPriceRows'], ownerHint: 'مسؤول المخزون', impact: 'الأثر غير مثبت.', expectedOutcome: 'استكمال السعر وإعادة الفحص.' }],
  forecast: { status: 'INSUFFICIENT_SAMPLE', metric: null, method: 'test', observedPeriods: 0, nextPeriod: null, nextValue: null, direction: null, note: 'لا يوجد' },
  guidance: { focus: 'أصناف بلا سعر', inspect: ['3 rows'], ownerHint: 'مسؤول المخزون', boundary: 'لا توجد سببية مثبتة.' }
};

const artifacts = buildReportDecisionArtifacts({ jobId: 'job-1', sourceHash: 'sha256:test', rowCount: 10, specialty: 'inventory',
  renderedOutput: { evidenceSnapshotId: 'snapshot-1', evidencePassportId: 'passport-1', evidenceVerificationStatus: 'VERIFIED', profileVersion: 'inventory-v1', outcomeStatus: 'NOT_AVAILABLE' }, sourceDecisions: [], intelligence });
assert.equal(artifacts.claims.length, 3); assert.equal(artifacts.claims[0].status, 'OBSERVED'); assert.equal(artifacts.claims[1].status, 'DERIVED'); assert.equal(artifacts.claims[2].status, 'RECOMMENDED');
assert.equal(artifacts.questions.find((q) => q.key === 'PROOF')?.status, 'ANSWERED');
assert.equal(artifacts.questions.find((q) => q.key === 'AFTER_ACTION')?.status, 'NOT_AVAILABLE');
assert.equal(artifacts.decisionPacket.profileVersion, 'inventory-v1'); assert.match(artifacts.decisionPacket.reproducibilityKey, /inventory-v1$/);
assert.equal(artifacts.decisionPacket.impact.status, 'NOT_AVAILABLE');
const measured = buildReportDecisionArtifacts({
  jobId: 'job-3',
  sourceHash: 'sha256:measured',
  rowCount: 20,
  specialty: 'sales',
  renderedOutput: {
    evidenceSnapshotId: 'snapshot-3',
    evidencePassportId: 'passport-3',
    evidenceVerificationStatus: 'VERIFIED',
    profileVersion: 'sales-v1',
  },
  sourceDecisions: [{
    id: 'decision-3',
    status: 'EXECUTED',
    recommendationId: 'rec-3',
    recommendationTitle: 'test',
    recommendationStatus: 'new',
    recommendationEvidenceSnapshotId: 'snapshot-3',
    decisionKey: 'test',
    signalId: 'signal-3',
    signalTitle: 'test',
    signalSeverity: 'medium',
    signalMessage: 'test',
    createdAt: null,
    approvedAt: null,
    approvedBy: null,
    workItemId: 'work-3',
    workItemStatus: 'COMPLETED',
    outcomeId: 'outcome-3',
    outcomeEvidenceSnapshotId: 'snapshot-3',
    outcomeStatus: 'positive',
    outcomeQuality: 1,
    expectedImpact: 100,
    actualImpact: 125,
    observedAt: '2026-10-02T00:00:00Z',
    approvalId: 'approval-3',
    approvalStatus: 'APPROVED',
    approvalRequestedBy: null,
    approvalDecidedBy: null,
  }],
  intelligence,
});
assert.equal(measured.decisionPacket.learning.status, 'AVAILABLE');
assert.equal(measured.decisionPacket.learning.expected, 100);
assert.equal(measured.decisionPacket.learning.actual, 125);
assert.equal(measured.decisionPacket.learning.delta, 25);

console.log('REPORT_DECISION_ARTIFACTS_CONTRACT_PASS');