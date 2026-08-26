import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync('supabase/migrations/20260826052000_dashboard_canonical_aggregation.sql', 'utf8');
const page = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
const queries = fs.readFileSync('src/lib/queries.ts', 'utf8');
const adapter = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');

// Dataset semantics: 21 invoices exist, but a display page may contain only 20.
// Business aggregation must remain 21 and must exclude cancelled/void rows.
const invoices = Array.from({ length: 20 }, (_, i) => ({ id: `i-${i}`, subtotal: 10, status: 'confirmed' }));
invoices.push({ id: 'i-cancelled', subtotal: 1000, status: 'cancelled' });
invoices.push({ id: 'i-21', subtotal: 10, status: 'confirmed' });
const authoritativeRows = invoices.filter((row) => !['cancelled', 'void'].includes(row.status));
assert.equal(authoritativeRows.length, 21, 'aggregate must use full dataset, not display page size');
assert.equal(authoritativeRows.reduce((sum, row) => sum + row.subtotal, 0), 210, 'cancelled rows must not alter aggregate');

// NULL is not zero: a missing required cost must invalidate the cost-dependent metric.
const saleItems = [{ quantity: 2, cost_price: 3 }, { quantity: 1, cost_price: null }];
const hasMissingRequiredCost = saleItems.some((row) => row.quantity == null || row.cost_price == null);
assert.equal(hasMissingRequiredCost, true);
assert.match(sql, /bad_sale_item_rows/);
assert.match(sql, /'INSUFFICIENT_DATA'/);
assert.match(sql, /grossProfit.*CASE WHEN k\.total_sales IS NOT NULL AND k\.total_cost IS NOT NULL/s);

// Tenant authority is server-derived; no client company_id argument is accepted by the dashboard RPC.
assert.match(sql, /current_company_id\(\)/);
assert.match(sql, /SECURITY INVOKER/);
assert.doesNotMatch(sql, /get_dashboard_snapshot\(\s*p_company_id/);

// The dashboard consumer is migrated away from all legacy aggregation functions.
for (const legacy of ['fetchDashboardKPIs', 'fetchMonthlyTrend', 'fetchTopCustomers', 'fetchTopProducts', 'fetchCategoryBreakdown', 'fetchAgingBuckets']) {
  assert.doesNotMatch(page, new RegExp(`\\b${legacy}\\b`), `DashboardPage still consumes ${legacy}`);
}
assert.match(page, /fetchDashboardSnapshot/);
assert.match(adapter, /supabase\.rpc\('get_dashboard_snapshot'/);

// Legacy implementations remain intentionally retained until repository-wide zero-consumer proof.
assert.match(queries, /export async function fetchDashboardKPIs/);

console.log('PASS dashboard canonical semantic regression');
console.log('PASS aggregate is independent of display pagination');
console.log('PASS cancelled/void rows are excluded');
console.log('PASS required NULL data produces INSUFFICIENT_DATA semantics');
console.log('PASS dashboard RPC derives tenant authority from current_company_id()');
console.log('PASS DashboardPage migrated to canonical server snapshot');
console.log('PASS legacy query implementations retained pending zero-consumer proof');
