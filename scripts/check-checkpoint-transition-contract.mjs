import fs from 'node:fs';
const s=fs.readFileSync('src/lib/report-execution/checkpoint.ts','utf8');
for(const x of ["ORDER.indexOf(to) === ORDER.indexOf(from) + 1",'Invalid checkpoint transition']) if(!s.includes(x)){console.error('FAIL: '+x);process.exit(1)}
console.log('PASS: checkpoint monotonic transition contract');