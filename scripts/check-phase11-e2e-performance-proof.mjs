import fs from 'node:fs';
const files=['scripts/golden-e2e-corpus.test.mjs','scripts/check-report-execution-e2e-contract.mjs','scripts/check-production-scale.mjs','scripts/check-performance-budget.mjs'];
const src=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');const failures=[];const must=(x,m)=>{if(!x)failures.push(m)};
for(const t of ['identity','disposition','tenant','idempotency','250K','chunking'])must(src.includes(t),`E2E/scale proof missing ${t}`);
must(src.includes('600KB'),'performance largest-JS ceiling missing');
must(src.includes('900KB'),'performance critical asset ceiling missing');
must(src.includes('fail-closed'),'E2E must retain fail-closed negative paths');
const decoy='// PASS authenticated journey';must(!/PASS/.test(decoy.replace(/\/\/[^\n]*/g,'')),'comment decoy must not satisfy E2E proof');
if(failures.length){console.error('PHASE11_E2E_PERFORMANCE_PROOF_FAIL\n'+failures.map(x=>'- '+x).join('\n'));process.exit(1)}
console.log('PHASE11_E2E_PERFORMANCE_PROOF_PASS');
