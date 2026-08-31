import assert from 'node:assert/strict';
import { IdempotencyRegistry, fingerprintRequest } from '../src/lib/report-execution/idempotency.ts';

const a = { tenantId: 'tenant-a', reportId: 'r1', options: { format: 'pdf', filters: { status: 'open', region: 'west' } } };
const b = { options: { filters: { region: 'west', status: 'open' }, format: 'pdf' }, reportId: 'r1', tenantId: 'tenant-a' };
assert.equal(fingerprintRequest(a), fingerprintRequest(b), 'fingerprint must be invariant to nested object-key ordering');

const registry = new IdempotencyRegistry();
const first = registry.claim('k1', 'tenant-a', fingerprintRequest(a), 'run-1');
const replay = registry.claim('k1', 'tenant-a', fingerprintRequest(b), 'run-2');
assert.equal(first.runId, 'run-1');
assert.equal(replay.runId, 'run-1', 'same tenant/key/request must replay the original run');
assert.throws(() => registry.claim('k1', 'tenant-a', fingerprintRequest({ ...a, reportId: 'r2' }), 'run-3'), /different request/);
const otherTenant = registry.claim('k1', 'tenant-b', fingerprintRequest(a), 'run-4');
assert.equal(otherTenant.runId, 'run-4', 'idempotency keys must be tenant-scoped');

console.log('PASS nested request fingerprint is order-independent');
console.log('PASS exact replay returns original run');
console.log('PASS same-key mutation is rejected');
console.log('PASS tenant-scoped idempotency permits independent tenants');
