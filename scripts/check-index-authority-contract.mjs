import fs from 'node:fs';
const s=fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md','utf8');
for(const x of ['This index is authoritative for execution state.','Historical PASS is never promoted across SHAs.','Exact-head CI is required']) if(!s.includes(x)){console.error('FAIL: missing authority rule '+x);process.exit(1)}
console.log('PASS: index authority contract');