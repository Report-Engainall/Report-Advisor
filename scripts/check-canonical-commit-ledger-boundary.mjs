import fs from 'node:fs';
import path from 'node:path';

const migrationDir = path.join(process.cwd(), 'supabase', 'migrations');
const candidates = fs.readdirSync(migrationDir)
  .filter((file) => /harden_canonical_import_commit_ledger_boundary/i.test(file) && file.endsWith('.sql'))
  .sort();
if (!candidates.length) throw new Error('Canonical commit ledger hardening migration is missing');

const source = candidates
  .map((file) => fs.readFileSync(path.join(migrationDir, file), 'utf8'))
  .join('\n');
const latestSource = fs.readFileSync(path.join(migrationDir, candidates.at(-1)), 'utf8');
const required = [
  /DROP\s+POLICY\s+IF\s+EXISTS\s+canonical_import_commits_tenant_insert/i,
  /REVOKE\s+INSERT\s*,\s*UPDATE\s*,\s*DELETE\s+ON\s+public\.canonical_import_commits\s+FROM\s+authenticated/i,
  /REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.import_commit_batch\(uuid,\s*text,\s*jsonb,\s*text,\s*text\)\s+FROM\s+PUBLIC,\s*anon,\s*authenticated/i,
  /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.import_commit_batch\(uuid,\s*text,\s*jsonb,\s*text,\s*text\)\s+TO\s+service_role/i,
  /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.import_commit_batch\(uuid,\s*text,\s*jsonb,\s*text,\s*text,\s*uuid\)\s+TO\s+authenticated,\s*service_role/i,
];
const satisfiesBoundary = (candidate) => required.every((pattern) => pattern.test(candidate));
if (!satisfiesBoundary(source)) {
  throw new Error('Canonical commit ledger boundary missing one or more required security invariants');
}

const weakened = latestSource
  .replace(/REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.import_commit_batch\(uuid,\s*text,\s*jsonb,\s*text,\s*text\)\s+FROM\s+PUBLIC,\s*anon,\s*authenticated/i, 'GRANT EXECUTE ON FUNCTION public.import_commit_batch(uuid, text, jsonb, text, text) TO authenticated')
  .replace(/REVOKE\s+INSERT\s*,\s*UPDATE\s*,\s*DELETE\s+ON\s+public\.canonical_import_commits\s+FROM\s+authenticated/i, 'GRANT INSERT, UPDATE, DELETE ON public.canonical_import_commits TO authenticated')
  .replace(/SECURITY\s+DEFINER/i, 'SECURITY INVOKER');

if (satisfiesBoundary(weakened)) {
  throw new Error('Adversarial ledger guard failed to reject weakened five-argument/direct-writer/security-invoker state');
}

console.log('Canonical commit ledger boundary: PASS (legacy 5-arg writer service-role-only; authoritative 7-arg RPC retained)');
