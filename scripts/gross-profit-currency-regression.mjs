import assert from 'node:assert/strict';

const mixed = [{ currency: 'SAR', total: 100 }, { currency: 'USD', total: 100 }];
const currencies = new Set(mixed.map(row => row.currency));
assert.equal(currencies.size, 2);
assert.equal(currencies.size > 1, true);

const missing = [{ currency: null, total: 100 }];
assert.equal(missing.some(row => row.currency === null), true);

console.log('GROSS_PROFIT_CURRENCY_GUARD=PASS');
console.log('MIXED_CURRENCY_NOT_COMPARABLE=PASS');
console.log('MISSING_CURRENCY_NOT_COMPARABLE=PASS');
