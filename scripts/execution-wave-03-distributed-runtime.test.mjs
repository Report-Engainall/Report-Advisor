import assert from 'node:assert/strict';
import { createRuntimeHarness } from './execution-wave-02-runtime-harness.mjs';

const h = createRuntimeHarness();
h.createJob({ jobId: 'job-1', tenantId: 'tenant-a', importId: 'import-1' });
assert.equal(h.claim('job-1', 'worker-a', 0, 100), true);
assert.equal(h.claim('job-1', 'worker-b', 10, 100), false);
assert.equal(h.heartbeat('job-1', 'worker-a', 20, 100), true);
assert.equal(h.checkpoint('job-1', 'worker-a', 40), true);
assert.equal(h.checkpoint('job-1', 'worker-a', 20), false);
assert.equal(h.claim('job-1', 'worker-b', 50, 100), false);
assert.equal(h.claim('job-1', 'worker-b', 121, 100), true);
assert.equal(h.getJob('job-1').checkpoint, 40);
assert.throws(() => h.complete('job-1', 'worker-b', { tenantId: 'tenant-b', output: 'cross-tenant' }, 121), /tenant mismatch/);
const receipt = h.complete('job-1', 'worker-b', { tenantId: 'tenant-a', output: 'ok' }, 121);
assert.equal(receipt.tenantId, 'tenant-a');
assert.deepEqual(h.complete('job-1', 'worker-b', { tenantId: 'tenant-a', output: 'different' }, 121), receipt);

const retry = createRuntimeHarness();
retry.createJob({ jobId: 'retry-job', tenantId: 'tenant-a', importId: 'import-2' });
for (let attempt = 0; attempt < 3; attempt += 1) {
  assert.equal(retry.claim('retry-job', `worker-${attempt}`, attempt * 200, 100), true);
  retry.fail('retry-job', `worker-${attempt}`, `failure-${attempt}`, 3);
}
assert.equal(retry.getJob('retry-job').state, 'dead-letter');
assert.equal(retry.claim('retry-job', 'worker-after-dlq', 1000, 100), false);

const recovery = createRuntimeHarness();
recovery.createJob({ jobId: 'recovery-job', tenantId: 'tenant-z', importId: 'import-3' });
assert.equal(recovery.claim('recovery-job', 'worker-a', 0, 50), true);
assert.equal(recovery.checkpoint('recovery-job', 'worker-a', 10), true);
assert.equal(recovery.claim('recovery-job', 'worker-b', 49, 50), false);
assert.equal(recovery.claim('recovery-job', 'worker-b', 51, 50), true);
assert.equal(recovery.getJob('recovery-job').checkpoint, 10);
assert.equal(recovery.getTrace().filter((e) => e.type === 'job.completed').length, 0);

console.log('Wave 03 distributed runtime matrix: PASS (lease race, stale lease recovery, checkpoint preservation, tenant completion, idempotent receipt, retry exhaustion, DLQ)');
