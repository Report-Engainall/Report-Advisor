import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const migrations = files.map((file) => ({ file, text: fs.readFileSync(path.join(dir, file), 'utf8') }));
const canonical = migrations.find(({ file }) => file === '20260823000000_tenant_rls_global_hardening.sql');
if (!canonical) throw new Error('Global tenant RLS hardening migration is missing');

const text = canonical.text;
const required = [
  'public.current_company_id()',
  'REVOKE ALL ON TABLE companies FROM anon',
  'REVOKE ALL ON TABLE products FROM anon',
  'REVOKE ALL ON TABLE imports FROM anon',
  'CREATE POLICY tenant_products',
  'CREATE POLICY tenant_sale_items',
  'CREATE POLICY tenant_purchase_items',
  'CREATE POLICY tenant_import_rows',
  'CREATE POLICY tenant_import_job_rows',
  'company_id = public.current_company_id()',
];

for (const marker of required) {
  if (!text.includes(marker)) throw new Error(`Global tenant RLS contract missing: ${marker}`);
}

// Only the canonical hardening migration is evaluated. Historical prototype
// migrations may contain permissive policies that this migration deliberately supersedes.
if (/CREATE POLICY\s+anon_[^;]+\s+ON\s+(?:products|imports|sales_invoices|purchase_invoices|customers|suppliers|file_records|import_jobs)\s+FOR\s+(?:SELECT|INSERT|UPDATE|DELETE)[^;]+(?:USING|WITH CHECK)\s*\(\s*true\s*\)/is.test(text)) {
  throw new Error('Permissive anonymous policy detected in canonical tenant hardening');
}

if (!/REVOKE ALL ON TABLE [a-z_]+ FROM anon/i.test(text)) {
  throw new Error('Canonical tenant hardening must revoke anonymous table access');
}

console.log(`Global tenant RLS contract: PASS (canonical=${canonical.file})`);
