import fs from 'node:fs';
import assert from 'node:assert/strict';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
const truthA = fixture.expected_truth['tenant-a'];
const truthB = fixture.expected_truth['tenant-b'];
for (const [tenant, truth] of [['tenant-a', truthA], ['tenant-b', truthB]]) {
  for (const key of ['net_sales', 'inventory_value', 'receivables']) {
    assert.equal(typeof truth[key], 'number', `${tenant}:${key} must be numeric`);
    assert.ok(Number.isFinite(truth[key]), `${tenant}:${key} must be finite`);
    assert.ok(truth[key] >= 0, `${tenant}:${key} must not be negative`);
  }
  assert.ok(Array.isArray(truth.zero_stock_skus));
}
assert.ok(truthA.zero_stock_skus.includes('A-002'));
assert.ok(!truthA.zero_stock_skus.includes('A-001'));
console.log('BUSINESS_GOLDEN_CORPUS_TRUTH_INVARIANTS_PASS');
