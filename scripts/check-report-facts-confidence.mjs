import assert from 'node:assert/strict';
const bounded = (v) => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
assert.equal(bounded(1), 1);
assert.equal(bounded(0.7), 0.7);
assert.equal(bounded(2), 1);
assert.equal(bounded(-1), 0);
assert.equal(bounded(Number.NaN), 0);
assert.equal(bounded(Number.POSITIVE_INFINITY), 0);
console.log('report facts confidence contract: PASS');
