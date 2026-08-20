import fs from 'node:fs';
const pipeline=fs.readFileSync('src/lib/free-toolbox/report-pipeline.ts','utf8');
for(const token of ['evidenceCount','quality.score >= 70','سجل أدلة','ready = blockingIssues.length === 0']) if(!pipeline.includes(token)) throw new Error(`Report readiness contract missing: ${token}`);
console.log('Report readiness contract: PASS');
