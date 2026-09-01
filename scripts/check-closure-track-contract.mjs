import fs from 'node:fs';

const index = fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md', 'utf8');
const tracks = [
  'P0-A Authenticated Runtime',
  'P0-B Tenant A/B',
  'P1-C Production Runtime',
  'P1-D Recovery',
  'P1-E Documents/OCR',
  'P1-F Import/Reconciliation',
  'P1-G Workers',
  'P2-H Performance',
  'P2-I Operations/UX',
  'P2-J Acceptance',
];
const missing = tracks.filter((track) => !index.includes(track));
if (missing.length) {
  missing.forEach((track) => console.error(`- missing track: ${track}`));
  process.exit(1);
}
console.log(`PASS: closure track contract (${tracks.length}/${tracks.length})`);
