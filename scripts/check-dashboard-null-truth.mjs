import fs from 'node:fs';

const source = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');

for (const field of ['totalCustomers', 'totalProducts', 'invoiceCount']) {
  if (!new RegExp(`${field}:number\\|null`).test(source)) {
    throw new Error(`${field} must preserve unknown/null state in the public KPI contract`);
  }
  if (!new RegExp(`${field}: finiteOrNull\\(row\\.${field}\\)`).test(source)) {
    throw new Error(`${field} must not coerce unknown/null to zero`);
  }
}

console.log('Dashboard numeric truth contract: PASS');
