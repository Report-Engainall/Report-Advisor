import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/lib/import/canonical-validation.ts', import.meta.url), 'utf8');

const assertions = [
  ['validation uses mappedField', source.includes('column.mappedField ?? column.name')],
  ['products identity allows sku and name', source.includes("products: ['sku', 'name']")],
  ['invoice identity is invoice_number', source.includes("sales_invoices: ['invoice_number']")],
  ['customer code is optional', source.includes("if (entity === 'customers' && field === 'code') return false")],
  ['customer name fallback is enforced', source.includes("code|name")],
];

const failures = assertions.filter(([, ok]) => !ok).map(([name]) => name);
if (failures.length) {
  console.error('Canonical import validation contract: FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Canonical import validation contract: PASS (${assertions.length} assertions)`);
