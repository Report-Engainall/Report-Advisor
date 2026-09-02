import assert from 'node:assert/strict';

function score(expectedIds, results) {
  const expected = new Set(expectedIds.filter((id) => typeof id === 'string' && id.length > 0));
  const seen = new Set(); let passed = 0;
  for (const result of results) {
    if (!result || typeof result.id !== 'string' || typeof result.passed !== 'boolean') continue;
    if (!expected.has(result.id) || seen.has(result.id)) continue;
    seen.add(result.id);
    if (result.passed) passed++;
  }
  const cases = expected.size; const accuracy = cases ? passed / cases : 0;
  return { cases, passed, failed: cases - passed, accuracy, ready: cases > 0 && seen.size === cases && accuracy >= 0.95 };
}

const ids = ['a', 'b', 'c', 'd'];
assert.equal(score(ids, [{id:'a',passed:true},{id:'b',passed:true},{id:'c',passed:true},{id:'d',passed:true}]).ready, true);
assert.equal(score(ids, [{id:'a',passed:true},{id:'a',passed:true},{id:'b',passed:true},{id:'c',passed:true}]).ready, false);
assert.equal(score(ids, [{id:'a',passed:true},{id:'b',passed:true},{id:'c',passed:true},{id:'d',passed:false}]).ready, false);
assert.equal(score(ids, [{id:'a',passed:true},{id:'b',passed:true},{id:'c',passed:true},{id:'d',passed:true},{id:'x',passed:true}]).ready, true);
assert.equal(score(ids, [{id:'a',passed:1},{id:'b',passed:true},{id:'c',passed:true},{id:'d',passed:true}]).ready, false);
assert.equal(score(['a', '', null], [{id:'a',passed:true}]).ready, true);
assert.equal(score([], []).ready, false);
console.log('golden score identity contract: PASS');
