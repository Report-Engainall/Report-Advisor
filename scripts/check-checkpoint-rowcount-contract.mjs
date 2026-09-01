import fs from 'node:fs';
const s=fs.readFileSync('src/lib/report-execution/checkpoint.ts','utf8');
for(const x of ['Number.isInteger(next.rowCount)','next.rowCount < 0','Checkpoint rowCount must be a non-negative integer']) if(!s.includes(x)){console.error('FAIL: '+x);process.exit(1)}
console.log('PASS: checkpoint row-count contract');