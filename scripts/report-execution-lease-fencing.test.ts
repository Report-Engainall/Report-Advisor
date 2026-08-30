import assert from 'node:assert/strict';
import { InMemoryReportQueue } from '../src/lib/report-execution/queue.ts';
import type { ReportExecutionRequest } from '../src/lib/report-execution/report-execution-contract.ts';

const request = { tenantId: 'tenant-a', idempotencyKey: 'lease-fencing-regression', sourceSnapshotId: 'snapshot-1' } as ReportExecutionRequest;
const queue = new InMemoryReportQueue();
queue.enqueue(request, 'run-1', 3);

const first = queue.claim('worker-a', 60_000);
assert.ok(first?.leaseToken);
const firstToken = first.leaseToken;
queue.heartbeat('run-1', 'worker-a', firstToken);
assert.throws(() => queue.heartbeat('run-1', 'worker-a', 'stale-token'), /fencing token is stale/);

const realNow = Date.now;
const expiredNow = (first.leaseExpiresAt ?? realNow()) + 1;
try {
  Date.now = () => expiredNow;
  assert.throws(() => queue.heartbeat('run-1', 'worker-a', firstToken), /lease has expired/);
  assert.throws(() => queue.complete('run-1', 'worker-a', firstToken), /lease has expired/);
  assert.throws(() => queue.fail('run-1', 'worker-a', firstToken, 'late crash'), /lease has expired/);
  const second = queue.claim('worker-b', 60_000);
  assert.ok(second?.leaseToken);
  assert.notEqual(second.leaseToken, firstToken);
  assert.equal(second.leaseOwner, 'worker-b');
  Date.now = realNow;
  assert.throws(() => queue.complete('run-1', 'worker-a', firstToken), /fencing token is stale/);
  queue.cancel('run-1', 'worker-b', second.leaseToken);
} finally {
  Date.now = realNow;
}
assert.equal(queue.get('run-1')?.status, 'cancelled');
assert.equal(queue.get('run-1')?.leaseToken, undefined);

queue.enqueue({ ...request, idempotencyKey: 'lease-fencing-failure' }, 'run-2', 2);
const failureFirst = queue.claim('worker-a', 60_000);
assert.ok(failureFirst?.leaseToken);
queue.fail('run-2', 'worker-a', failureFirst.leaseToken, 'simulated crash');
const failureSecond = queue.claim('worker-b', 60_000);
assert.ok(failureSecond?.leaseToken);
assert.notEqual(failureSecond.leaseToken, failureFirst.leaseToken);
queue.fail('run-2', 'worker-b', failureSecond.leaseToken, 'terminal crash');
assert.equal(queue.get('run-2')?.status, 'failed');
assert.equal(queue.listDeadLetters().length, 1);
assert.equal(queue.get('run-2')?.leaseToken, undefined);

console.log('report-execution lease fencing regression: PASS');
