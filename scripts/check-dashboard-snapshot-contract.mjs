import fs from 'node:fs';

const source = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');
for (const token of [
  'function validatedObjectArray(value: unknown, label: string)',
  "requiredObjectArray<Alert>(row.alerts, 'dashboard alerts')",
  "requiredObjectArray<Recommendation>(row.recommendations, 'dashboard recommendations')",
  "requiredAsOf(row.as_of, 'profitability snapshot')",
  "requiredAsOf(row.asOf, 'aging snapshot')",
  "requiredAsOf(row.asOf, 'RFM snapshot')",
  "requiredAsOf(row.asOf, 'dashboard snapshot')",
  "requiredObjectArray<AgingSnapshotRow>(row.rows, 'aging rows')",
  "requiredObjectArray<ABCSnapshotRow>(row.rows, 'ABC rows')",
  "requiredObjectArray<RFMSnapshotRow>(row.rows, 'RFM rows')",
  "requiredStringArray(row.reasons, 'profitability reasons')",
  "requiredObjectArray<InventoryReportRow>(row.rows, 'inventory rows')",
  'function requiredAsOf(value: unknown, label: string)',
  'function requiredStringArray(value: unknown, label: string)',
  'function requiredObjectArray<T>(value: unknown, label: string)',
  "REPORT_DATA_UNAVAILABLE: dashboard ' + label + ' missing",
  "REPORT_DATA_UNAVAILABLE: dashboard ' + label + ' invalid",
  "validatedObjectArray(row.trend, 'trend')",
  "validatedObjectArray(row.topCustomers, 'topCustomers')",
  "validatedObjectArray(row.topProducts, 'topProducts')",
  "validatedObjectArray(row.categories, 'categories')",
  "validatedObjectArray(agingRow.rows, 'aging rows')",
]) {
  if (!source.includes(token)) throw new Error('Dashboard snapshot contract missing: ' + token);
}

if (source.includes('function requiredArray<T>(value: unknown): T[]')) throw new Error('Dashboard snapshot contract still permits silent array coercion');

console.log('Dashboard snapshot contract: PASS');
