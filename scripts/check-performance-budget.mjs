import {readdir,stat} from 'node:fs/promises';
import {join} from 'node:path';
const MAX_KB=450;
async function walk(dir){const out=[];for(const name of await readdir(dir)){const p=join(dir,name);const s=await stat(p);if(s.isDirectory())out.push(...await walk(p));else out.push(s.size)}return out}
const sizes=await walk('dist');
const total=sizes.reduce((a,b)=>a+b,0)/1024;
if(total>MAX_KB){console.error(`Performance budget exceeded: ${total.toFixed(1)}KB > ${MAX_KB}KB`);process.exit(1)}
console.log(`Performance budget passed: ${total.toFixed(1)}KB <= ${MAX_KB}KB`);
