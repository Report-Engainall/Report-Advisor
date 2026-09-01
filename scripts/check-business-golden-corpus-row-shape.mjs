import fs from 'node:fs';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
const required = {
  products: ['id', 'tenant_id', 'sku', 'name', 'unit', 'cost', 'price'],
  customers: ['id', 'tenant_id', 'name'],
  suppliers: ['id', 'tenant_id', 'name'],
  sales: ['id', 'tenant_id', 'customer_id', 'date', 'sku', 'qty', 'unit_price', 'gross', 'return'],
  purchases: ['id', 'tenant_id', 'supplier_id', 'date', 'sku', 'qty', 'unit_cost', 'total'],
  inventory: ['tenant_id', 'sku', 'qty', 'unit_cost'],
  payments: ['id', 'tenant_id', 'customer_id', 'amount', 'date'],
};
for (const [collection, fields] of Object.entries(required)) {
  if (!Array.isArray(fixture[collection]) || fixture[collection].length === 0) throw new Error(`BUSINESS_GOLDEN_ROW_SHAPE_EMPTY:${collection}`);
  for (const [index, row] of fixture[collection].entries()) {
    for (const field of fields) if (!(field in row)) throw new Error(`BUSINESS_GOLDEN_ROW_SHAPE_MISSING:${collection}:${index}:${field}`);
  }
}
console.log('BUSINESS_GOLDEN_CORPUS_ROW_SHAPE_PASS');
