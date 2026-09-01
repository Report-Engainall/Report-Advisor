import fs from 'node:fs';
const s=fs.readFileSync('src/lib/report-execution/checkpoint.ts','utf8');
if(!s.includes('updatedAt: Date.now()')||!s.includes('Number.isFinite(checkpoint.updatedAt)')){console.error('FAIL: checkpoint timestamp contract missing');process.exit(1)}
console.log('PASS: checkpoint timestamp contract');