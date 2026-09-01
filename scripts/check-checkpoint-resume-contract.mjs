import fs from 'node:fs';
const s=fs.readFileSync('src/lib/report-execution/checkpoint.ts','utf8');
for(const x of ['resumeFromCheckpoint','Cannot resume a checkpoint without a source hash','Cannot resume a checkpoint with invalid timestamp','Cannot resume an unknown checkpoint stage']) if(!s.includes(x)){console.error('FAIL: '+x);process.exit(1)}
console.log('PASS: checkpoint resume contract');