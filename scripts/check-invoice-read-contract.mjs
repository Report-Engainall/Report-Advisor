import fs from 'node:fs';

const source = fs.readFileSync('src/lib/queries.ts', 'utf8');
for (const token of [
  "REPORT_DATA_UNAVAILABLE: sales invoices rows missing",
  "REPORT_DATA_UNAVAILABLE: sales invoice row shape invalid",
  "REPORT_DATA_UNAVAILABLE: purchase invoices rows missing",
  "REPORT_DATA_UNAVAILABLE: purchase invoice row shape invalid",
  "item.company_id!==companyId",
  "Number.isFinite(new Date(item.invoice_date).getTime())",
  "Number.isFinite(Number(item.total))",
  "Number.isFinite(Number(item.paid_amount))",
]) {
  if (!source.includes(token)) throw new Error('Invoice read contract missing: ' + token);
}
if (source.includes("(data??[]) as SalesInvoice[]") || source.includes("(data??[]) as PurchaseInvoice[]")) {
  throw new Error('Invoice reads still silently coerce missing rows');
}
console.log('Invoice read contract: PASS');
