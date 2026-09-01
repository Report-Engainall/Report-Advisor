import {spawnSync} from 'node:child_process';
import process from 'node:process';
const gates=[['production-gate-integrity','node',['scripts/check-production-gate-integrity.mjs']],['typecheck','npm',['run','typecheck','--silent']],['build','npm',['run','build','--silent']]];
const failed=[];
for(const [name,command,args] of gates){const r=spawnSync(command,args,{stdio:'inherit',shell:process.platform==='win32'});if(r.status!==0){failed.push(name);break;}}
if(failed.length){console.error(`Production gate runtime BLOCKED at: ${failed.join(', ')}`);process.exit(1);}
console.log('Production gate runtime PASS: integrity, typecheck and build completed.');
