import fs from 'node:fs';

const compat = fs.readFileSync('src/lib/queries-compat.ts', 'utf8');
const page = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const sql = fs.readFileSync('supabase/migrations/20260826010000_report_export_canonical_rows.sql', 'utf8');

for (const fn of ['fetchSalesExportRows','fetchPurchaseExportRows','fetchInventoryExportRows','fetchReceivablesExportRows']) {
  if (!compat.includes(`export const ${fn}`)) throw new Error(`missing canonical export adapter: ${fn}`);
  if (!page.includes(fn)) throw new Error(`real report consumer missing canonical export: ${fn}`);
}
for (const fn of ['get_sales_export_rows','get_purchase_export_rows','get_inventory_export_rows','get_receivables_export_rows']) {
  if (!sql.includes(`create or replace function public.${fn}`)) throw new Error(`missing canonical export RPC: ${fn}`);
  if (!sql.includes(`p_max_rows integer default 10000`)) throw new Error(`export RPC ${fn} missing bounded contract`);
}

// Export must be dataset-based, not page-based. The report page may render 20/25 rows,
// but its export path must call the canonical export adapter instead of slicing the UI rows.
if (/exportSales[\s\S]{0,800}invoices\.map/.test(page)) throw new Error('sales export regressed to UI-page rows');
if (/exportPurchases[\s\S]{0,800}purchases\.map/.test(page)) throw new Error('purchase export regressed to UI-page rows');
if (/exportInventory[\s\S]{0,800}snapshot\.rows\.map/.test(page)) throw new Error('inventory export regressed to UI-page rows');

// Safety boundary: >10k is fail-closed, never silently truncated.
for (const marker of [
  "raise exception 'EXPORT_TOO_LARGE: sales export exceeds safe row limit'",
  "raise exception 'EXPORT_TOO_LARGE: purchase export exceeds safe row limit'",
  "raise exception 'EXPORT_TOO_LARGE: inventory export exceeds safe row limit'",
  "raise exception 'EXPORT_TOO_LARGE: receivables export exceeds safe row limit'",
]) if (!sql.includes(marker)) throw new Error(`missing fail-closed export boundary: ${marker}`);

console.log('EXPORT_COMPLETENESS_CONTRACT_PASS');
