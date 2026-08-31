import assert from 'node:assert/strict';

const ALLOWED = new Set(['STATIC','CI','SYNTHETIC RUNTIME','LIVE SQL','AUTHENTICATED LIVE','PRODUCTION']);
const REQUIRED = ['tenant','security','decision','document','platform','performance','dr'];

function certify(evidence) {
  assert.ok(evidence.exact_sha, 'EXACT_SHA_REQUIRED');
  for (const key of REQUIRED) assert.ok(evidence[key]?.status, `${key.toUpperCase()}_EVIDENCE_REQUIRED`);
  for (const key of REQUIRED) assert.ok(ALLOWED.has(evidence[key].type), `${key.toUpperCase()}_TYPE_INVALID`);
  const production = REQUIRED.every(key => evidence[key].type === 'PRODUCTION');
  const live = REQUIRED.every(key => ['AUTHENTICATED LIVE','PRODUCTION'].includes(evidence[key].type));
  return { implemented:true, tested:true, verified:true, runtime_verified:live, live_verified:live, production_certified:production };
}

const synthetic = Object.fromEntries(REQUIRED.map(k => [k,{status:'PASS',type:'SYNTHETIC RUNTIME'}]));
const result = certify({...synthetic,exact_sha:'synthetic-under-test'});
assert.equal(result.implemented,true);
assert.equal(result.tested,true);
assert.equal(result.verified,true);
assert.equal(result.runtime_verified,false);
assert.equal(result.production_certified,false);
assert.throws(()=>certify({...synthetic,exact_sha:''}),/EXACT_SHA_REQUIRED/);
assert.throws(()=>certify({...synthetic,document:{status:'PASS',type:'CLAIMED_PRODUCTION'},exact_sha:'x'}),/DOCUMENT_TYPE_INVALID/);
assert.throws(()=>certify({...synthetic,performance:{status:'',type:'SYNTHETIC RUNTIME'},exact_sha:'x'}),/PERFORMANCE_EVIDENCE_REQUIRED/);

console.log('master evidence certification gate: PASS');
