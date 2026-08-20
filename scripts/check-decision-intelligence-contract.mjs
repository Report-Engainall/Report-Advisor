import fs from 'node:fs';
const source = fs.readFileSync('src/lib/intelligence/decisionIntelligence.ts', 'utf8');
for (const token of ['EVIDENCE_MISSING','LOW_EVIDENCE_CONFIDENCE','OPTIONS_MISSING','INVALID_RECOMMENDATION','rankDecisionOptions','recordDecisionOutcome']) if (!source.includes(token)) throw new Error(`Decision contract missing: ${token}`);
console.log('Decision intelligence contract: PASS');
