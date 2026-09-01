import fs from 'node:fs';
const workflow = fs.readFileSync('.github/workflows/certification-evidence-boundary.yml', 'utf8');
const runtime = 'scripts/production-certification-runtime.test.mjs';
if (!workflow.includes(runtime)) throw new Error('CERTIFICATION_RUNTIME_TEST_NOT_WIRED');
const integrity = fs.readFileSync('scripts/check-production-certification-evidence-integrity.mjs', 'utf8');
if (!integrity.includes(runtime)) throw new Error('CERTIFICATION_RUNTIME_TEST_NOT_REUSED_BY_INTEGRITY');
console.log('CERTIFICATION_RUNTIME_TEST_WIRING_PASS');
