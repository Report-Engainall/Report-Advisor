import fs from 'node:fs';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
for (const collection of ['sales', 'purchases', 'payments']) {
  for (const row of fixture[collection]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || Number.isNaN(Date.parse(row.date))) throw new Error(`BUSINESS_GOLDEN_BAD_DATE:${collection}:${row.id}`);
  }
}
for (const row of fixture.products) {
  if (![row.cost, row.price].every(Number.isFinite) || row.cost < 0 || row.price < 0) throw new Error(`BUSINESS_GOLDEN_BAD_PRODUCT_VALUE:${row.id}`);
}
for (const row of fixture.sales) {
  if (![row.qty, row.unit_price, row.gross, row.return].every(Number.isFinite) || row.qty <= 0 || row.unit_price < 0 || row.gross < 0 || row.return < 0 || row.return > row.gross) throw new Error(`BUSINESS_GOLDEN_BAD_SALE_VALUE:${row.id}`);
}
for (const row of fixture.purchases) {
  if (![row.qty, row.unit_cost, row.total].every(Number.isFinite) || row.qty <= 0 || row.unit_cost < 0 || row.total < 0) throw new Error(`BUSINESS_GOLDEN_BAD_PURCHASE_VALUE:${row.id}`);
}
for (const row of fixture.inventory) {
  if (![row.qty, row.unit_cost].every(Number.isFinite) || row.qty < 0 || row.unit_cost < 0) throw new Error(`BUSINESS_GOLDEN_BAD_INVENTORY_VALUE:${row.tenant_id}:${row.sku}`);
}
for (const row of fixture.payments) {
  if (!Number.isFinite(row.amount) || row.amount < 0) throw new Error(`BUSINESS_GOLDEN_BAD_PAYMENT_VALUE:${row.id}`);
}
console.log('BUSINESS_GOLDEN_CORPUS_TEMPORAL_VALUE_PASS');
