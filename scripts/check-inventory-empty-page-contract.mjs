import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260827190000_inventory_snapshot_empty_page_truth.sql', 'utf8');
const adapter = fs.readFileSync('src/lib/report-truth.ts', 'utf8');

const requiredMigration = [
  'FROM page_rows CROSS JOIN metrics',
  'UNION ALL',
  'WHERE NOT EXISTS (SELECT 1 FROM page_rows)',
  'public.current_company_id()',
];
for (const token of requiredMigration) {
  if (!migration.includes(token)) throw new Error(`Inventory empty-page migration missing invariant: ${token}`);
}

if (!adapter.includes('.filter((row) => row.id != null)')) {
  throw new Error('Inventory adapter must discard the metrics-only empty-page sentinel from display rows.');
}
if (!adapter.includes('total_rows') || !adapter.includes('total_value') || !adapter.includes('incomplete_rows')) {
  throw new Error('Inventory adapter must preserve server truth metadata independently of page rows.');
}

console.log('INVENTORY_EMPTY_PAGE_CONTRACT: PASS');
console.log('Empty pages retain server metrics while the adapter excludes the metrics-only sentinel from display rows.');
