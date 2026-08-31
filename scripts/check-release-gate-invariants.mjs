import assert from 'node:assert/strict';

const DOMAINS=['tenant','document','decision','security','performance','reliability','dr','e2e'];
const LIVE=['AUTHENTICATED LIVE','PRODUCTION'];
function gate(m){
  assert(m.exact_sha,'EXACT_SHA_REQUIRED');
  for(const d of DOMAINS){const x=m[d];assert(x?.status==='PASS',`${d.toUpperCase()}_NOT_PASS`);assert(x.evidence_id,`${d.toUpperCase()}_EVIDENCE_REQUIRED`);}
  const live=DOMAINS.every(d=>LIVE.includes(m[d].type));
  const prod=DOMAINS.every(d=>m[d].type==='PRODUCTION');
  return {repository:true,authenticated_live:live,production:prod};
}
const base=Object.fromEntries(DOMAINS.map(d=>[d,{status:'PASS',type:'SYNTHETIC RUNTIME',evidence_id:`e-${d}`} ]));
assert.deepEqual(gate({...base,exact_sha:'sha'}),{repository:true,authenticated_live:false,production:false});
assert.throws(()=>gate({...base,exact_sha:''}),/EXACT_SHA_REQUIRED/);
assert.throws(()=>gate({...base,exact_sha:'sha',e2e:{status:'BLOCKED',type:'SYNTHETIC RUNTIME',evidence_id:'e'}}),/E2E_NOT_PASS/);
assert.throws(()=>gate({...base,exact_sha:'sha',dr:{status:'PASS',type:'SYNTHETIC RUNTIME'}}),/DR_EVIDENCE_REQUIRED/);
const live=Object.fromEntries(DOMAINS.map(d=>[d,{status:'PASS',type:'AUTHENTICATED LIVE',evidence_id:`l-${d}`} ]));
assert.equal(gate({...live,exact_sha:'live'}).authenticated_live,true);
console.log('release gate invariants: PASS');
