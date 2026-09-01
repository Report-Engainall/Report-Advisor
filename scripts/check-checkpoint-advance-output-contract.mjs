import fs from 'node:fs';
const s=fs.readFileSync('src/lib/report-execution/checkpoint.ts','utf8');
if(!s.includes('return { ...next, evidenceKeys, updatedAt: Date.now() }')){console.error('FAIL: checkpoint advance output contract missing');process.exit(1)}
console.log('PASS: checkpoint advance output contract');