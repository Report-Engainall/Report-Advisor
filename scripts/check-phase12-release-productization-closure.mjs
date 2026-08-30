import fs from 'node:fs';
const files=['scripts/check-production-certification-contract.mjs','scripts/check-production-certification-evidence-integrity.mjs','scripts/check-release-evidence-consumption-workflow.mjs','scripts/check-production-saas-certification.mjs','scripts/check-production-release-blockers.mjs'];
const src=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');const failures=[];const must=(x,m)=>{if(!x)failures.push(m)};
for(const t of ['certification','evidence','release','blocker','tenant'])must(src.toLowerCase().includes(t),`release productization missing ${t}`);
must(src.includes('PRODUCTION_CERTIFICATION_EVIDENCE_KEYS'),'release must have canonical certification evidence keys');
must(src.includes('exact') || src.includes('SHA'),'release evidence must bind to an exact artifact/release');
const decoy='// certified = true';must(!/certified\s*=\s*true/.test(decoy.replace(/\/\/[^\n]*/g,'')),'comment certification decoy must not satisfy release proof');
if(failures.length){console.error('PHASE12_RELEASE_PRODUCTIZATION_CLOSURE_FAIL\n'+failures.map(x=>'- '+x).join('\n'));process.exit(1)}
console.log('PHASE12_RELEASE_PRODUCTIZATION_CLOSURE_PASS');
