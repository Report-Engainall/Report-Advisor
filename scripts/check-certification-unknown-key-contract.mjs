import fs from 'node:fs';
const source = fs.readFileSync('src/lib/production/productionCertification.ts', 'utf8');
if (!/checksByKey\s*=\s*new Map<string, CertificationCheck>\(\)/s.test(source)) throw new Error('CERTIFICATION_CHECK_INDEX_MISSING');
if (!/PRODUCTION_CERTIFICATION_EVIDENCE_KEYS\.map\(key\s*=>\s*checksByKey\.get\(key\)\)/s.test(source)) throw new Error('CERTIFICATION_SCORE_MUST_IGNORE_UNKNOWN_KEYS');
console.log('CERTIFICATION_UNKNOWN_KEY_CONTRACT_PASS');
