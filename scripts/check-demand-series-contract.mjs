import fs from 'node:fs';

const source = fs.readFileSync('src/lib/free-toolbox/sales-demand-series.ts', 'utf8');
for (const token of [
  'function requiredDemandRows<T extends Record<string, unknown>>',
  'REPORT_DATA_UNAVAILABLE: demand invoices missing',
  'REPORT_DATA_UNAVAILABLE: demand invoices invalid',
  'REPORT_DATA_UNAVAILABLE: demand invoice shape invalid',
  'REPORT_DATA_UNAVAILABLE: demand items missing',
  'REPORT_DATA_UNAVAILABLE: demand items invalid',
  'REPORT_DATA_UNAVAILABLE: demand item shape invalid',
  'REPORT_DATA_UNAVAILABLE: demand invoice reference invalid',
  'REPORT_DATA_UNAVAILABLE: demand product relation invalid',
  "typeof row.product_id !== 'string'",
  'demand row relation invalid',
  '!dateByInvoice.has(row.invoice_id)',
]) {
  if (!source.includes(token)) throw new Error('Demand-series contract missing: ' + token);
}
console.log('Demand-series contract: PASS');
