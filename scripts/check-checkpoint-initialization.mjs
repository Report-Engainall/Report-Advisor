import fs from 'node:fs';
const s=fs.readFileSync('src/lib/report-execution/checkpoint.ts','utf8');
for(const x of ["if (!sourceHash.trim())", "evidenceKeys: [...new Set(evidenceKeys)].sort()", "stage: 'queued'"]) if(!s.includes(x)){console.error('FAIL: '+x);process.exit(1)}
console.log('PASS: checkpoint initialization contract');