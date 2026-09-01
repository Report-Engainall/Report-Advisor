import fs from 'node:fs';
const source = fs.readFileSync('src/lib/production/productionCertification.ts', 'utf8');
if (!/const warnings\s*=\s*checks\.filter\(c\s*=>\s*!c\.passed\s*&&\s*c\.severity\s*===\s*'WARNING'\)/s.test(source)) throw new Error('CERTIFICATION_WARNING_CLASSIFICATION_MISSING');
if (!/warnings,/s.test(source)) throw new Error('CERTIFICATION_WARNINGS_NOT_RETURNED');
if (/\.\.\.warnings.*certificationBlockers/s.test(source)) throw new Error('CERTIFICATION_WARNING_PROMOTED_TO_BLOCKER');
console.log('CERTIFICATION_WARNING_SEPARATION_PASS');
