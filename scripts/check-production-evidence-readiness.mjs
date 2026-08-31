import assert from 'node:assert/strict';

const REQUIRED = ['tenant','security','decision','document','performance','dr'];
const LIVE = new Set(['AUTHENTICATED LIVE','PRODUCTION']);
function evaluate(e) {
  assert(e.exact_sha, 'EXACT_SHA_REQUIRED');
  for (const k of REQUIRED) assert(e[k]?.status === 'PASS', `${k.toUpperCase()}_NOT_PASS`);
  return { repository_ready:true, live_ready:REQUIRED.every(k => LIVE.has(e[k].type)), production_ready:REQUIRED.every(k => e[k].type === 'PRODUCTION') };
}
const synthetic = Object.fromEntries(REQUIRED.map(k=>[k,{status:'PASS',type:'SYNTHETIC RUNTIME'}]));
assert.deepEqual(evaluate({...synthetic,exact_sha:'sha'}),{repository_ready:true,live_ready:false,production_ready:false});
assert.throws(()=>evaluate({...synthetic,exact_sha:''}),/EXACT_SHA_REQUIRED/);
assert.throws(()=>evaluate({...synthetic,exact_sha:'sha',security:{status:'BLOCKED',type:'SYNTHETIC RUNTIME'}}),/SECURITY_NOT_PASS/);
console.log('production evidence readiness gate: PASS');
