import fs from 'node:fs';
const source = fs.readFileSync('src/lib/production/productionCertification.ts', 'utf8');
if (!/evidence:\s*checks,/s.test(source)) throw new Error('CERTIFICATION_EVIDENCE_OUTPUT_NOT_PRESERVED');
if (!/blockers:\s*\[\.\.\.new Set\(certificationBlockers\)\]/s.test(source)) throw new Error('CERTIFICATION_BLOCKERS_NOT_DEDUPLICATED');
console.log('CERTIFICATION_EVIDENCE_PRESERVATION_PASS');
