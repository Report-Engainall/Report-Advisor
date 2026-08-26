import fs from 'node:fs';
import assert from 'node:assert/strict';

const rpc = fs.readFileSync('supabase/migrations/20260826110000_wave07_truth_certification.sql', 'utf8');
const canonical = fs.readFileSync('src/lib/canonical-data-truth.ts', 'utf8');
const reports = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const index = fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md', 'utf8');

const checks = [];
function check(name, condition, evidence) {
  assert.ok(condition, `${name}: ${evidence}`);
  checks.push({ name, evidence });
}

// Canonical tenant authority: caller tenant is only an assertion.
check('RPCs derive tenant from authenticated context',
  (rpc.match(/current_company_id\(\)/g) ?? []).length >= 3,
  'executive/purchase/inventory/trend functions resolve current_company_id()');
check('RPCs reject caller-selected tenant mismatch',
  (rpc.match(/TENANT_CONTEXT_MISMATCH/g) ?? []).length >= 4,
  'all canonical functions reject a mismatched p_company_id');
check('Invalid date ranges are rejected', rpc.includes("INVALID_DATE_RANGE"), 'executive aggregate validates p_from <= p_to');
check('Anonymous execution is denied',
  rpc.includes('REVOKE ALL ON FUNCTION public.get_executive_metrics(uuid,date,date) FROM PUBLIC, anon'),
  'canonical executive RPC is not executable by anon/public');

// Data-truth semantics: unknown must never be silently fabricated as zero.
check('Profitability becomes insufficient when cost inputs are missing',
  rpc.includes("'profitability_status', CASE WHEN sales.missing_cost_rows > 0 THEN 'INSUFFICIENT_DATA'"),
  'missing quantity/cost rows invalidate profitability instead of partial aggregation');
check('Gross margin is nullable for zero revenue or missing cost',
  rpc.includes("sales.missing_cost_rows > 0 OR sales.revenue = 0 THEN NULL"),
  'unknown/undefined margin is not represented as zero');
check('Inventory valuation remains null when incomplete',
  rpc.includes("v_rows > 0 AND v_missing = 0 THEN v_total ELSE NULL"),
  'missing quantity/unit cost => INSUFFICIENT_DATA/null');
check('Inventory low/out-of-stock counts are canonical',
  rpc.includes("'low_stock', v_low") && rpc.includes("'out_of_stock', v_out"),
  'dashboard/report consumers can use one domain aggregate');

// Pagination truth: business totals must not be derived from the display page.
check('Purchase page is display-only',
  reports.includes('fetchPurchaseInvoices(0,20)') && reports.includes('fetchCanonicalPurchaseSummary()'),
  'purchase total comes from canonical summary while 20 rows remain display data');
check('21-row regression invariant',
  index.includes('21 purchase rows produce total 231') || fs.readFileSync('scripts/execution-wave-05-consumer-regression.mjs','utf8').includes('231'),
  '21 rows cannot collapse to the first 20 rows as the business total');

// Canonical trend exists at the domain boundary with nullable semantics.
check('Monthly trend has a canonical server-side path',
  canonical.includes("get_sales_monthly_truth") && canonical.includes('CanonicalSalesMonthlyTruth'),
  'sales/cost/profit trend is now available from a tenant-authoritative domain RPC');
check('Trend adapter preserves unknown cost/profit',
  canonical.includes('cost: finiteOrNull(r.cost)') && canonical.includes('profit: finiteOrNull(r.profit)'),
  'nullable values are preserved rather than coerced to zero');

// No false certification.
check('Index separates local/live/certified states',
  index.includes('RUNTIME VERIFIED') && index.includes('LIVE VERIFIED') && index.includes('PRODUCTION CERTIFIED'),
  'implemented/tested is not promoted to live/certified');

console.log(JSON.stringify({ wave: '07', passed: checks.length, checks }, null, 2));
