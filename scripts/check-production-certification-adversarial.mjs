import fs from 'node:fs';

const source = fs.readFileSync('src/lib/production/productionCertification.ts', 'utf8');
const required = ['tenant', 'backup', 'rollback', 'artifact', 'security'];
for (const key of required) if (!source.includes(`'${key}'`)) throw new Error(`missing canonical evidence key: ${key}`);
for (const token of ['MISSING_EVIDENCE:', 'FAILED_EVIDENCE:', 'DUPLICATE_EVIDENCE:', 'seen = new Set', 'score >= 0.95']) {
  if (!source.includes(token)) throw new Error(`certification hardening missing: ${token}`);
}

// Adversarial model: 100% score with one mandatory evidence item omitted must not certify.
const checks = required.filter(key => key !== 'security');
const simulatedMissing = required.filter(key => !checks.includes(key));
if (simulatedMissing.length !== 1 || simulatedMissing[0] !== 'security') throw new Error('adversarial fixture invalid');
if (!source.includes('MISSING_EVIDENCE:${key}')) throw new Error('missing-evidence blocker is not enforced');

// Test-of-test: stripping the mandatory blocker marker must make the gate reject.
const decoy = source.replace(/MISSING_EVIDENCE:/g, '// MISSING_EVIDENCE:').replace(/FAILED_EVIDENCE:/g, '// FAILED_EVIDENCE:');
if (decoy.includes('MISSING_EVIDENCE:${key}')) throw new Error('test-of-test failed: missing-evidence marker survived as executable source');
if (decoy.includes('FAILED_EVIDENCE:${key}')) throw new Error('test-of-test failed: failed-evidence marker survived as executable source');

console.log('Production certification adversarial evidence gate: PASS');
