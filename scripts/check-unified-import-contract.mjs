import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const migration = read('supabase/migrations/20260820100000_unified_import_engine.sql');
const page = read('src/pages/ImportPageV2.tsx');
const security = read('src/lib/file-engine/security.ts');
const legacy = read('src/pages/ImportPage.tsx');

const requiredMigrationTokens = [
  'start_import_job',
  'import_upsert_chunk',
  'public.has_company_access',
  'import_job_rows',
  "p_entity_type NOT IN ('products','customers','sales_invoices')",
];
for (const token of requiredMigrationTokens) {
  if (!migration.includes(token)) throw new Error(`Missing unified import contract token: ${token}`);
}

if (!page.includes("supabase.rpc('start_import_job'")) throw new Error('Import UI does not start the unified job.');
if (!page.includes("supabase.rpc('import_upsert_chunk'")) throw new Error('Import UI does not use the unified chunk RPC.');
if (!page.includes('const chunkSize = 500')) throw new Error('Import UI batch size contract changed unexpectedly.');

for (const forbidden of [
  ".from('products').insert(",
  ".from('products').upsert(",
  ".from('customers').insert(",
  ".from('customers').upsert(",
  ".from('sales_invoices').insert(",
  ".from('sales_invoices').upsert(",
]) {
  if (page.includes(forbidden) || legacy.includes(forbidden)) {
    throw new Error(`Legacy bulk write path detected: ${forbidden}`);
  }
}

if (!security.includes('isExplicitArchive')) throw new Error('Archive safety regression: explicit archive detection is missing.');
if (security.includes('const isZip = bytes[0]') && security.includes('decompressedEstimate = file.size * 100')) {
  throw new Error('Archive safety regression: old ZIP heuristic still rejects Office containers.');
}

console.log('Unified import contract: PASS');
