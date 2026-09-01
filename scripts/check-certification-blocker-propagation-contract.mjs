import fs from 'node:fs';
const source = fs.readFileSync('src/lib/production/productionCertification.ts', 'utf8');
if (!/const blockers\s*=\s*checks\.filter\(c\s*=>\s*!c\.passed\s*&&\s*c\.severity\s*===\s*'BLOCKER'\)/s.test(source)) throw new Error('CERTIFICATION_BLOCKER_CLASSIFICATION_MISSING');
if (!/\.\.\.blockers,/s.test(source)) throw new Error('CERTIFICATION_BLOCKERS_NOT_PROPAGATED');
console.log('CERTIFICATION_BLOCKER_PROPAGATION_PASS');
