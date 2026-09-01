import assert from 'node:assert/strict';

const score = (expected, results) => {
  if (!Array.isArray(expected) || !Array.isArray(results)) throw new Error('golden evidence inputs must be arrays');
  if (expected.some(id => typeof id !== 'string' || !id.trim())) throw new Error('golden evidence expected IDs must be non-empty strings');
  if (new Set(expected).size !== expected.length) throw new Error('golden evidence expected IDs must be unique');
  const ids = new Set(expected);
  const valid = new Set();
  for (const r of results) {
    if (!r || typeof r.id !== 'string' || typeof r.passed !== 'boolean') continue;
    if (ids.has(r.id)) valid.add(r.id);
  }
  const passed = expected.filter(id => results.some(r => r?.id === id && r?.passed === true)).length;
  return { complete: valid.size === ids.size, passed, total: ids.size };
};

assert.deepEqual(score(['a','b'], [{id:'a',passed:true},{id:'b',passed:true}]), {complete:true,passed:2,total:2});
assert.deepEqual(score(['a','b'], [{id:'a',passed:true},{id:'a',passed:true}]), {complete:false,passed:1,total:2});
assert.deepEqual(score(['a','b'], [{id:'a',passed:true},{id:'b',passed:false}]), {complete:true,passed:1,total:2});
assert.deepEqual(score(['a','b'], [{id:'a',passed:1},{id:'b',passed:true}]), {complete:false,passed:1,total:2});
assert.deepEqual(score(['a','b'], [{id:'a',passed:true},null,{id:'b',passed:false}]), {complete:true,passed:1,total:2});
assert.throws(() => score(['a',''], []), /expected IDs/);
assert.throws(() => score(['a','a'], []), /unique/);
assert.throws(() => score(['a'], null), /arrays/);
console.log('golden evidence completeness contract: PASS');
