import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const surfaces = {
  Dashboard: 'src/pages/DashboardPage.tsx',
  ExecutiveDecision: 'src/pages/ExecutiveCommandCenterPage.tsx',
  Reports: 'src/pages/ReportsPage.tsx',
};
const forbidden = ['fetchDashboardKPIs', 'fetchMonthlyTrend', 'fetchTopCustomers'];
const findings = [];
for (const [surface, relative] of Object.entries(surfaces)) {
  const file = fs.readFileSync(path.join(root, relative), 'utf8');
  for (const symbol of forbidden) {
    if (file.includes(symbol)) findings.push({ surface, file: relative, symbol, classification: 'DIVERGENT-BUG' });
  }
}
if (findings.length) {
  console.error('GROSS_PROFIT_SURFACE_CONSUMER_GATE: FAIL');
  console.error(JSON.stringify(findings, null, 2));
  process.exit(1);
}
console.log('GROSS_PROFIT_SURFACE_CONSUMER_GATE: PASS');
