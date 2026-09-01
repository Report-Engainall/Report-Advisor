import fs from 'node:fs';

const source = fs.readFileSync('src/lib/production/productionCertification.ts', 'utf8');
if (!/duplicateEvidence\s*=\s*new Set<string>\(\)/s.test(source)) throw new Error('CERTIFICATION_DUPLICATE_TRACKING_MISSING');
if (!/duplicateMandatoryEvidence\s*=\s*PRODUCTION_CERTIFICATION_EVIDENCE_KEYS\.filter\(key\s*=>\s*duplicateEvidence\.has\(key\)\)/s.test(source)) {
  throw new Error('CERTIFICATION_MANDATORY_DUPLICATE_GUARD_MISSING');
}
if (!/DUPLICATE_EVIDENCE:/s.test(source)) throw new Error('CERTIFICATION_DUPLICATE_BLOCKER_MISSING');
console.log('CERTIFICATION_DUPLICATE_CONTRACT_PASS');
