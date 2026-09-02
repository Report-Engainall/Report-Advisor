import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const endpoint = 'api/backup-restore-verify.mjs';
const source = readFileSync(endpoint, 'utf8');

execFileSync(process.execPath, ['--check', endpoint], { stdio: 'inherit' });

const requiredContracts = [
  "const maxRpoSeconds = Number(process.env.RESILIENCE_MAX_RPO_SECONDS);",
  "if (!Number.isFinite(maxRpoSeconds) || maxRpoSeconds < 0)",
  "if (!/^[a-f0-9]{64}$/.test(expectedArtifactSha256))",
  "Boolean(String(backup?.id || '').trim())",
  "Number.isFinite(insertedAt)",
  "const rtoSeconds = measuredRto;",
  "reported_rto_seconds",
  "restoreEvidence.restored !== true || restoreEvidence.integrity_verified !== true",
];

for (const contract of requiredContracts) {
  assert.ok(source.includes(contract), `missing backup evidence integrity contract: ${contract}`);
}

assert.ok(
  !source.includes("Number.isFinite(Number(restoreEvidence.rto_seconds)) ? Number(restoreEvidence.rto_seconds) : measuredRto"),
  'RTO evidence must not trust verifier-reported timing as the measured RTO',
);

console.log(`PASS: backup/restore evidence integrity contract (${requiredContracts.length} invariants).`);
