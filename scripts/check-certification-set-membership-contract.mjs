import fs from 'node:fs';
const source = fs.readFileSync('src/lib/production/productionCertification.ts', 'utf8');
if (!/const REQUIRED_EVIDENCE_KEYS\s*=\s*new Set<string>\(PRODUCTION_CERTIFICATION_EVIDENCE_KEYS\)/s.test(source)) throw new Error('CERTIFICATION_REQUIRED_SET_NOT_CANONICAL');
if (!/REQUIRED_EVIDENCE_KEYS\.has\(key\)/s.test(source)) throw new Error('CERTIFICATION_MEMBERSHIP_CHECK_MISSING');
console.log('CERTIFICATION_SET_MEMBERSHIP_PASS');
