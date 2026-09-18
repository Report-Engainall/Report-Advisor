import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');

for (const token of [
  'export function SalesReportPage',
  'export function ProfitabilityReportPage',
  'fetchDashboardSnapshot(6)',
  'const {kpis,trend,topCustomers,topProducts,categories,asOf}=snapshot;',
  'const {kpis,categories,asOf}=snapshot;',
  '<TruthContextStrip months={6} status={kpis.status} asOf={asOf}/>',
  '<TruthContextStrip months={6} status={truth.kpis.status} asOf={truth.asOf}/>',
]) {
  assert.ok(source.includes(token), 'missing financial report truth token: ' + token);
}

const financialStrip = '<TruthContextStrip months={6} status={kpis.status} asOf={asOf}/>';
assert.equal((source.split(financialStrip).length - 1), 2, 'expected Sales + Profitability truth strips');
console.log('Financial report truth contract: PASS');
