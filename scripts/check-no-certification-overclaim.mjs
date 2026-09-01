import fs from 'node:fs';

const index = fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md', 'utf8');
const forbidden = [
  'all certification gates PASS',
  'production certified',
  'backup/restore certified',
  'rollback certified',
];
const found = forbidden.filter((entry) => index.toLowerCase().includes(entry));
if (found.length) {
  found.forEach((entry) => console.error(`FAIL: forbidden certification overclaim: ${entry}`));
  process.exit(1);
}
console.log(`PASS: certification overclaim guard (${forbidden.length} forbidden claims checked)`);
