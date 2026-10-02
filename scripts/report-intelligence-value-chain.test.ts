import assert from 'node:assert/strict';
import { deriveReportIntelligence } from '../src/lib/report-intelligence/report-smart-insights.ts';

const result = deriveReportIntelligence({
  specialty: 'inventory',
  rowCount: 4,
  sourceAnalysis: {
    datasets: [{
      columns: [
        { name: 'رقم الصنف', mappedField: 'sku' },
        { name: 'السعر', mappedField: 'price' },
        { name: 'المخزن', mappedField: 'warehouse' },
      ],
    }],
  },
  renderedOutput: {},
  canonicalRows: [
    { row_number: 1, data: { sku: 'A1', price: 10, warehouse: 'W1' } },
    { row_number: 2, data: { sku: 'A1', price: 12, warehouse: 'W1' } },
    { row_number: 3, data: { sku: 'A2', price: 7, warehouse: 'W1' } },
    { row_number: 4, data: { sku: 'A3', price: 8, warehouse: 'W2' } },
  ],
});

const signal = result.signals.find((item) => item.id === 'inventory:price-variation');
assert.ok(signal, 'price variation signal must exist');
assert.ok(signal.soWhat.length > 0, 'signal must explain SO WHAT');
assert.ok(signal.impact.length > 0, 'signal must expose bounded impact');
assert.ok(signal.ownerHint.length > 0, 'signal must expose owner hint');

const recommendation = result.recommendations.find((item) => item.id === 'rec:inventory:price-variation');
assert.ok(recommendation, 'recommendation must be linked to signal');
assert.equal(recommendation?.ownerHint, signal.ownerHint);
assert.ok(recommendation?.expectedOutcome.length, 'recommendation must define expected outcome');
assert.ok(recommendation?.evidence.length, 'recommendation must retain evidence');

console.log('PASS: advisor value chain exposes WHY → SO WHAT → IMPACT → OWNER → EXPECTED OUTCOME with source evidence.');
