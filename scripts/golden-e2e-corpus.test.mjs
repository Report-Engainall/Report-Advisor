import{strict as assert}from'node:assert';import{getCorpus}from'./golden-e2e-corpus.mjs';

const c=getCorpus();
const allowed=new Set(['PASS','REVIEW','QUARANTINE']);
const requiredGates=['extraction','fidelity','quality','schema','mapping','semantic','arithmetic','reconciliation','evidence'];

assert.equal(c.length,7,'golden corpus size must remain stable');
assert.equal(new Set(c.map(x=>x.id)).size,c.length,'golden corpus IDs must be unique');

for(const x of c){
  assert.ok(allowed.has(x.expect),`invalid corpus disposition: ${x.id}`);
  assert.deepEqual(x.requiredGates,requiredGates,`gate chain drift: ${x.id}`);
  assert.ok(Array.isArray(x.features)&&x.features.length>0,`fixture features missing: ${x.id}`);
}

const byId=Object.fromEntries(c.map(x=>[x.id,x]));
assert.equal(byId['exchange-arabic'].expect,'PASS');
assert.equal(byId['exchange-ocr'].expect,'REVIEW');
assert.equal(byId['unknown-layout'].expect,'REVIEW');
assert.equal(byId['corrupt-extraction'].expect,'QUARANTINE');
assert.equal(byId['arithmetic-mismatch'].expect,'QUARANTINE');
assert.equal(byId['reconciliation-mismatch'].expect,'QUARANTINE');

for(const x of c.filter(x=>x.expect==='QUARANTINE')){
  assert.ok(x.features.some(f=>f.includes('mismatch')||f.includes('no_reliable_extractor')),
    `quarantine fixture lacks an explicit hard-failure feature: ${x.id}`);
}

console.log('Golden E2E corpus tests PASS (fixture identity + disposition + complete gate-chain invariants).');
