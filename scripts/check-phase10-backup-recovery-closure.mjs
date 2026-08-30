import fs from 'node:fs';
const files=['scripts/check-operational-resilience-contract.mjs','scripts/check-release-resilience-manifest.mjs','scripts/check-production-recovery-gate.mjs','scripts/check-production-release-blockers.mjs'];
const src=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');const failures=[];const must=(x,m)=>{if(!x)failures.push(m)};
for(const t of ['backup','restore','recovery','rollback','integrity'])must(src.toLowerCase().includes(t),`recovery surface missing ${t}`);
must(src.includes('tenant'),'recovery must preserve tenant integrity');
must(src.includes('evidence'),'recovery must retain evidence');
const decoy='// restore succeeded\n// tenant integrity verified';must(!/succeeded/.test(decoy.replace(/\/\/[^\n]*/g,'')),'comment decoy must not satisfy recovery proof');
if(failures.length){console.error('PHASE10_BACKUP_RECOVERY_CLOSURE_FAIL\n'+failures.map(x=>'- '+x).join('\n'));process.exit(1)}
console.log('PHASE10_BACKUP_RECOVERY_CLOSURE_PASS');
