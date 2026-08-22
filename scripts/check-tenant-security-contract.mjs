import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const migrations = files.map((file) => ({ file, text: fs.readFileSync(path.join(dir, file), 'utf8') }));

const resolver = migrations.find(({ file }) => file.includes('canonical_tenant_membership'));
const failClosedCandidates = migrations.filter(({ file }) => file.includes('import_rpc_fail_closed'));
if (!resolver) throw new Error('Canonical tenant membership migration is missing');
if (failClosedCandidates.length === 0) throw new Error('Import RPC fail-closed migration is missing');

const requiredAny = [
  ['CREATE TABLE IF NOT EXISTS company_memberships'],
  ['REFERENCES auth.users(id)'],
  ['CREATE OR REPLACE FUNCTION public.current_company_id()', 'CREATE OR REPLACE FUNCTION current_company_id()'],
  ['auth.uid()'],
  ['company_id = public.current_company_id()', 'company_id = current_company_id()'],
  ['WITH CHECK (company_id = public.current_company_id())', 'WITH CHECK (company_id = current_company_id())'],
  ['REVOKE ALL ON TABLE company_memberships FROM anon'],
];

for (const alternatives of requiredAny) {
  if (!alternatives.some((marker) => resolver.text.includes(marker))) {
    throw new Error(`Tenant security contract missing: ${alternatives.join(' OR ')}`);
  }
}

if (/CREATE POLICY[^;]+TO\s+anon[^;]+USING\s*\(\s*true\s*\)/is.test(resolver.text)) {
  throw new Error('Permissive anonymous tenant policy detected in canonical resolver');
}
if (/CREATE POLICY[^;]+TO\s+authenticated[^;]+USING\s*\(\s*true\s*\)/is.test(resolver.text)) {
  throw new Error('Permissive authenticated tenant policy detected in canonical resolver');
}

const failClosed = failClosedCandidates.find(({ text }) => text.includes('IMPORT_RPC_TENANT_AUTH_NOT_CONFIGURED'));
if (!failClosed) {
  const names = failClosedCandidates.map(({ file }) => file).join(', ');
  throw new Error(`Import RPC fail-closed contract missing from matching migrations: ${names}`);
}

console.log(`Tenant security contract: PASS (resolver=${resolver.file}, fail-closed=${failClosed.file})`);
