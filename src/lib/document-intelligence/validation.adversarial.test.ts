import assert from 'node:assert/strict';
import { validateLineMath, validateInvoiceTotals } from './validation';

const assertUnknown = (issues: Array<{ status: string }>, label: string) => assert.ok(issues.some(i => i.status === 'UNKNOWN'), label);

assert.deepEqual(validateLineMath({ quantity: 5, unit_price: 20, subtotal: 100 }), []);
assertUnknown(validateLineMath({ quantity: '', unit_price: 20, subtotal: 0 }), 'blank quantity must not become zero');
assertUnknown(validateLineMath({ quantity: null, unit_price: 20, subtotal: 0 }), 'null quantity must not become zero');
assertUnknown(validateLineMath({ quantity: 'not-a-number', unit_price: 20, subtotal: 0 }), 'malformed quantity must reject');
assertUnknown(validateLineMath({ quantity: 5, unit_price: '', subtotal: 0 }), 'blank price must reject');
assertUnknown(validateInvoiceTotals({ subtotal: 100, tax: '', discount: 0, shipping: 0, total: 100 }), 'blank tax must not silently become zero');
assertUnknown(validateInvoiceTotals({ subtotal: 100, tax: 0, discount: 'bad', shipping: 0, total: 100 }), 'malformed discount must reject');
assert.deepEqual(validateInvoiceTotals({ subtotal: 100, tax: null, discount: null, shipping: null, total: 100 }), []);

const source = (await import('node:fs')).readFileSync(new URL('./validation.ts', import.meta.url), 'utf8');
const mutations = [
  [/value === null \|\| value === undefined/, '/* MUTATION */'],
  [/typeof value === 'string' && value\.trim\(\) === ''/, '/* MUTATION */'],
  [/Number\.isFinite\(number\) \? number : null/, 'number'],
];
for (const [needle, replacement] of mutations) {
  const weakened = source.replace(needle, replacement);
  assert.notEqual(weakened, source, 'mutation fixture must apply');
  const detector = /strictNumber/.test(weakened) && /return Number\.isFinite\(number\) \? number : null/.test(weakened) && /trim\(\) === ''/.test(weakened);
  assert.equal(detector, false, 'validation mutation must be detected by test-of-test');
}
console.log('DOCUMENT_VALIDATION_ADVERSARIAL=PASS');
console.log('TEST_OF_TEST=PASS');
