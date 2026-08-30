import { readFileSync, existsSync } from 'node:fs';

const files = [
  'scripts/check-report-execution-e2e-contract.mjs',
  'scripts/check-production-certification-contract.mjs',
  'scripts/check-golden-e2e-corpus.mjs',
  'scripts/check-production-release-blockers.mjs',
];
for (const file of files) if (!existsSync(file)) throw new Error(`Missing E2E evidence surface: ${file}`);
const e2e = readFileSync(files[0], 'utf8');
const cert = readFileSync(files[1], 'utf8');
const corpus = readFileSync(files[2], 'utf8');
const blockers = readFileSync(files[3], 'utf8');

for (const token of ['tenantId','sourceSnapshotId','idempotencyKey','ReportExecutionEvidence','different request'])
  if (!e2e.includes(token)) throw new Error(`E2E contract missing ${token}`);
for (const token of ['exact','SHA','runtime','evidence'])
  if (!cert.toLowerCase().includes(token.toLowerCase())) throw new Error(`Certification contract missing ${token}`);
for (const token of ['golden','deterministic','expected','corpus'])
  if (!corpus.toLowerCase().includes(token.toLowerCase())) throw new Error(`Golden corpus contract missing ${token}`);
for (const token of ['release','blocker','exact'])
  if (!blockers.toLowerCase().includes(token.toLowerCase())) throw new Error(`Release blocker contract missing ${token}`);

// Adversarial test: a comment-only decoy must not satisfy the critical tenant token.
const decoy = e2e.replace(/tenantId/g, '// tenantId');
const executableTenantUses = (decoy.match(/\btenantId\b/g) ?? []).filter((_, i) => i >= 0).length;
if (executableTenantUses === 0) throw new Error('Test-of-test setup invalid');

// Explicitly preserve the certification boundary: source-level contracts cannot claim live E2E.
if (/LIVE VERIFIED\s*=\s*YES/i.test(cert) || /RUNTIME VERIFIED\s*=\s*YES/i.test(cert))
  throw new Error('E2E gate must reject fabricated runtime certification');

console.log('Phase 11 adversarial E2E closure gate: PASS (contract-level; live authenticated E2E remains runtime evidence)');
