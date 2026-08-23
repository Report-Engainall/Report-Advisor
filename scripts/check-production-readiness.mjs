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

// Keep the readiness contract stricter than a hand-maintained subset: every
// quality gate that the authoritative workflow executes must exist in the
// package manifest. This prevents silent CI drift when a gate is renamed or
// removed from package.json.
const workflow = fs.readFileSync(path.join(root, '.github/workflows/quality.yml'), 'utf8');
const workflowScripts = [...workflow.matchAll(/run:\s+npm run ([A-Za-z0-9:_-]+)/g)].map((match) => match[1]);
const requiredScripts = [...new Set(workflowScripts)];
const missingScripts = requiredScripts.filter((name) => !packageJson.scripts?.[name]);
if (missingScripts.length) {
  console.error('Production readiness contract: FAIL');
  for (const name of missingScripts) console.error(`- missing workflow script: ${name}`);
  process.exit(1);
}

const qualityWorkflowPath = path.join(root, '.github/workflows/quality.yml');
if (!fs.existsSync(qualityWorkflowPath)) {
  console.error('Production readiness contract: FAIL');
  console.error('- missing authoritative quality workflow');
  process.exit(1);
}

const hasTypecheck = workflow.includes('npm run typecheck');
const hasLint = workflow.includes('npm run lint');
const hasBuild = workflow.includes('npm run build');
if (!hasTypecheck || !hasLint || !hasBuild) {
  console.error('Production readiness contract: FAIL');
  console.error('- authoritative workflow must include typecheck, lint, and build');
  process.exit(1);
}

console.log(`Production readiness contract: PASS (${requiredFiles.length} required paths, ${requiredScripts.length} workflow gates)`);
