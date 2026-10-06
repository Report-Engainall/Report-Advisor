import assert from 'node:assert/strict';
import { runCalculationRegistry } from '../src/lib/report-intelligence/calculation-capability-registry.ts';

const rows = [
  { row_number: 1, data: { amount: 10, customerCode: 'A', note: '' } },
  { row_number: 2, data: { amount: 20, customerCode: 'B', note: 'ok' } },
];

const results = runCalculationRegistry({ rows, includeUnavailable: true });
const completeness = results.find((result) => result.metricId === 'data.completeness');

assert.ok(completeness, 'DATA_COMPLETENESS_RESULT_MISSING');
assert.equal(completeness.availabilityState, 'CALCULATED');
assert.equal(completeness.sampleSize, rows.length);
assert.ok(
  completeness.usableSample >= 0 && completeness.usableSample <= completeness.sampleSize,
  'DATA_COMPLETENESS_USABLE_SAMPLE_MUST_BE_ROW_BOUNDED',
);
assert.equal(completeness.value, 83.33);
assert.equal(completeness.details?.cells, 6);
assert.equal(completeness.details?.missingCells, 1);
assert.equal(completeness.details?.usableRows, 2);

console.log('CALCULATION_CAPABILITY_REGISTRY_CONTRACT_PASS');
