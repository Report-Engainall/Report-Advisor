import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');

for (const token of [
  'export function ReceivablesReportPage',
  'fetchDashboardSnapshot(6)',
  'const [truth,setTruth]=useState<Awaited<ReturnType<typeof fetchDashboardSnapshot>>|null>(null);',
  'setTruth(snap)',
  '<TruthContextStrip months={6} status={truth.kpis.status} asOf={truth.asOf}/>',
]) {
  assert.ok(source.includes(token), 'missing receivables truth token: ' + token);
}

assert.ok(!source.includes("status: 'INSUFFICIENT_DATA', asOf: new Date().toISOString()"));
console.log('Receivables report truth contract: PASS');
