import assert from 'node:assert/strict';
import { buildAgingBuckets, cashConversionCycle } from '../src/lib/businessIntelligenceEngines.ts';

const asOf = new Date('2026-08-26T00:00:00Z');
const buckets = buildAgingBuckets([
  { amount: 100, dueDate: null },
  { amount: 200, dueDate: '2026-08-01T00:00:00Z' },
  { amount: 300, dueDate: '2026-05-01T00:00:00Z' },
], asOf);

assert.equal(buckets.find(b => b.label === 'UNDATED')?.amount, 100);
assert.equal(buckets.find(b => b.label === 'UNDATED')?.count, 1);
assert.equal(buckets.find(b => b.label === '0-30')?.amount, 200);
assert.equal(buckets.find(b => b.label === '91-180')?.amount, 300);
assert.equal(buckets.slice(0, 5).reduce((sum, b) => sum + b.amount, 0), 500);

const invalidDate = buildAgingBuckets([{ amount: 75, dueDate: 'not-a-date' }], asOf);
assert.equal(invalidDate.find(b => b.label === 'UNDATED')?.amount, 75);

const incomplete = cashConversionCycle({
  receivables: 1000,
  revenue: 0,
  inventory: 500,
  costOfSales: 1000,
  payables: 250,
  purchases: 0,
});
assert.equal(incomplete.status, 'INSUFFICIENT_DATA');
assert.equal(incomplete.ccc, null);

console.log('PASS: business intelligence regressions preserve UNKNOWN/UNDATED semantics and fail closed for incomplete CCC inputs.');
