import assert from 'node:assert/strict';

const { runAghbariIntelligenceKernel } = await import('../src/lib/report-intelligence/aghbari-intelligence-kernel.ts');

const rows = Array.from({ length: 12 }, (_, index) => ({
  row_number: index + 1,
  data: {
    currentStock: index === 0 ? -5 : index % 3 === 0 ? 0 : 100 + index,
    salesQty: 50 + index * 10,
    productCode: String(1000 + index),
  },
}));

const result = runAghbariIntelligenceKernel({
  rows,
  specialty: 'inventory',
  qualityScore: 99,
  canonicalRowsComplete: true,
  evidenceReady: true,
  provenance: {
    tenantId: 'tenant-test',
    reportExecutionJobId: 'job-test',
    sourceHash: 'sha256:test',
    evidenceSnapshotId: 'snapshot-test',
    evidencePassportId: 'passport-test',
  },
});

assert.equal(result.quality.dataEligible, true);
assert.equal(result.quality.decisionEligible, true);
assert.equal(result.statistics.find((item) => item.key === 'row.count')?.value, 12);
assert.ok(result.anomalies.some((item) => item.kind === 'NEGATIVE_STOCK'));
assert.equal(result.scenarios.length, 1);
assert.ok(result.sensitivity.length >= 2);
assert.ok(result.trace.some((entry) => entry.stage === 'TRUTH' && entry.status === 'PASS'));
assert.ok(result.trace.some((entry) => entry.stage === 'PROVE' && entry.status === 'PASS'));

console.log('aghbari-intelligence-kernel-contract: PASS');
