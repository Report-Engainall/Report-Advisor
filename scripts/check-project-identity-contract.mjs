import fs from 'node:fs';
const s=fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md','utf8');
if(!s.includes('Report-Engainall/Report-Advisor')){console.error('FAIL: project identity missing');process.exit(1)}
console.log('PASS: Report-Advisor project identity');