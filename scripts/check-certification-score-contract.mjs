import fs from 'node:fs';

const source = fs.readFileSync('src/lib/production/productionCertification.ts', 'utf8');
if (!/PRODUCTION_CERTIFICATION_EVIDENCE_KEYS\.length\s*\?\s*mandatoryChecks\.filter\(c\s*=>\s*c\.passed\)\.length\s*\/\s*PRODUCTION_CERTIFICATION_EVIDENCE_KEYS\.length\s*:\s*0/s.test(source)) {
  throw new Error('CERTIFICATION_SCORE_NOT_DERIVED_FROM_CANONICAL_MANDATORY_SET');
}
if (!/const mandatoryChecks\s*=\s*PRODUCTION_CERTIFICATION_EVIDENCE_KEYS\s*\.map\(key\s*=>\s*checksByKey\.get\(key\)\)/s.test(source)) {
  throw new Error('CERTIFICATION_SCORE_INPUT_NOT_CANONICAL');
}
console.log('CERTIFICATION_SCORE_CONTRACT_PASS');
