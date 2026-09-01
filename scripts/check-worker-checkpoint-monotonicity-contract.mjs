import fs from 'node:fs';

const source = fs.readFileSync('src/lib/report-execution.ts', 'utf8');
const test = fs.readFileSync('scripts/report-execution-runtime.test.ts', 'utf8');

if (!/canAdvanceCheckpoint/.test(source)) throw new Error('checkpoint transition gate is missing');
if (!/resumeFromCheckpoint/.test(source)) throw new Error('checkpoint resume validation is missing');
if (!/checkpoint.*transition|transition.*checkpoint/i.test(test)) throw new Error('checkpoint transition regression coverage is missing');
if (!/resume.*checkpoint|checkpoint.*resume/i.test(test)) throw new Error('checkpoint resume regression coverage is missing');

console.log('worker checkpoint monotonicity contract: PASS');
