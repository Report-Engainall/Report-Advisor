import fs from 'node:fs';
const ai = fs.readFileSync('src/lib/intelligence/aiQueryGuard.ts', 'utf8');
for (const token of ['detectQueryIntent', 'guardAIQuery', 'buildEvidenceContext', 'BLOCK', 'ALLOW_WITH_WARNING']) {
  if (!ai.includes(token)) throw new Error(`AI contract missing: ${token}`);
}
const exec = fs.readFileSync('src/lib/intelligence/executiveIntelligence.ts', 'utf8');
for (const token of ['buildExecutiveCockpit', 'morningBrief', 'moneyView', 'evidenceIds']) {
  if (!exec.includes(token)) throw new Error(`Executive contract missing: ${token}`);
}
console.log('AI + Executive contracts: PASS');
