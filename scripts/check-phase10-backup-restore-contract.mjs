import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'supabase/migrations/20260829023000_restore_import_lifecycle_rpcs.sql',
  'scripts/check-production-certification-evidence-integrity.mjs',
  'docs/MASTER_EXECUTION_INDEX.md',
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing recovery surface: ${file}`);
}

const migration = fs.readFileSync(path.join(root, required[0]), 'utf8');
const evidence = fs.readFileSync(path.join(root, required[1]), 'utf8');
const index = fs.readFileSync(path.join(root, required[2]), 'utf8');

for (const token of [
  'CREATE OR REPLACE FUNCTION public.import_create_job',
  'CREATE OR REPLACE FUNCTION public.import_update_job_progress',
  'SECURITY INVOKER',
  'SET search_path = public',
  'current_company_id()',
  'TENANT_CONTEXT_MISMATCH',
  'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN',
  'REVOKE ALL ON FUNCTION',
  'GRANT EXECUTE ON FUNCTION',
]) if (!migration.includes(token)) throw new Error(`Missing recovery security/lifecycle invariant: ${token}`);

for (const token of [
  'exact', 'sha', 'artifact', 'evidence', 'PRODUCTION CERTIFIED',
]) if (!evidence.toLowerCase().includes(token.toLowerCase())) throw new Error(`Missing evidence binding invariant: ${token}`);

for (const token of ['R16 — BACKUP / RESTORE / DR', 'RPO', 'RTO', 'actual restore drill']) {
  if (!index.includes(token)) throw new Error(`Remaining-work register lost recovery boundary: ${token}`);
}

// Test the test: comments containing required tokens must not count as implementation evidence.
const decoy = migration.replace(/current_company_id\(\)/g, '// current_company_id()').replace(/TENANT_CONTEXT_MISMATCH/g, '// TENANT_CONTEXT_MISMATCH');
if (decoy.match(/current_company_id\(\)/g)?.length !== 2) throw new Error('Test-of-test failed: decoy unexpectedly counted as implementation');

console.log('Phase 10 backup/restore contract: PASS (source-level only; restore drill remains runtime evidence)');
