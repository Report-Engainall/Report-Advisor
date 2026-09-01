import fs from 'node:fs';

const index = fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md', 'utf8');
const required = [
  'Report-Engainall/Report-Advisor',
  'PR: **#294 — OPEN / NOT MERGED**',
  'Exact-head CI is required',
  'Only committed, reproducible, repository-visible changes',
  'P0-A Authenticated Runtime',
  'P1-G Workers',
];

const failures = required.filter((entry) => !index.includes(entry));
if (failures.length) {
  console.error('Execution index integrity failures:');
  failures.forEach((entry) => console.error(`- missing: ${entry}`));
  process.exit(1);
}

console.log(`PASS: execution index integrity (${required.length}/${required.length})`);
