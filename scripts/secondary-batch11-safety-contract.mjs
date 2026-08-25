import assert from 'node:assert/strict';

const TERMINAL = new Set(['BLOCKED', 'ERROR']);
const AUTHORITATIVE_KEYS = ['sourceId', 'evidenceId', 'lineageId'];

function resolveEvidenceState(ref) {
  if (!ref || typeof ref !== 'object') return 'UNKNOWN';
  if (TERMINAL.has(ref.status)) return ref.status;
  if (AUTHORITATIVE_KEYS.some((key) => Boolean(ref[key]))) return 'LIVE';
  return 'UNKNOWN';
}

function safeReference(ref) {
  const status = resolveEvidenceState(ref);
  return {
    status,
    sourceId: status === 'LIVE' ? ref.sourceId ?? null : null,
    evidenceId: status === 'LIVE' ? ref.evidenceId ?? null : null,
    lineageId: status === 'LIVE' ? ref.lineageId ?? null : null,
  };
}

assert.equal(resolveEvidenceState(null), 'UNKNOWN');
assert.equal(resolveEvidenceState({}), 'UNKNOWN');
assert.equal(resolveEvidenceState({ sourceId: 's1' }), 'LIVE');
assert.equal(resolveEvidenceState({ evidenceId: 'e1' }), 'LIVE');
assert.equal(resolveEvidenceState({ lineageId: 'l1' }), 'LIVE');
assert.equal(resolveEvidenceState({ sourceId: 's1', status: 'BLOCKED' }), 'BLOCKED');
assert.equal(resolveEvidenceState({ sourceId: 's1', status: 'ERROR' }), 'ERROR');
const unknown = safeReference({ localId: 'do-not-promote' });
assert.deepEqual(unknown, { status: 'UNKNOWN', sourceId: null, evidenceId: null, lineageId: null });
const live = safeReference({ sourceId: 's1', localId: 'ignored' });
assert.deepEqual(live, { status: 'LIVE', sourceId: 's1', evidenceId: null, lineageId: null });
console.log('secondary-batch11: PASS — 9/9 safety assertions');
