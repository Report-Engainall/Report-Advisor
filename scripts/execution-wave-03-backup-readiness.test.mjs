import assert from 'node:assert/strict';
import { buildBackupArtifact, verifyBackupArtifact, digest } from './execution-wave-02-runtime-harness.mjs';

const migrations = [
  { version: '001_auth', dependsOn: [] },
  { version: '002_tenant', dependsOn: ['001_auth'] },
  { version: '003_import', dependsOn: ['002_tenant'] },
  { version: '004_reports', dependsOn: ['003_import'] },
];
const order = migrations.map(m => m.version);
for (let i = 1; i < migrations.length; i += 1) {
  for (const dependency of migrations[i].dependsOn) assert.ok(order.indexOf(dependency) < i, `${migrations[i].version} dependency ordering invalid`);
}

const payload = { schema: 'v4', rows: [{ id: 1 }, { id: 2 }], generatedAt: '2026-08-26T00:00:00Z' };
const artifact = buildBackupArtifact({ schemaVersion: 'v4', migrations: order, payload });
assert.equal(verifyBackupArtifact(artifact), true);
const tampered = { ...artifact, payload: { ...payload, rows: [{ id: 999 }] } };
assert.equal(verifyBackupArtifact(tampered), false);
assert.equal(artifact.manifest.payloadDigest, digest(payload));

const measurements = [];
function measure(label, fn) {
  const started = performance.now();
  const value = fn();
  const elapsedMs = performance.now() - started;
  measurements.push({ label, elapsedMs });
  return value;
}
measure('restore-manifest-verify', () => verifyBackupArtifact(artifact));
measure('schema-order-check', () => migrations.every((m, i) => m.dependsOn.every(dep => order.indexOf(dep) < i)));
const rtoMs = Math.max(...measurements.map(m => m.elapsedMs));
const rpoModel = { lastBackupAt: '2026-08-26T00:00:00Z', incidentAt: '2026-08-26T00:05:00Z', rpoMinutes: 5 };
assert.ok(rtoMs >= 0);
assert.equal(rpoModel.rpoMinutes, 5);

console.log(JSON.stringify({
  manifestVerified: true,
  tamperDetected: true,
  restoreOrdering: order,
  measurements,
  measuredLocalHarnessRtoMs: rtoMs,
  modeledRpoMinutes: rpoModel.rpoMinutes,
  liveRestoreRequired: true,
}, null, 2));
