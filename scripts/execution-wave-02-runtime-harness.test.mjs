import assert from 'node:assert/strict';
import {
  buildBackupArtifact,
  buildTraceContext,
  canonicalKpi,
  crossSurfaceTruth,
  createRuntimeHarness,
  verifyBackupArtifact,
  watchedFileIdentity,
} from './execution-wave-02-runtime-harness.mjs';

const h = createRuntimeHarness();
h.createJob({ jobId: 'job-1', tenantId: 'tenant-a', importId: 'import-1' });
assert.equal(h.claim('job-1', 'worker-a', 0), true);
assert.equal(h.heartbeat('job-1', 'worker-a', 10), true);
assert.equal(h.checkpoint('job-1', 'worker-a', 42), true);
assert.equal(h.claim('job-1', 'worker-b', 50), false, 'duplicate worker must not steal live lease');
assert.equal(h.recover('job-1', 200), true, 'stale lease must recover');
assert.equal(h.getJob('job-1').checkpoint, 42, 'recovery must resume from checkpoint');
assert.equal(h.claim('job-1', 'worker-b', 201), true);
assert.throws(() => h.complete('job-1', 'worker-b', { tenantId: 'tenant-b' }, 202), /tenant mismatch/);
const receipt = h.complete('job-1', 'worker-b', { tenantId: 'tenant-a', rows: 3 }, 202);
assert.equal(h.complete('job-1', 'worker-b', { tenantId: 'tenant-a', rows: 3 }, 202).receiptId, receipt.receiptId);
assert.equal(h.getTrace().filter((e) => e.type === 'job.completed').length, 1, 'completion must be idempotent');

const retry = createRuntimeHarness();
retry.createJob({ jobId: 'job-dlq', tenantId: 'tenant-a', importId: 'import-2' });
for (let i = 0; i < 3; i += 1) {
  assert.equal(retry.claim('job-dlq', `worker-${i}`, i * 200), true);
  retry.fail('job-dlq', `worker-${i}`, 'synthetic crash', 3);
  if (i < 2) retry.recover('job-dlq', i * 200 + 200);
}
assert.equal(retry.getJob('job-dlq').state, 'dead-letter');

const periodStart = new Date('2026-01-01T00:00:00Z');
const periodEnd = new Date('2026-01-31T23:59:59Z');
const truth = crossSurfaceTruth({ revenue: 1000, cogs: 700, periodStart, periodEnd });
assert.deepEqual(truth.dashboard, truth.report);
assert.deepEqual(truth.dashboard, truth.export);
assert.deepEqual(truth.dashboard, truth.decision);
assert.throws(() => canonicalKpi({ revenue: Infinity, cogs: 1, periodStart, periodEnd }), /invalid KPI inputs/);
assert.throws(() => canonicalKpi({ revenue: 1, cogs: 2, periodStart: periodEnd, periodEnd: periodStart }), /invalid period/);

const trace = buildTraceContext({
  user_action_id: 'ua-1', request_id: 'req-1', job_id: 'job-1', import_id: 'import-1',
  evidence_id: 'ev-1', report_id: 'report-1', decision_id: 'decision-1', outcome_id: 'outcome-1', tenant_id: 'tenant-a',
});
assert.equal(trace.tenant_id, 'tenant-a');
assert.throws(() => buildTraceContext({ ...trace, outcome_id: '' }), /missing trace id/);

const backup = buildBackupArtifact({ schemaVersion: 'v1', migrations: ['001', '002'], payload: { tenant: 'tenant-a', rows: 3 } });
assert.equal(verifyBackupArtifact(backup), true);
assert.equal(verifyBackupArtifact({ ...backup, payload: { tenant: 'tenant-b', rows: 3 } }), false, 'tampered payload must fail verification');

const watched = watchedFileIdentity('same-content', 'tenant-a');
const renamed = watchedFileIdentity('same-content', 'tenant-a');
assert.equal(watched.sha256, renamed.sha256, 'rename-independent identity');
assert.throws(() => watchedFileIdentity('same-content', ''), /tenant required/);

console.log('Execution Wave 02 runtime/truth harness: PASS');
