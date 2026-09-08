import fs from 'node:fs';

const canonical = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');
const dashboard = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

for (const field of ['totalCustomers', 'totalProducts', 'invoiceCount']) {
  if (!new RegExp(`${field}:number\\|null`).test(canonical)) {
    throw new Error(`${field} must preserve unknown/null state in the public KPI contract`);
  }
  if (!new RegExp(`${field}: finiteOrNull\\(row\\.${field}\\)`).test(canonical)) {
    throw new Error(`${field} must not coerce unknown/null to zero`);
  }
}

if (!dashboard.includes("const metricStatus=(value:number|null):'CONFIRMED'|'INSUFFICIENT_DATA'=>value===null?'INSUFFICIENT_DATA':'CONFIRMED';")) {
  throw new Error('Dashboard must derive KPI status from each metric value, not the aggregate snapshot status');
}

for (const field of ['totalSales', 'grossProfit', 'totalReceivables', 'inventoryValue', 'totalCustomers', 'totalProducts', 'invoiceCount', 'collectionRate']) {
  if (!dashboard.includes(`status={metricStatus(kpis.${field})}`)) {
    throw new Error(`${field} KPI must preserve confirmed finite zero values independently`);
  }
}

console.log('Dashboard numeric truth contract: PASS');
