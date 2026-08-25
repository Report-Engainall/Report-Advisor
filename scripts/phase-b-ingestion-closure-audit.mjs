import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationDir = path.join(root, 'supabase', 'migrations');
const importRoot = path.join(root, 'src', 'lib', 'import');

function readTree(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.(ts|tsx|js|mjs|sql)$/i.test(entry.name)) out.push(full);
    }
  }
  return out;
}

const migrations = readTree(migrationDir).map((file) => ({
  file: path.relative(root, file),
  text: fs.readFileSync(file, 'utf8'),
}));
const importFiles = readTree(importRoot).map((file) => ({
  file: path.relative(root, file),
  text: fs.readFileSync(file, 'utf8'),
}));
const allImportText = importFiles.map((item) => item.text).join('\n');
const allMigrationText = migrations.map((item) => item.text).join('\n');

const checks = [];
function check(id, description, passed, status = passed ? 'PASS' : 'BLOCKED', reason = '') {
  checks.push({ id, description, status, reason });
}

const canonical = importFiles.find((item) => item.file.endsWith('canonical-commit.ts'));
check(
  'B-CANONICAL-ENTRY',
  'Canonical import commit boundary exists',
  Boolean(canonical),
  canonical ? 'PASS' : 'BLOCKED',
  canonical ? '' : 'canonical-commit.ts not found',
);

check(
  'B-GOVERNED-WRITES',
  'Canonical import path uses RPC rather than direct bulk table writes',
  Boolean(canonical) && !/supabase\\.from\\([^)]*\\)\\.(?:insert|upsert|update)\\s*\\(/is.test(canonical.text),
  Boolean(canonical) && !/supabase\\.from\\([^)]*\\)\\.(?:insert|upsert|update)\\s*\\(/is.test(canonical.text) ? 'PASS' : 'FAIL',
  'Direct bulk write detected in canonical import boundary',
);

const lifecycleSignals = [
  /import_jobs/i,
  /import_job_rows/i,
  /(?:finish[_ ]?job|finalize|terminal)/i,
  /failed/i,
  /cancelled/i,
  /(?:rollback|FOR\\s+UPDATE|advisory|lock)/i,
];
for (const [index, pattern] of lifecycleSignals.entries()) {
  check(`B-LIFECYCLE-${index + 1}`, `Import lifecycle signal ${pattern}`, pattern.test(allMigrationText), pattern.test(allMigrationText) ? 'PASS' : 'BLOCKED', 'Authoritative runtime migration evidence is missing');
}

check('B-IDEMPOTENCY', 'Import migrations contain a business-key/idempotency boundary', /business[_ -]?key|idempot|unique.*(?:sku|invoice|code)/i.test(allMigrationText), /business[_ -]?key|idempot|unique.*(?:sku|invoice|code)/i.test(allMigrationText) ? 'PASS' : 'BLOCKED', 'No authoritative idempotency signal found');
check('B-CONCURRENCY', 'Import migrations contain explicit concurrency protection', /concurr|unique_violation|FOR\\s+UPDATE|advisory/i.test(allMigrationText), /concurr|unique_violation|FOR\\s+UPDATE|advisory/i.test(allMigrationText) ? 'PASS' : 'BLOCKED', 'No authoritative concurrency protection signal found');
check('B-TENANT', 'Import RPCs enforce canonical tenant context', /current_company_id\\s*\\(\\)/i.test(allMigrationText) && /TENANT_CONTEXT/i.test(allMigrationText), /current_company_id\\s*\\(\\)/i.test(allMigrationText) && /TENANT_CONTEXT/i.test(allMigrationText) ? 'PASS' : 'BLOCKED', 'Live tenant/runtime evidence still required');
check('B-NULL-POLICY', 'Product import RPC exposes explicit null policy', /p_null_policy/i.test(allMigrationText), /p_null_policy/i.test(allMigrationText) ? 'PASS' : 'BLOCKED', 'Null-policy contract not found');
check('B-QUARANTINE', 'Import architecture exposes quarantine/error handling', /quarantine|failed|error/i.test(allImportText + allMigrationText), /quarantine|failed|error/i.test(allImportText + allMigrationText) ? 'PASS' : 'BLOCKED', 'Quarantine/persistence runtime must be proven');
check('B-LINEAGE', 'Import architecture contains lineage/audit signals', /lineage|provenance|audit/i.test(allImportText + allMigrationText), /lineage|provenance|audit/i.test(allImportText + allMigrationText) ? 'PASS' : 'BLOCKED', 'Runtime lineage evidence required');
check('B-REAL-FILE', 'Real-file end-to-end import evidence', false, 'LIVE REQUIRED', 'Static repository inspection cannot prove upload → parse → map → validate → reconcile → commit on a real file');
check('B-RECOVERY', 'Import retry/rollback/recovery runtime evidence', false, 'LIVE REQUIRED', 'Static contracts cannot prove recovery behavior in a live environment');
check('B-PERSISTENCE', 'Import persistence/runtime evidence', false, 'LIVE REQUIRED', 'Requires authoritative Supabase execution and persisted evidence');

const summary = {
  pass: checks.filter((item) => item.status === 'PASS').length,
  fail: checks.filter((item) => item.status === 'FAIL').length,
  blocked: checks.filter((item) => item.status === 'BLOCKED').length,
  liveRequired: checks.filter((item) => item.status === 'LIVE REQUIRED').length,
};

const report = {
  contract: 'phase-b-ingestion-closure-audit',
  scope: 'Phase B Data & Ingestion Closure',
  rule: 'Static contracts may establish readiness but never substitute for real-file or live persistence evidence',
  checks,
  summary,
  result: summary.fail || summary.blocked ? 'BLOCKED' : summary.liveRequired ? 'GATED' : 'PASS',
};

console.log(JSON.stringify(report, null, 2));
if (summary.fail || summary.blocked) process.exitCode = 2;
