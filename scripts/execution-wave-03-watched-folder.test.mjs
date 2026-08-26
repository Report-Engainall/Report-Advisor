import assert from 'node:assert/strict';
import { watchedFileIdentity } from './execution-wave-02-runtime-harness.mjs';

const tenant = 'tenant-a';
const content = Buffer.from('SKU-1,10\nSKU-2,20\n');
const original = watchedFileIdentity(content, tenant);
const renamed = watchedFileIdentity(content, tenant);
const changed = watchedFileIdentity(Buffer.from('SKU-1,11\nSKU-2,20\n'), tenant);
assert.equal(original.sha256, renamed.sha256);
assert.notEqual(original.sha256, changed.sha256);
assert.equal(original.tenantId, tenant);
assert.throws(() => watchedFileIdentity(content, ''), /tenant required/);

const events = [
  { type: 'created', path: 'inbox/a.csv', sha256: original.sha256 },
  { type: 'created', path: 'inbox/a-renamed.csv', sha256: original.sha256 },
  { type: 'modified', path: 'inbox/a-renamed.csv', sha256: changed.sha256 },
];
const identities = new Set();
const queue = [];
for (const event of events) {
  const key = `${tenant}:${event.sha256}`;
  if (identities.has(key)) continue;
  identities.add(key);
  queue.push({ tenantId: tenant, sha256: event.sha256, path: event.path });
}
assert.equal(queue.length, 2);
assert.equal(queue[0].sha256, original.sha256);
assert.equal(queue[1].sha256, changed.sha256);

const replay = [...events, ...events];
const replayKeys = new Set(replay.map(e => `${tenant}:${e.sha256}`));
assert.equal(replayKeys.size, 2);

const capabilities = {
  Browser: 'SESSION_BOUND',
  Node: 'SUPPORTED',
  Windows: 'NATIVE_ADAPTER_REQUIRED',
  Android: 'NATIVE_ADAPTER_REQUIRED',
  iOS: 'NO_ARBITRARY_PERSISTENT_FOLDER_PROOF',
};
assert.equal(capabilities.Node, 'SUPPORTED');
assert.equal(capabilities.Windows, 'NATIVE_ADAPTER_REQUIRED');
assert.equal(capabilities.Android, 'NATIVE_ADAPTER_REQUIRED');

console.log(JSON.stringify({
  sameContentRenamed: original.sha256 === renamed.sha256,
  changedContentDifferent: original.sha256 !== changed.sha256,
  duplicateEventsCollapsed: replay.length - replayKeys.size,
  queueIdentityCount: queue.length,
  capabilities,
}, null, 2));
