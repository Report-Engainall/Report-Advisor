import fs from 'node:fs';

const canonical = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');
const dashboard = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

for (const field of ['totalCustomers', 'totalProducts', 'invoiceCount']) {
  if (!new RegExp(`${field}:number\\|null`).test(canonical)) {
    throw new Error(`${field} must preserve unknown/null state in the public KPI contract`);
  }
  if (!new RegExp(`${field}:(?: finiteOrNull|valueOrNull)\\(row\\.${field}\\)`).test(canonical)) {
    throw new Error(`${field} must preserve unknown/null rather than coercing it to zero`);
  }
}

if (!canonical.includes("const valueOrNull = (value: unknown): number | null => status === 'INSUFFICIENT_DATA' ? null : finiteOrNull(value);")) {
  throw new Error('Dashboard canonical adapter must explicitly null all metrics when authoritative data is insufficient');
}
if (!canonical.includes("rawStatus === 'CONFIRMED' && !hasEvidence")) {
  throw new Error('Dashboard canonical adapter must not claim CONFIRMED without evidence');
}
if (!/const\s+metricStatus\s*=\s*\(value:\s*number\s*\|\s*null\).*value\s*===\s*null\s*\?\s*'INSUFFICIENT_DATA'\s*:\s*'CONFIRMED'/.test(dashboard)) {
  throw new Error('Dashboard must derive KPI status from each metric value, not the aggregate snapshot status');
}

for (const field of ['totalSales', 'grossProfit', 'totalReceivables', 'inventoryValue', 'totalCustomers', 'totalProducts', 'invoiceCount', 'collectionRate']) {
  if (!dashboard.includes(`status={metricStatus(kpis.${field})}`)) {
    throw new Error(`${field} KPI must preserve confirmed finite zero values independently`);
  }
}

console.log('Dashboard numeric truth contract: PASS');
