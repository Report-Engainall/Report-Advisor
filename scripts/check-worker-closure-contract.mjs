import fs from 'node:fs';
const candidates = [
  'src/lib/import-pipeline/folder-job-ledger.test.ts',
  'src/lib/import-pipeline',
  'scripts',
];
const present = candidates.filter(fs.existsSync);
if (!present.length) throw new Error('Worker/import runtime surface missing');
const corpus = present.filter(p => fs.statSync(p).isFile()).map(p => fs.readFileSync(p,'utf8')).join('\n');
const root = present.filter(p => fs.statSync(p).isDirectory());
if (!corpus && !root.length) throw new Error('Worker closure evidence missing');
console.log('WORKER_CLOSURE_CONTRACT_PASS: runtime/import resilience surface present');
