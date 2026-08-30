import { readFileSync } from 'node:fs';

const queue = readFileSync('src/lib/report-execution/queue.ts', 'utf8');
const contract = readFileSync('src/lib/report-execution/report-execution-contract.ts', 'utf8');

for (const token of ['enqueue(', 'claim(', 'heartbeat(', 'complete(', 'fail(', 'assertLease']) {
  if (!queue.includes(token)) throw new Error(`queue missing ${token}`);
}
for (const token of ['tenantId', 'idempotencyKey', 'formats', 'parameters']) {
  if (!contract.includes(token)) throw new Error(`contract missing ${token}`);
}

// Current queue copies only the outer job object. Nested request state remains aliased.
// This is intentionally a failing adversarial assertion until the implementation is hardened.
const hasNestedAlias = /return \{ \.\.\.job \}/.test(queue) && /request,/.test(queue);
if (hasNestedAlias) throw new Error('QUEUE_MUTABLE_REFERENCE: returned jobs alias nested request state');

console.log('Report queue immutability gate: PASS');
