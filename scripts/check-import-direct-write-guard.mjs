import fs from 'node:fs';
import path from 'node:path';

const targets = ['src/pages/ImportPage.tsx', 'src/pages/CanonicalImportPage.tsx'];
const forbidden = /supabase\s*\.\s*from\s*\([^)]*\)\s*\.(?:insert|upsert|update|delete)\s*\(/m;
const violations = [];

for (const target of targets) {
  const file = path.resolve(target);
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (forbidden.test(text)) violations.push(target);
}

if (violations.length) {
  console.error('Direct Supabase writes are forbidden in import UI paths:');
  for (const file of violations) console.error(` - ${file}`);
  process.exit(1);
}

console.log(`Import direct-write guard passed (${targets.length} files scanned).`);

const ledgerMigrationDir = path.join(process.cwd(), 'supabase', 'migrations');
const ledgerMigration = fs.readdirSync(ledgerMigrationDir)
  .filter((file) => /harden_canonical_import_commit_ledger_boundary/i.test(file) && file.endsWith('.sql'))
  .sort()
  .at(-1);
if (!ledgerMigration) throw new Error('Canonical commit ledger hardening migration is missing');
const ledgerSql = fs.readFileSync(path.join(ledgerMigrationDir, ledgerMigration), 'utf8');
for (const token of [
  /ALTER\s+FUNCTION\s+public\.import_commit_batch\([^;]+\)\s+SECURITY\s+DEFINER/i,
  /DROP\s+POLICY\s+IF\s+EXISTS\s+canonical_import_commits_tenant_insert/i,
  /REVOKE\s+INSERT\s*,\s*UPDATE\s*,\s*DELETE\s+ON\s+public\.canonical_import_commits\s+FROM\s+authenticated/i,
  /GRANT\s+SELECT\s+ON\s+public\.canonical_import_commits\s+TO\s+authenticated/i,
]) {
  if (!token.test(ledgerSql)) throw new Error('Canonical commit ledger hardening contract missing: ' + token);
}
const tamperedLedger = ledgerSql
  .replace(/REVOKE\s+INSERT\s*,\s*UPDATE\s*,\s*DELETE\s+ON\s+public\.canonical_import_commits\s+FROM\s+authenticated/i, 'GRANT INSERT, UPDATE, DELETE ON public.canonical_import_commits TO authenticated')
  .replace(/SECURITY\s+DEFINER/i, 'SECURITY INVOKER');
if (
  /REVOKE\s+INSERT\s*,\s*UPDATE\s*,\s*DELETE\s+ON\s+public\.canonical_import_commits\s+FROM\s+authenticated/i.test(tamperedLedger) ||
  /SECURITY\s+DEFINER/i.test(tamperedLedger)
) throw new Error('Canonical commit ledger adversarial test-of-test failed');
