import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/pages/IntelligencePage.tsx', import.meta.url), 'utf8');

const required = [
  "status === 'new'",
  "handleAction(rec.id, 'approved')",
  "handleAction(rec.id, 'rejected')",
  "rec.status === 'approved'",
  "const durableStatus = status === 'accepted' ? 'approved' : status",
  "['approved', 'rejected'].includes(durableStatus)",
];

for (const token of required) {
  if (!source.includes(token)) throw new Error(`Recommendation UI lifecycle contract missing: ${token}`);
}

if (source.includes("handleAction(rec.id, 'done')")) {
  throw new Error('Recommendation UI must not expose a local done transition');
}

console.log('Recommendation UI durable lifecycle contract: PASS');
