import fs from 'node:fs';
import assert from 'node:assert/strict';

const canonical = fs.readFileSync('src/lib/queries.ts', 'utf8');
const compat = fs.readFileSync('src/lib/queries-compat.ts', 'utf8');
assert.ok(canonical.includes("rpc('mark_alert_read'"), 'queries.ts: canonical mark_alert_read RPC missing');
assert.ok(canonical.includes("rpc('update_recommendation_status'"), 'queries.ts: canonical update_recommendation_status RPC missing');
assert.ok(compat.includes("export * from './queries'"), 'queries-compat.ts must remain a forwarding shim');
for (const [source, file] of [[canonical, 'queries.ts'], [compat, 'queries-compat.ts']]) {
  assert.ok(!source.includes("from('alerts').update"), file + ': direct alerts UPDATE bypass detected');
  assert.ok(!source.includes("from('recommendations').update"), file + ': direct recommendations UPDATE bypass detected');
}
console.log('lifecycle mutation boundary: PASS');
