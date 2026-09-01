import fs from 'node:fs';
const test = fs.readFileSync('scripts/production-certification-runtime.test.mjs', 'utf8');
for (const token of ['missing', 'failed', 'duplicate', 'unrelated', 'complete']) {
  if (!test.includes(token)) throw new Error(`CERTIFICATION_ADVERSARIAL_CASE_MISSING:${token}`);
}
console.log('CERTIFICATION_ADVERSARIAL_COVERAGE_PASS');
