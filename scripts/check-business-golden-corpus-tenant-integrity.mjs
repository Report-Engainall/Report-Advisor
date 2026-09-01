import fs from 'node:fs';
import assert from 'node:assert/strict';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
const tenantIds = fixture.tenants.map((tenant) => tenant.id);
assert.equal(new Set(tenantIds).size, tenantIds.length);
assert.ok(tenantIds.includes('tenant-a'));
assert.ok(tenantIds.includes('tenant-b'));
for (const tenantId of tenantIds) {
  const truth = fixture.expected_truth[tenantId];
  assert.ok(truth, `missing expected truth for ${tenantId}`);
  for (const key of ['net_sales', 'inventory_value', 'receivables', 'zero_stock_skus']) assert.ok(key in truth, `${tenantId}:${key}`);
}
console.log('BUSINESS_GOLDEN_CORPUS_TENANT_INTEGRITY_PASS');
