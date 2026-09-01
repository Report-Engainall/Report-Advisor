import fs from 'node:fs';

const source = fs.readFileSync('src/lib/production/productionCertification.ts', 'utf8');
const decision = source.match(/certified:\s*([^,]+),/s)?.[1] ?? '';
for (const token of ['certificationBlockers.length === 0', 'score >= 0.95', 'evidenceComplete']) {
  if (!decision.includes(token)) throw new Error(`CERTIFICATION_FAIL_CLOSED_MISSING:${token}`);
}
if (!/certificationBlockers\s*=\s*\[/s.test(source)) throw new Error('CERTIFICATION_BLOCKER_AGGREGATION_MISSING');
console.log('CERTIFICATION_FAIL_CLOSED_PASS');
