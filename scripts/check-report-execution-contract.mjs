import { readFileSync } from 'node:fs';

for (const file of [
  'src/lib/intelligence/unified-decision-chain.ts',
  'src/lib/dataLineage.ts',
]) readFileSync(file, 'utf8');

const roadmap = readFileSync('docs/IMPLEMENTATION_ROADMAP.md', 'utf8');
for (const token of [
  'Phase A — Report execution',
  'trusted worker adapter',
  'queue_report_run',
  'claim_report_run',
  'immutable run evidence',
  'delivery results',
]) {
  if (!roadmap.includes(token)) throw new Error(`Missing report execution requirement: ${token}`);
}

console.log('Report execution contract: PASS');
