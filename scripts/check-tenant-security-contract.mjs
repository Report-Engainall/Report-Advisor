import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql'));
const resolverName = files.find((f) => f.includes('canonical_tenant_membership'));
const failClosedName = files.find((f) => f.includes('import_rpc_fail_closed'));
if (!resolverName || !failClosedName) throw new Error('Canonical tenant hardening migrations are missing');

const resolver = fs.readFileSync(path.join(dir, resolverName), 'utf8');
const failClosed = fs.readFileSync(path.join(dir, failClosedName), 'utf8');

const required = [
  'CREATE TABLE IF NOT EXISTS company_memberships',
  'REFERENCES auth.users(id)',
  'CREATE OR REPLACE FUNCTION public.current_company_id()',
  'auth.uid()',
  'company_id = public.current_company_id()',
  'WITH CHECK (company_id = public.current_company_id())',
  'REVOKE ALL ON TABLE company_memberships FROM anon',
];
for (const marker of required) {
  if (!resolver.includes(marker)) throw new Error(`Tenant security contract missing: ${marker}`);
}

if (/CREATE POLICY[^;]+TO\s+anon[^;]+USING\s*\(\s*true\s*\)/is.test(resolver)) {
  throw new Error('Permissive anonymous tenant policy detected in canonical resolver');
}
if (/CREATE POLICY[^;]+TO\s+authenticated[^;]+USING\s*\(\s*true\s*\)/is.test(resolver)) {
  throw new Error('Permissive authenticated tenant policy detected in canonical resolver');
}
if (!failClosed.includes('IMPORT_RPC_TENANT_AUTH_NOT_CONFIGURED')) {
  throw new Error('Import RPC fail-closed contract missing');
}

console.log('Tenant security contract: PASS');
