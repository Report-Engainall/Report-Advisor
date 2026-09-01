import fs from 'node:fs';
const s=fs.readFileSync('src/lib/report-execution/checkpoint.ts','utf8');
for(const x of ['next.sourceHash !== current.sourceHash','Checkpoint source hash cannot change during a run']) if(!s.includes(x)){console.error('FAIL: '+x);process.exit(1)}
console.log('PASS: checkpoint source immutability');