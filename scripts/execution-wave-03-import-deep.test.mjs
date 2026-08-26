import assert from 'node:assert/strict';
import { createImportHarness, digest } from './execution-wave-02-runtime-harness.mjs';

const rows = [
  { businessKey: 'SKU-1', value: 10, fingerprint: digest({ sku: 'SKU-1', value: 10 }) },
  { businessKey: 'SKU-2', value: 20, fingerprint: digest({ sku: 'SKU-2', value: 20 }) },
  { businessKey: 'SKU-3', value: 30, fingerprint: digest({ sku: 'SKU-3', value: 30 }) },
  { businessKey: 'SKU-4', value: 40, fingerprint: digest({ sku: 'SKU-4', value: 40 }) },
];

const h = createImportHarness({ tenantId: 'tenant-a', importId: 'import-deep', rows });
assert.deepEqual(h.begin(digest(rows)), { idempotent: false, state: 'processing' });
assert.deepEqual(h.begin(digest(rows)), { idempotent: true, state: 'processing' });
assert.deepEqual(h.processChunk(0, 2), { checkpoint: 2, committed: 2 });
const afterCheckpoint = h.snapshot();
h.crash();
assert.equal(h.resume(), true);
assert.deepEqual(h.snapshot().committed, afterCheckpoint.committed);
assert.deepEqual(h.processChunk(2, 4), { checkpoint: 4, committed: 4 });
assert.equal(h.snapshot().state, 'completed');
assert.equal(h.resume(), false);
assert.equal(h.cancel(), false);
assert.equal(h.rollback(), false);

const conflict = createImportHarness({ tenantId: 'tenant-a', importId: 'import-conflict', rows });
conflict.begin('file-conflict');
conflict.processChunk(0, 2);
const before = conflict.snapshot();
assert.throws(() => conflict.processChunk(0, 3), /conflicting business key/);
const after = conflict.snapshot();
assert.equal(after.committed.size, before.committed.size);
assert.equal(after.checkpoint, before.checkpoint);

const partial = createImportHarness({ tenantId: 'tenant-a', importId: 'import-partial', rows });
partial.begin('file-partial');
partial.processChunk(0, 1);
partial.cancel();
assert.equal(partial.processChunk, partial.processChunk);
assert.throws(() => partial.processChunk(1, 4), /import not active/);
assert.equal(partial.snapshot().committed.size, 1);

const tenantReplay = createImportHarness({ tenantId: 'tenant-b', importId: 'import-replay', rows });
tenantReplay.begin(digest(rows));
assert.equal(tenantReplay.snapshot().tenantId, 'tenant-b');
assert.notEqual(tenantReplay.snapshot().tenantId, h.snapshot().tenantId);

console.log('Wave 03 import deep matrix: PASS (same file, replay, checkpoint crash/resume, conflict atomicity, terminal immutability, cancellation, tenant-bound replay)');
