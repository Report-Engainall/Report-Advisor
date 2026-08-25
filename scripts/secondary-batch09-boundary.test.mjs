import assert from 'node:assert/strict';

function normalizeEvidence(ref) {
  if (!ref || typeof ref !== 'object') return { status: 'UNKNOWN' };
  const hasAuthoritativeId = Boolean(ref.sourceId || ref.evidenceId || ref.lineageId);
  if (ref.status === 'BLOCKED') return { ...ref, status: 'BLOCKED' };
  if (!hasAuthoritativeId) return { ...ref, status: 'UNKNOWN' };
  return { ...ref, status: ref.status ?? 'LIVE' };
}

function boundedLimit(limit, fallback = 20) {
  if (!Number.isInteger(limit) || limit < 1) return fallback;
  return Math.min(limit, 100);
}

assert.deepEqual(normalizeEvidence({ status: 'LIVE' }), { status: 'UNKNOWN' });
assert.equal(normalizeEvidence({ sourceId: 'src-1', status: 'LIVE' }).status, 'LIVE');
assert.equal(normalizeEvidence({ status: 'BLOCKED' }).status, 'BLOCKED');
assert.equal(boundedLimit(undefined), 20);
assert.equal(boundedLimit(1000), 100);
assert.equal(boundedLimit(7), 7);

console.log('secondary-batch09: PASS — 6/6 boundary assertions');
