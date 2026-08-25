import assert from 'node:assert/strict';

const STATES = new Set(['LIVE', 'FOUNDATION', 'UNKNOWN', 'BLOCKED', 'ERROR', 'EMPTY', 'LOADING']);
const TRUST_DIMENSIONS = ['data','extraction','mapping','entity','validation','calculation','forecast','decision'];

function trustSummary(input) {
  const dimensions = Object.fromEntries(TRUST_DIMENSIONS.map((key) => [key, input?.[key] ?? 'UNKNOWN']));
  const known = Object.values(dimensions).filter((v) => v !== 'UNKNOWN');
  return { dimensions, overall: known.length === TRUST_DIMENSIONS.length ? 'CALCULATED' : 'PARTIAL' };
}

function evidenceState(ref) {
  if (ref?.status && STATES.has(ref.status)) return ref.status;
  if (ref?.sourceId || ref?.evidenceId || ref?.lineageId) return 'LIVE';
  return 'UNKNOWN';
}

assert.equal(evidenceState({ sourceId: 's1' }), 'LIVE');
assert.equal(evidenceState({}), 'UNKNOWN');
assert.equal(evidenceState({ status: 'BLOCKED', sourceId: 's1' }), 'BLOCKED');
assert.equal(evidenceState({ status: 'ERROR' }), 'ERROR');
const partial = trustSummary({ data: 'HIGH', calculation: 'HIGH' });
assert.equal(partial.overall, 'PARTIAL');
assert.equal(Object.keys(partial.dimensions).length, 8);
const full = trustSummary(Object.fromEntries(TRUST_DIMENSIONS.map((k) => [k, 'HIGH'])));
assert.equal(full.overall, 'CALCULATED');
console.log('secondary-batch10: PASS — 7/7 contract assertions');
