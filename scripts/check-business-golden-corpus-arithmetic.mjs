import fs from 'node:fs';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
for (const [tenantId, truth] of Object.entries(fixture.expected_truth).filter(([k]) => k !== 'isolation')) {
  const sales = fixture.sales.filter((row) => row.tenant_id === tenantId);
  const purchases = fixture.purchases.filter((row) => row.tenant_id === tenantId);
  const inventory = fixture.inventory.filter((row) => row.tenant_id === tenantId);
  const payments = fixture.payments.filter((row) => row.tenant_id === tenantId);
  const gross = sales.reduce((n, row) => n + row.gross, 0);
  const returns = sales.reduce((n, row) => n + row.return, 0);
  const purchasesTotal = purchases.reduce((n, row) => n + row.total, 0);
  const inventoryValue = inventory.reduce((n, row) => n + row.qty * row.unit_cost, 0);
  const paymentTotal = payments.reduce((n, row) => n + row.amount, 0);
  const expected = {
    gross_sales: gross,
    returns,
    net_sales: gross - returns,
    purchases: purchasesTotal,
    inventory_value: inventoryValue,
    payments: paymentTotal,
    receivables: gross - returns - paymentTotal,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (truth[key] !== value) throw new Error(`BUSINESS_GOLDEN_ARITHMETIC_MISMATCH:${tenantId}:${key}:${truth[key]}!=${value}`);
  }
  if (truth.estimated_gross_profit !== truth.net_sales - truth.estimated_cogs) {
    throw new Error(`BUSINESS_GOLDEN_ARITHMETIC_MISMATCH:${tenantId}:estimated_gross_profit`);
  }
}
console.log('BUSINESS_GOLDEN_CORPUS_ARITHMETIC_PASS');
