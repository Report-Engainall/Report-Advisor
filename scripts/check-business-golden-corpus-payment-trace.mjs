import fs from 'node:fs';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
const customerIds = new Set(fixture.customers.map((row) => row.id));
for (const row of fixture.payments) {
  if (!customerIds.has(row.customer_id)) throw new Error(`BUSINESS_GOLDEN_PAYMENT_CUSTOMER_MISSING:${row.id}`);
}
for (const [tenantId, truth] of Object.entries(fixture.expected_truth).filter(([key]) => key !== 'isolation')) {
  const payments = fixture.payments.filter((row) => row.tenant_id === tenantId).reduce((sum, row) => sum + row.amount, 0);
  if (payments !== truth.payments) throw new Error(`BUSINESS_GOLDEN_PAYMENT_TOTAL_MISMATCH:${tenantId}`);
  const receivables = truth.net_sales - payments;
  if (receivables !== truth.receivables) throw new Error(`BUSINESS_GOLDEN_RECEIVABLE_TRACE_MISMATCH:${tenantId}`);
}
console.log('BUSINESS_GOLDEN_CORPUS_PAYMENT_TRACE_PASS');
