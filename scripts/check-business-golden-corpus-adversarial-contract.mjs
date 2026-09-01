import fs from 'node:fs';
import assert from 'node:assert/strict';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
const adversarial = fixture.adversarial;
assert.equal(adversarial.cross_tenant_customer_on_sale.expected, 'REJECT');
assert.equal(adversarial.cross_tenant_product_on_purchase.expected, 'REJECT');
for (const [name, item] of Object.entries(adversarial)) {
  assert.ok(item.expected, `missing expected outcome: ${name}`);
  assert.equal(item.expected, 'REJECT', `cross-tenant adversarial case must fail closed: ${name}`);
}
console.log('BUSINESS_GOLDEN_CORPUS_ADVERSARIAL_PASS');
