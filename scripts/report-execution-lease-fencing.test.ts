import assert from 'node:assert/strict';
import { InMemoryReportQueue } from '../src/lib/report-execution/queue.ts';
import type { ReportExecutionRequest } from '../src/lib/report-execution/report-execution-contract.ts';

const request = { tenantId: 'tenant-a', idempotencyKey: 'lease-fencing-regression', sourceSnapshotId: 'snapshot-1' } as ReportExecutionRequest;
const queue = new InMemoryReportQueue();
queue.enqueue(request, 'run-1', 3);

const first = queue.claim('worker-a', 60_000);
assert.ok(first?.leaseToken, 'claim must issue a fencing token');
const staleToken = first.leaseToken;

assert.throws(() => queue.heartbeat('run-1', 'worker-a', 'stale-token'), /fencing token is stale/, 'stale heartbeat token must be rejected');

const realNow = Date.now;
try {
  Date.now = () => (first.leaseExpiresAt ?? realNow()) + 1;
  assert.throws(() => queue.heartbeat('run-1', 'worker-a', staleToken), /lease has expired/, 'expired lease heartbeat must be rejected');
} finally {
  Date.now = realNow;
}

queue.fail('run-1', 'worker-a', staleToken, 'simulated crash');
const second = queue.claim('worker-b', 60_000);
assert.ok(second?.leaseToken, 'retry claim must issue a new fencing token');
assert.notEqual(second.leaseToken, staleToken, 'retry must fence the previous lease');
assert.throws(() => queue.complete('run-1', 'worker-a', staleToken), /fencing token is stale/, 'stale worker must not complete the retried job');
queue.complete('run-1', 'worker-b', second.leaseToken);
assert.equal(queue.get('run-1')?.status, 'succeeded');
assert.equal(queue.get('run-1')?.leaseToken, undefined, 'terminal transition must clear the fencing token');
console.log('report-execution lease fencing regression: PASS');
