import assert from 'node:assert/strict';

const normalize = (confidence) => typeof confidence === 'number' && Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0;
const usable = (confidence, text) => normalize(confidence) >= 0.7 && typeof text === 'string' && text.trim().length > 0;

assert.equal(usable(0.9, 'فاتورة 123'), true);
assert.equal(usable(0.69, 'فاتورة 123'), false);
assert.equal(usable(0.7, 'فاتورة 123'), true);
assert.equal(usable(Number.NaN, 'فاتورة 123'), false);
assert.equal(usable(Number.POSITIVE_INFINITY, 'فاتورة 123'), false);
assert.equal(usable(Number.NEGATIVE_INFINITY, 'فاتورة 123'), false);
assert.equal(usable(-0.1, 'فاتورة 123'), false);
assert.equal(usable(2, 'فاتورة 123'), true);
assert.equal(usable('0.9', 'فاتورة 123'), false);
assert.equal(usable(0.9, '   '), false);
assert.equal(usable(0.9, '\u2003\u2003'), false);
assert.equal(usable(0.9, null), false);
console.log('OCR confidence contract: PASS');
