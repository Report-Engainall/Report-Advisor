import fs from 'node:fs';

const index = fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md', 'utf8');
const required = [
  'Certification requires exact-head evidence.',
  'Historical PASS is never promoted across SHAs.',
  'Inspection, analysis, queued CI, and historical PASS do not count as completion.',
];

for (const text of required) {
  if (!index.includes(text)) throw new Error(`Missing release boundary rule: ${text}`);
}

console.log(`PASS: release boundary contract (${required.length}/${required.length})`);
