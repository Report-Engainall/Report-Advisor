import fs from 'node:fs';
const s=fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md','utf8');
if(!s.includes('PR: **#294 — OPEN / NOT MERGED**')){console.error('FAIL: PR state contract missing');process.exit(1)}
console.log('PASS: PR #294 state contract');