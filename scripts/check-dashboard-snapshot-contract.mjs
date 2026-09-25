import fs from 'node:fs';

const source = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');
for (const token of [
  'function validatedObjectArray(value: unknown, label: string)',
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

console.log('Dashboard snapshot contract: PASS');
