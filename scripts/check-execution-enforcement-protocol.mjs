import fs from 'node:fs';

const protocol = fs.readFileSync('docs/EXECUTION_ENFORCEMENT_PROTOCOL.md', 'utf8');
const requiredRules = [
  'E-01 — Parallelism before reporting',
  'E-02 — NEXT+1 / NEXT+2 consumption',
  'E-03 — Blocker isolation',
  'E-04 — Discovery is not closure',
  'E-05 — Gate integrity',
  'E-06 — Exact-SHA evidence boundary',
  'E-07 — Runtime truth separation',
  'E-08 — Test-of-test requirement',
  'E-09 — Remaining-work accounting',
  'E-10 — Index governance',
  'E-11 — True-stop gate',
  'E-12 — Automatic protocol evolution',
];

for (const rule of requiredRules) {
  if (!protocol.includes(rule)) throw new Error(`Missing enforcement rule: ${rule}`);
}

const weakeningDecoys = [
  'historical PASS transfers automatically',
  'UNPROVEN becomes PASS automatically',
  'blocker stops unrelated work',
];

for (const decoy of weakeningDecoys) {
  if (protocol.includes(decoy)) throw new Error(`Potential protocol weakening detected: ${decoy}`);
}

if (!protocol.includes('MUST NOT be promoted')) {
  throw new Error('Exact-SHA anti-transfer enforcement is missing');
}
if (!protocol.includes('MUST NOT stop unrelated')) {
  throw new Error('Blocker isolation enforcement is missing');
}

console.log(`PASS execution enforcement protocol: ${requiredRules.length} mandatory rules present; weakening decoys rejected`);
