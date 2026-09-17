import {spawnSync} from 'node:child_process';
import process from 'node:process';
const gates=['test:production-gate-integrity','typecheck','build'];
const failed=[];
for(const script of gates){const r=spawnSync('npm',['run',script,'--silent'],{stdio:'inherit',shell:process.platform==='win32'});if(r.status!==0){failed.push(script);break;}}
if(failed.length){console.error(`Production gate runtime BLOCKED at: ${failed.join(', ')}`);process.exit(1);}
console.log('Production gate runtime PASS: integrity, typecheck and build completed.');
