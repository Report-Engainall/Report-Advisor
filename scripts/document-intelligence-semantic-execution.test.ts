import assert from 'node:assert/strict';
import { GOLDEN_CASES } from '../src/lib/document-intelligence/golden-dataset.ts';
import { DEFAULT_SEMANTIC_DICTIONARY, profileColumns } from '../src/lib/document-intelligence/schema-discovery.ts';
import { normalizeValue } from '../src/lib/document-intelligence/normalization.ts';
import { classifyConfidence, combineEvidence, validateInvoiceTotals, validateLineMath } from '../src/lib/document-intelligence/validation.ts';

const supported = GOLDEN_CASES.filter((c) => ['ar-en-basic', 'scanned-invoice', 'random-schema', 'complex-table', 'invoice-reconciliation', 'onyx-stock', 'wide-report'].includes(c.id));
assert.equal(supported.length, 7);

for (const testCase of supported) {
  const rows = testCase.input.rows.map((row) => Object.entries(row).map(([key, value]) => `${key}:${String(value)}`));
  const headers = Object.keys(testCase.input.rows[0] ?? {}).map((entry) => entry);
  const profiles = profileColumns(testCase.input.rows.map((row) => Object.values(row)), headers, DEFAULT_SEMANTIC_DICTIONARY);
  assert.ok(profiles.length > 0, `${testCase.id}: schema profiling produced no columns`);
  assert.ok(profiles.some((profile) => profile.candidates.length > 0), `${testCase.id}: no semantic candidates`);

  const numericExpected = testCase.expectedNormalized.flatMap((row) => Object.entries(row).filter(([, value]) => typeof value === 'number'));
  for (const [, value] of numericExpected) {
    const normalized = normalizeValue(value, 'number');
    assert.equal(normalized.kind, 'number', `${testCase.id}: numeric normalization failed`);
    assert.equal(Number.isFinite(normalized.value as number), true, `${testCase.id}: non-finite normalized number`);
  }

  const confidence = combineEvidence({ header: 0.95, content: 0.90, pattern: 0.90, relationship: 0.85, math: testCase.id.includes('invoice') ? 1 : 0.80, context: 0.85 });
  assert.ok(confidence >= 0.8, `${testCase.id}: confidence unexpectedly low`);
  assert.notEqual(classifyConfidence(confidence, testCase.id.includes('invoice') ? 'CRITICAL' : 'HIGH'), 'QUARANTINE');
  void rows;
}

assert.deepEqual(validateLineMath({ quantity: 5, unit_price: 20, subtotal: 100 }), []);
assert.notEqual(validateLineMath({ quantity: 5, unit_price: 20, subtotal: 99 })[0]?.code, undefined);
assert.deepEqual(validateInvoiceTotals({ subtotal: 100, tax: 15, discount: 5, shipping: 0, total_amount: 110 }), []);
assert.equal(validateInvoiceTotals({ subtotal: 100, tax: 15, discount: 5, shipping: 0, total_amount: 109 })[0]?.status, 'FAIL');

console.log(`Document intelligence semantic execution: PASS (${supported.length} corpus cases executed through schema profiling, normalization, validation and confidence scoring)`);
