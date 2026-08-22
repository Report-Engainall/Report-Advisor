import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql'));
const text = files.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');

const required = [
  'CREATE TABLE IF NOT EXISTS company_memberships',
  'REFERENCES auth.users(id)',
  'CREATE OR REPLACE FUNCTION current_company_id()',
  'auth.uid()',
  'company_id = public.current_company_id()',
  'WITH CHECK (company_id = public.current_company_id())',
  'REVOKE ALL ON TABLE company_memberships FROM anon',
];
for (const marker of required) {
  if (!text.includes(marker)) throw new Error(`Tenant security contract missing: ${marker}`);
}

if (/CREATE POLICY[^;]+TO\s+anon[^;]+USING\s*\(\s*true\s*\)/is.test(text)) {
  throw new Error('Permissive anonymous tenant policy detected');
}
if (/CREATE POLICY[^;]+TO\s+authenticated[^;]+USING\s*\(\s*true\s*\)/is.test(text)) {
  throw new Error('Permissive authenticated tenant policy detected');
}

const failClosed = text.includes('IMPORT_RPC_TENANT_AUTH_NOT_CONFIGURED');
if (!failClosed) throw new Error('Import RPC fail-closed contract missing');

console.log('Tenant security contract: PASS');
