import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'src/main.tsx',
  'src/App.tsx',
  'src/lib/file-engine',
  'scripts/check-file-engine-contract.mjs',
  'scripts/check-import-transaction-contract.mjs',
  'scripts/check-import-runtime-governance.mjs',
  'scripts/check-tenant-security-contract.mjs',
  'scripts/check-report-truth-contract.mjs',
  'supabase/migrations/20260819200000_import_engine_rpcs.sql',
  'supabase/migrations/20260819203000_import_engine_jobs.sql',
  'supabase/migrations/20260822180000_security_hardening_imports.sql',
  'supabase/migrations/20260822200000_canonical_tenant_membership.sql',
  'supabase/migrations/20260822200000_import_lineage_idempotency.sql',
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error('Production readiness contract: FAIL');
  for (const file of missing) console.error(`- missing: ${file}`);
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const requiredScripts = [
  'typecheck',
  'lint',
  'build',
  'perf:budget',
  'test:file-engine-contract',
  'test:import-transaction-contract',
  'test:import-runtime-governance',
  'test:tenant-security-contract',
  'test:global-tenant-rls',
  'test:import-rpc-tenant-context',
  'test:import-business-key',
  'test:report-truth',
];
const missingScripts = requiredScripts.filter((name) => !packageJson.scripts?.[name]);
if (missingScripts.length) {
  console.error('Production readiness contract: FAIL');
  for (const name of missingScripts) console.error(`- missing script: ${name}`);
  process.exit(1);
}

console.log(`Production readiness contract: PASS (${requiredFiles.length} required paths, ${requiredScripts.length} quality gates)`);
