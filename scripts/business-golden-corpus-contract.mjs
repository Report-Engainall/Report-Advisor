import fs from 'node:fs';
import assert from 'node:assert/strict';
const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
assert.equal(fixture.kind, 'synthetic');
assert.ok(Array.isArray(fixture.tenants));
assert.equal(fixture.tenants.length, 2);
assert.deepEqual(fixture.tenants.map((tenant) => tenant.id).sort(), ['tenant-a', 'tenant-b']);
assert.ok(fixture.expected_truth && typeof fixture.expected_truth === 'object');
for (const tenantId of ['tenant-a', 'tenant-b']) {
  const truth = fixture.expected_truth[tenantId];
  assert.ok(truth && typeof truth === 'object');
  for (const field of ['net_sales', 'inventory_value', 'receivables']) assert.equal(typeof truth[field], 'number');
  assert.ok(Array.isArray(truth.zero_stock_skus));
}
assert.equal(fixture.expected_truth['tenant-a'].net_sales, 1100);
assert.equal(fixture.expected_truth['tenant-a'].inventory_value, 200);
assert.equal(fixture.expected_truth['tenant-a'].receivables, 800);
assert.equal(fixture.expected_truth['tenant-b'].net_sales, 640);
assert.equal(fixture.expected_truth['tenant-b'].inventory_value, 110);
assert.equal(fixture.adversarial.cross_tenant_customer_on_sale.expected, 'REJECT');
assert.equal(fixture.adversarial.cross_tenant_product_on_purchase.expected, 'REJECT');
assert.ok(!fixture.expected_truth['tenant-a'].zero_stock_skus.includes('A-001'));
assert.ok(fixture.expected_truth['tenant-a'].zero_stock_skus.includes('A-002'));
console.log('business golden corpus contract: PASS');
