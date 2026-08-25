import assert from 'node:assert/strict';

const clamp = (value) => {
  if (value == null || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(1, value));
};

const statusFromIds = (link) => {
  if (link.status !== 'LIVE') return link.status;
  return link.sourceId || link.evidenceId ? 'LIVE' : 'UNKNOWN';
};

assert.equal(clamp(2), 1);
assert.equal(clamp(-1), 0);
assert.equal(clamp(Number.NaN), undefined);
assert.equal(statusFromIds({ status: 'LIVE' }), 'UNKNOWN');
assert.equal(statusFromIds({ status: 'LIVE', sourceId: 'src-1' }), 'LIVE');
assert.equal(statusFromIds({ status: 'BLOCKED', sourceId: 'src-1' }), 'BLOCKED');

console.log('secondary-batch08: PASS — 6/6 contract assertions');
