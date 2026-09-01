import fs from 'node:fs';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
for (const [tenantId, truth] of Object.entries(fixture.expected_truth).filter(([key]) => key !== 'isolation')) {
  const actual = fixture.inventory.filter((row) => row.tenant_id === tenantId && row.qty === 0).map((row) => row.sku).sort();
  const expected = [...truth.zero_stock_skus].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`BUSINESS_GOLDEN_ZERO_STOCK_MISMATCH:${tenantId}`);
}
console.log('BUSINESS_GOLDEN_CORPUS_ZERO_STOCK_PASS');
