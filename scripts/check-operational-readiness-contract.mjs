import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('src/lib/operationalReadiness.ts', 'utf8');
for (const token of [
  "ReadinessState = 'PASS' | 'WARN' | 'BLOCKED'",
  'blocking',
  'evidence',
  'blockers',
  'warnings',
  'score',
  "state: blockers.length > 0 ? 'BLOCKED'",
]) {
  assert.ok(source.includes(token), `Operational readiness contract missing: ${token}`);
}
assert.match(source, /high feature count|implementation percentage/);
console.log('Operational readiness contract: PASS');
