import fs from 'node:fs';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
const products = new Map(fixture.products.map((row) => [`${row.tenant_id}:${row.sku}`, row]));
for (const [tenantId, truth] of Object.entries(fixture.expected_truth).filter(([key]) => key !== 'isolation')) {
  const cogs = fixture.sales.filter((row) => row.tenant_id === tenantId).reduce((sum, row) => {
    const product = products.get(`${tenantId}:${row.sku}`);
    if (!product) throw new Error(`BUSINESS_GOLDEN_COGS_PRODUCT_MISSING:${tenantId}:${row.sku}`);
    return sum + row.qty * product.cost;
  }, 0);
  if (truth.estimated_cogs !== cogs) throw new Error(`BUSINESS_GOLDEN_COGS_MISMATCH:${tenantId}:${truth.estimated_cogs}!=${cogs}`);
}
console.log('BUSINESS_GOLDEN_CORPUS_COGS_PASS');
