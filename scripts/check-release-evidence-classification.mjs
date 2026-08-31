import assert from 'node:assert/strict';
const TYPES=new Set(['STATIC','CI','SYNTHETIC RUNTIME','LIVE SQL','AUTHENTICATED LIVE','PRODUCTION']);
const REQUIRED=['id','type','status','sha'];
function validate(e){for(const k of REQUIRED)assert(e?.[k],`${k.toUpperCase()}_REQUIRED`);assert(TYPES.has(e.type),'EVIDENCE_TYPE_INVALID');assert(typeof e.sha==='string'&&e.sha.length===40,'EXACT_SHA_REQUIRED');assert(!(['SYNTHETIC RUNTIME','CI'].includes(e.type)&&e.status==='PRODUCTION_CERTIFIED'),'EVIDENCE_ESCALATION_FORBIDDEN');return true;}
assert.equal(validate({id:'x',type:'CI',status:'PASS',sha:'a'.repeat(40)}),true);
assert.throws(()=>validate({id:'x',type:'UNKNOWN',status:'PASS',sha:'a'.repeat(40)}),/EVIDENCE_TYPE_INVALID/);
assert.throws(()=>validate({id:'x',type:'CI',status:'PASS',sha:'short'}),/EXACT_SHA_REQUIRED/);
assert.throws(()=>validate({id:'x',type:'SYNTHETIC RUNTIME',status:'PRODUCTION_CERTIFIED',sha:'a'.repeat(40)}),/EVIDENCE_ESCALATION_FORBIDDEN/);
console.log('release evidence classification: PASS');
