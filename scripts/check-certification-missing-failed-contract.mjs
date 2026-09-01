import fs from 'node:fs';

const source = fs.readFileSync('src/lib/production/productionCertification.ts', 'utf8');
if (!/const missingEvidence\s*=\s*PRODUCTION_CERTIFICATION_EVIDENCE_KEYS\.filter\(key\s*=>\s*!checksByKey\.has\(key\)\)/s.test(source)) {
  throw new Error('CERTIFICATION_MISSING_EVIDENCE_GUARD_MISSING');
}
if (!/const failedEvidence\s*=\s*PRODUCTION_CERTIFICATION_EVIDENCE_KEYS\.filter\(key\s*=>/s.test(source)) {
  throw new Error('CERTIFICATION_FAILED_EVIDENCE_GUARD_MISSING');
}
for (const token of ['MISSING_EVIDENCE:', 'FAILED_EVIDENCE:']) {
  if (!source.includes(token)) throw new Error(`CERTIFICATION_EVIDENCE_BLOCKER_MISSING:${token}`);
}
console.log('CERTIFICATION_MISSING_FAILED_CONTRACT_PASS');
