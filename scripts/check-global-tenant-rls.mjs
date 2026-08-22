import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const migrations = files.map((file) => ({ file, text: fs.readFileSync(path.join(dir, file), 'utf8') }));

const canonicalName = '20260823000000_tenant_rls_global_hardening.sql';
const canonical = migrations.find(({ file }) => file === canonicalName);
if (!canonical) throw new Error(`Global tenant RLS hardening migration is missing: ${canonicalName}`);

const text = canonical.text;
const required = [
  'public.current_company_id()',
  'REVOKE ALL ON TABLE companies FROM anon',
  'CREATE POLICY tenant_products',
  'CREATE POLICY tenant_sale_items',
  'CREATE POLICY tenant_purchase_items',
  'CREATE POLICY tenant_import_rows',
  'CREATE POLICY tenant_import_job_rows',
  'company_id = public.current_company_id()',
  'ALTER TABLE %I ENABLE ROW LEVEL SECURITY',
  'REVOKE ALL ON TABLE %I FROM anon',
];
for (const marker of required) {
  if (!text.includes(marker)) throw new Error(`Global tenant RLS contract missing in ${canonical.file}: ${marker}`);
}

const tenantTables = [
  'branches', 'warehouses', 'categories', 'customers', 'suppliers', 'products',
  'sales_invoices', 'purchase_invoices', 'payments', 'inventory_movements',
  'inventory_balances', 'imports', 'recommendations', 'alerts', 'forecasts', 'audit_logs',
  'file_records', 'import_profiles', 'import_snapshots', 'import_jobs',
  'data_quality_reports', 'import_field_lineage',
];

const arrayBlock = text.match(/FOREACH\s+t\s+IN\s+ARRAY\s+ARRAY\[(.*?)\]/is)?.[1] ?? '';
for (const table of tenantTables) {
  if (!new RegExp(`['"]${table}['"]`, 'i').test(arrayBlock)) {
    throw new Error(`Tenant RLS hardening table missing from canonical list: ${table}`);
  }
}

// The migration uses one dynamic REVOKE template for every tenant-owned table.
// Verify the loop covers the entire explicit table inventory instead of requiring
// brittle per-table SQL literals.
if (!/EXECUTE\s+format\(\s*['"]REVOKE ALL ON TABLE %I FROM anon['"]\s*,\s*t\s*\)/i.test(text)) {
  throw new Error(`Canonical tenant hardening does not dynamically revoke anonymous access: ${canonical.file}`);
}

for (const table of tenantTables) {
  const policy = new RegExp(
    `CREATE POLICY\\s+tenant_${table}\\s+ON\\s+${table}\\s+FOR\\s+ALL\\s+TO\\s+authenticated[\\s\\S]*?USING\\s*\\(\\s*company_id\\s*=\\s*public\\.current_company_id\\(\\)\\s*\\)[\\s\\S]*?WITH CHECK\\s*\\(\\s*company_id\\s*=\\s*public\\.current_company_id\\(\\)\\s*\\)`,
    'i',
  );
  if (!policy.test(text)) throw new Error(`Tenant RLS policy is incomplete for ${table}`);
}

if (/CREATE POLICY\s+anon_[^;]+\s+ON\s+(?:products|imports|sales_invoices|purchase_invoices|customers|suppliers|file_records|import_jobs)\s+FOR\s+(?:SELECT|INSERT|UPDATE|DELETE)[^;]+(?:USING|WITH CHECK)\s*\(\s*true\s*\)/is.test(text)) {
  throw new Error(`Permissive anonymous policy detected in canonical tenant hardening: ${canonical.file}`);
}
if (/CREATE POLICY\s+\S+\s+ON\s+\S+\s+FOR\s+[^;]*\s+TO\s+anon\b/i.test(text)) {
  throw new Error(`Anonymous RLS policy detected in canonical tenant hardening: ${canonical.file}`);
}
if (!/REVOKE ALL ON TABLE (?:%I FROM anon|[a-z_]+ FROM anon)/i.test(text)) {
  throw new Error(`Canonical tenant hardening must revoke anonymous table access: ${canonical.file}`);
}
if (text.trim().length < 1000) throw new Error(`Canonical tenant hardening appears truncated: ${canonical.file}`);

console.log(`Global tenant RLS contract: PASS (canonical=${canonical.file}, tenantTables=${tenantTables.length}, migrations=${migrations.length})`);
