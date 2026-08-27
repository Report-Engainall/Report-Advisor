import fs from 'node:fs';

const page = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const canonical = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');

const failures = [];

if (!canonical.includes('totalReceivables:number|null')) {
  failures.push('DashboardKPIs must expose canonical totalReceivables');
}

if (!page.includes('snap.kpis.totalReceivables')) {
  failures.push('Receivables report must consume canonical snap.kpis.totalReceivables');
}

if (/aging\.reduce\s*\(/.test(page)) {
  failures.push('Receivables report contains forbidden browser aggregation of aging buckets');
}

if (failures.length) {
  console.error('RECEIVABLES_REPORT_TRUTH: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('RECEIVABLES_REPORT_TRUTH: PASS');
