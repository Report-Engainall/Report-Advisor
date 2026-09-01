import fs from 'node:fs';
const s=fs.readFileSync('src/lib/report-execution/checkpoint.ts','utf8');
if(!s.includes('[...new Set([...current.evidenceKeys, ...next.evidenceKeys])].sort()')){console.error('FAIL: evidence dedup contract missing');process.exit(1)}
console.log('PASS: checkpoint evidence dedup contract');