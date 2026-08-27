import { classifyABCXYZ } from '../src/lib/free-toolbox/abc-xyz.ts';

const classified = classifyABCXYZ([
  { sku: 'A', annualValue: 100, demand: [10, 12, 8] },
  { sku: 'B', annualValue: 25, demand: [5, 5, 5] },
]);
if (classified.length !== 2) throw new Error('expected two classifications');
if (classified[0].sku !== 'A' || classified[0].abc !== 'A') throw new Error('annual-value ordering/classification regression');
if (!classified.every(x => Number.isFinite(x.annualValue))) throw new Error('classified annualValue must remain finite');

for (const annualValue of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
  let rejected = false;
  try { classifyABCXYZ([{ sku: 'BAD', annualValue, demand: [1, 2, 3] }]); } catch (error) {
    rejected = error instanceof RangeError;
  }
  if (!rejected) throw new Error(`non-finite annualValue was accepted: ${annualValue}`);
}

let rejectedDemand = false;
try { classifyABCXYZ([{ sku: 'BAD-DEMAND', annualValue: 10, demand: [1, Number.NaN] }]); } catch (error) {
  rejectedDemand = error instanceof RangeError;
}
if (!rejectedDemand) throw new Error('non-finite demand was accepted');

console.log('ABC/XYZ runtime truth regression: PASS');
