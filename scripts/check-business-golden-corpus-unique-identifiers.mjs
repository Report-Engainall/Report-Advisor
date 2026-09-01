import fs from 'node:fs';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
for (const collection of ['products', 'customers', 'suppliers', 'sales', 'purchases', 'payments']) {
  const ids = fixture[collection].map((row) => row.id);
  if (new Set(ids).size !== ids.length) throw new Error(`BUSINESS_GOLDEN_DUPLICATE_ID:${collection}`);
}
const inventoryKeys = fixture.inventory.map((row) => `${row.tenant_id}:${row.sku}`);
if (new Set(inventoryKeys).size !== inventoryKeys.length) throw new Error('BUSINESS_GOLDEN_DUPLICATE_INVENTORY_KEY');
const productKeys = fixture.products.map((row) => `${row.tenant_id}:${row.sku}`);
if (new Set(productKeys).size !== productKeys.length) throw new Error('BUSINESS_GOLDEN_DUPLICATE_PRODUCT_KEY');
console.log('BUSINESS_GOLDEN_CORPUS_UNIQUE_IDENTIFIERS_PASS');
