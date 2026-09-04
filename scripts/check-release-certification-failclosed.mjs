import fs from 'node:fs';

const release = fs.readFileSync('.github/workflows/release-certification.yml', 'utf8');
const forbidden = [
  /certification_result\s*:\s*['"]passed['"]/,
  /blocker_count\s*:\s*0/,
  /blocker_state\s*:\s*['"]clear['"]/,
];
for (const pattern of forbidden) {
  if (pattern.test(release)) throw new Error(`FAIL-CLOSED VIOLATION: release workflow contains synthetic decision marker ${pattern}`);
}
for (const token of [
  'github.sha',
  'git rev-parse HEAD',
  'MISSING_RUNTIME_EVIDENCE:',
  "certification_result: 'blocked'",
  "blocker_state: 'blocked'",
  'forgedPass',
  'acceptsReleaseDecision',
  'CERTIFICATION_TEST_OF_TEST_FAILED',
]) {
  if (!release.includes(token)) throw new Error(`FAIL-CLOSED CONTRACT MISSING: ${token}`);
}
const evidenceConsumer = fs.readFileSync('.github/workflows/production-evidence-boundary.yml', 'utf8');
for (const token of [
  'actions/download-artifact@v4',
  'check-live-production-evidence-boundary.mjs',
  'check-production-evidence-failclosed.mjs',
  'EXPECTED_SOURCE_SHA',
  'RELEASE_CERTIFICATION_RUN_ID',
]) {
  if (!evidenceConsumer.includes(token)) throw new Error(`RELEASE EVIDENCE CONSUMER MISSING: ${token}`);
}

// Test-of-test: mutate a known-safe decision fragment to a synthetic PASS and
// prove the same forbidden-marker rules reject it.
const mutated = release.replace("certification_result: 'blocked'", "certification_result: 'passed'");
if (!/certification_result\s*:\s*['"]passed['"]/.test(mutated)) {
  throw new Error('TEST-OF-TEST SETUP FAILED: mutation did not create synthetic PASS');
}
if (!forbidden[0].test(mutated)) throw new Error('TEST-OF-TEST FAILED: synthetic PASS mutation was not rejected');

console.log(JSON.stringify({
  status: 'PASS',
  synthetic_pass_markers_rejected: true,
  required_runtime_evidence: ['tenant','backup','rollback','artifact','security'],
  test_of_test: 'synthetic certification_result=passed rejected',
}, null, 2));
