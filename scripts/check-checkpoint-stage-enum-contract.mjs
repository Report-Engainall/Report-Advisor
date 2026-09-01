import fs from 'node:fs';
const s=fs.readFileSync('src/lib/report-execution/checkpoint.ts','utf8');
for(const x of ['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered']) if(!s.includes(x)){console.error('FAIL: missing stage '+x);process.exit(1)}
console.log('PASS: checkpoint stage enum contract (9/9)');