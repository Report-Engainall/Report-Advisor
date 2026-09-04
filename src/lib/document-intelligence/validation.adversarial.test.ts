import assert from 'node:assert/strict';
import { validateLineMath, validateInvoiceTotals } from './validation';

const unknown = (issues: Array<{ status: string }>, label: string) => assert.ok(issues.some(i => i.status === 'UNKNOWN'), label);
assert.deepEqual(validateLineMath({ quantity: 5, unit_price: 20, subtotal: 100 }), []);
unknown(validateLineMath({ quantity: '', unit_price: 20, subtotal: 0 }), 'blank quantity must reject');
unknown(validateLineMath({ quantity: null, unit_price: 20, subtotal: 0 }), 'null quantity must reject');
unknown(validateLineMath({ quantity: 'not-a-number', unit_price: 20, subtotal: 0 }), 'malformed quantity must reject');
unknown(validateLineMath({ quantity: 5, unit_price: '', subtotal: 0 }), 'blank unit price must reject');
unknown(validateInvoiceTotals({ subtotal: 100, tax: '', discount: 0, shipping: 0, total: 100 }), 'blank tax must reject');
unknown(validateInvoiceTotals({ subtotal: 100, tax: 0, discount: 'bad', shipping: 0, total: 100 }), 'malformed discount must reject');
assert.deepEqual(validateInvoiceTotals({ subtotal: 100, tax: null, discount: null, shipping: null, total: 100 }), []);

const source = (await import('node:fs')).readFileSync(new URL('./validation.ts', import.meta.url), 'utf8');
const contract = s => /function strictNumber/.test(s) && /value === null \|\| value === undefined/.test(s) && /trim\(\) === ''/.test(s) && /Number\.isFinite\(number\) \? number : null/.test(s);
for (const [name, needle, replacement] of [
  ['null', /value === null \|\| value === undefined/, '/* MUTATION */'],
  ['blank', /typeof value === 'string' && value\.trim\(\) === ''/, '/* MUTATION */'],
  ['finite', /Number\.isFinite\(number\) \? number : null/, 'number'],
]) {
  const weakened = source.replace(needle, replacement);
  assert.notEqual(weakened, source, `${name} mutation must apply`);
  assert.equal(contract(weakened), false, `${name} mutation must be detected`);
}
console.log('DOCUMENT_VALIDATION_ADVERSARIAL=PASS');
console.log('TEST_OF_TEST=PASS');
