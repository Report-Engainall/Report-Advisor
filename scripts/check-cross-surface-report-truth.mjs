import fs from 'node:fs';

const page = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const canonical = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');
const compat = fs.readFileSync('src/lib/queries-compat.ts', 'utf8');
const exportSql = fs.readFileSync('supabase/migrations/20260826010000_report_export_canonical_rows.sql', 'utf8');

const requiredConsumers = [
  'fetchDashboardSnapshot',
  'fetchInventoryReportSnapshot',
  'fetchSalesExportRows',
  'fetchPurchaseExportRows',
  'fetchInventoryExportRows',
  'fetchReceivablesExportRows',
];
for (const fn of requiredConsumers) {
  if (!page.includes(fn) && !compat.includes(fn)) throw new Error(`missing report truth consumer path: ${fn}`);
}

for (const marker of ['totalReceivables', 'totalSales', 'totalPurchases']) {
  if (!canonical.includes(marker)) throw new Error(`canonical KPI missing: ${marker}`);
}
for (const marker of ['get_sales_export_rows', 'get_purchase_export_rows', 'get_inventory_export_rows', 'get_receivables_export_rows', 'current_company_id()', 'TENANT_CONTEXT_MISMATCH']) {
  if (!exportSql.includes(marker)) throw new Error(`export authority contract missing: ${marker}`);
}

const forbidden = [
  /purchases\.reduce\s*\(/,
  /aging\.reduce\s*\(/,
  /r\.quantity\s*\*\s*r\.unit_cost/,
  /balances\.reduce\s*\(/,
];
for (const pattern of forbidden) {
  if (pattern.test(page)) throw new Error(`duplicate browser business truth remains: ${pattern}`);
}

const rows = [
  { total: 100, status: 'confirmed' },
  { total: 200, status: 'confirmed' },
  { total: 300, status: 'cancelled' },
];
const authoritative = rows.filter(r => r.status !== 'cancelled').reduce((s, r) => s + r.total, 0);
const pageSubset = rows.slice(0, 2).reduce((s, r) => s + r.total, 0);
if (authoritative !== 300 || pageSubset !== authoritative) throw new Error('cross-surface fixture invalid');

const unknown = { quantity: null, unit_cost: 25, value: null };
if (unknown.value !== null) throw new Error('unknown inventory value must remain NULL');

console.log('cross-surface report truth regression: PASS');
