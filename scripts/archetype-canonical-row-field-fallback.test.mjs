import assert from 'node:assert/strict';

const { runReportArchetype } = await import('../src/lib/report-intelligence/archetype-registry.ts');

const result = runReportArchetype({
  archetypeId: 'sales.over-time',
  report: {
    specialty: 'sales',
    rowCount: 4,
    canonicalRows: [
      { row_number: 1, data: { documentDate: '2026-01-01', netAmount: 100 } },
      { row_number: 2, data: { documentDate: '2026-01-15', netAmount: 150 } },
      { row_number: 3, data: { documentDate: '2026-02-01', netAmount: 180 } },
      { row_number: 4, data: { documentDate: '2026-02-15', netAmount: 220 } },
    ],
    sourceAnalysis: {
      datasets: [
        {
          name: 'real-corpus-without-column-descriptors',
          rowCount: 4,
          columns: [],
        },
      ],
    },
  },
  availableFields: ['documentDate', 'netAmount'],
  sampleSize: 4,
  provenance: {
    tenantId: 'real-corpus-test',
    sourceHash: 'sha256:' + 'a'.repeat(64),
    reportExecutionJobId: 'job-real-corpus-test',
    evidenceSnapshotId: 'snapshot-real-corpus-test',
    evidencePassportId: 'passport-real-corpus-test',
    sourceVersionId: null,
  },
});

assert.equal(result.state, 'SUPPORTED');
assert.ok(result.intelligence.signals.some((signal) => signal.id === 'model:sales.over-time'));
assert.ok(result.intelligence.recommendations.some((recommendation) => recommendation.id === 'rec:archetype:sales.over-time'));

console.log('PASS: archetype evaluator resolves canonical row keys when analysis column descriptors are absent');
