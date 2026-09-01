import fs from 'node:fs';
const s=fs.readFileSync('src/lib/report-execution/checkpoint.ts','utf8');
if(!s.includes('...current.evidenceKeys')||!s.includes('...next.evidenceKeys')){console.error('FAIL: evidence preservation contract missing');process.exit(1)}
console.log('PASS: checkpoint evidence preservation contract');