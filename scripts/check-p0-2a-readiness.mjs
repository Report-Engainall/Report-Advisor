import fs from 'node:fs';

const requiredFiles = [
  'docs/runtime-evidence/P0-2A-RUNTIME-EVIDENCE-READINESS.md',
  'scripts/runtime-evidence-config.mjs',
  'scripts/runtime-evidence-matrix.mjs',
  'scripts/runtime-evidence-record.mjs',
  'scripts/runtime-evidence-seed.mjs',
  'scripts/p0-2-live-isolation-harness.mjs',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`P0-2A NOT READY: missing ${file}`);
}

const config = fs.readFileSync('scripts/runtime-evidence-config.mjs', 'utf8');
const harness = fs.readFileSync('scripts/p0-2-live-isolation-harness.mjs', 'utf8');
const seed = fs.readFileSync('scripts/runtime-evidence-seed.mjs', 'utf8');
const record = fs.readFileSync('scripts/runtime-evidence-record.mjs', 'utf8');
const matrix = fs.readFileSync('scripts/runtime-evidence-matrix.mjs', 'utf8');

for (const required of [
  "['staging', 'test']",
  'TENANT_A_RUNTIME_SENTINEL_2026',
  'TENANT_B_RUNTIME_SENTINEL_2026',
  'RUNTIME_EVIDENCE_USER_A',
  'RUNTIME_EVIDENCE_USER_B',
]) if (!config.includes(required)) throw new Error(`P0-2A NOT READY: missing safety/config marker ${required}`);

if (!seed.includes('requireSafeRuntimeEnvironment')) throw new Error('P0-2A NOT READY: seed runner is not environment-guarded.');
if (!seed.includes('SUPABASE_SERVICE_ROLE_KEY')) throw new Error('P0-2A NOT READY: seed runner does not declare service-role key as environment-only input.');
if (!harness.includes('signInWithPassword')) throw new Error('P0-2A NOT READY: authenticated session harness missing.');
if (!harness.includes('ZERO UNAUTHORIZED ROWS')) throw new Error('P0-2A NOT READY: read isolation assertion missing.');
if (!harness.includes('requireAuthenticatedContext')) throw new Error('P0-2A NOT READY: fail-closed authenticated context missing.');
for (const field of ['TEST_ID', 'ENVIRONMENT', 'RELEASE', 'COMMIT_SHA', 'ACTOR', 'AUTHORIZED_TENANT', 'TARGET_TENANT', 'ROWS_RETURNED', 'ROWS_AFFECTED', 'RESULT', 'EVIDENCE_REFERENCE']) {
  if (!record.includes(`'${field}'`)) throw new Error(`P0-2A NOT READY: evidence field ${field} missing.`);
}
for (const marker of ['sale_items', 'purchase_items', 'import_rows', 'import_job_rows', 'SELECT', 'INSERT', 'UPDATE', 'DELETE']) {
  if (!matrix.includes(marker)) throw new Error(`P0-2A NOT READY: matrix marker ${marker} missing.`);
}
if (/process\.env\.(PASSWORD|TOKEN|SECRET|SERVICE_ROLE_KEY)\s*=/.test(seed + harness)) throw new Error('P0-2A NOT READY: runtime secret appears to be assigned by the repository code. Secrets must only be read from environment.');

console.log('P0-2A READY: runtime evidence infrastructure is present, fail-closed, and CI-checkable. No live runtime claim is emitted.');
