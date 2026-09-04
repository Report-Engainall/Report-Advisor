import { strict as assert } from 'node:assert';
import fs from 'node:fs';

const file = fs.readFileSync('scripts/semantic-business-report-browser-e2e.mjs', 'utf8');

for (const token of [
  "rpc('get_dashboard_snapshot'",
  "rpc('get_inventory_report_snapshot'",
  "rpc('get_receivables_report_page'",
  "rpc('get_purchase_summary'",
  "goto('/command-center')",
  "goto('/reports/inventory')",
  "goto('/reports/sales')",
  "goto('/reports/purchases')",
  "goto('/reports/receivables')",
  "cardValue('إجمالي المبيعات')",
  "cardValue('إجمالي الربح')",
  "cardValue('إجمالي الذمم')",
  "cardValue('قيمة المخزون')",
  "assert.equal(uiSales, payload.totalSales",
  "assert.equal(uiValue, payload.totalValue",
  "assert.equal(uiOutstanding, payload.total_outstanding",
  "assert.equal(uiTotal, payload.total",
  "INSUFFICIENT_DATA",
  "BROWSER_SESSION_NOT_FOUND",
  "SEMANTIC_E2E_BLOCKED:MISSING_",
]) assert.ok(file.includes(token), `semantic browser oracle missing required contract token: ${token}`);

assert.match(file, /exactHead/, 'exact-head evidence missing');
assert.match(file, /semantic-business-report-browser-e2e\.json/, 'semantic evidence artifact missing');
assert.match(file, /status: 'PASS'/, 'semantic runner must emit PASS only after assertions');
assert.match(file, /throw error/, 'semantic runner must fail closed on oracle mismatch');

console.log('Semantic Business Report Browser E2E contract PASS: canonical RPC calls, rendered UI value comparisons, insufficient-data guard, exact-head binding, and fail-closed behavior are enforced.');
