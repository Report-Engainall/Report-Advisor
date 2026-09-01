import fs from 'node:fs';
import assert from 'node:assert/strict';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/business-golden/cycle-004.json', 'utf8'));
const adversarial = fixture.adversarial;
assert.equal(adversarial.cross_tenant_customer_on_sale.expected, 'REJECT');
assert.equal(adversarial.cross_tenant_product_on_purchase.expected, 'REJECT');
assert.equal(adversarial.null_quantity.expected, 'REJECT_OR_QUARANTINE_NOT_ZERO');
assert.equal(adversarial.duplicate_sale_id, 'a-sale-1');
assert.equal(adversarial.revised_sale_id, 'a-sale-2');
console.log('BUSINESS_GOLDEN_CORPUS_ADVERSARIAL_PASS');
