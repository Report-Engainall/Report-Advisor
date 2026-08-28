import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { requireSafeRuntimeEnvironment, requireAuthenticatedContext } from './runtime-evidence-config.mjs';
import { createEvidenceRecord, sanitizeEvidence } from './runtime-evidence-record.mjs';

function expectThrow(name, fn, fragment) {
  assert.throws(fn, (error) => String(error?.message).includes(fragment), name);
  console.log(`PASS ${name}`);
}

for (const env of [undefined, '', 'unknown', 'production', 'PROD']) {
  expectThrow(`environment:${env ?? 'undefined'}`, () => requireSafeRuntimeEnvironment(env === undefined ? {} : { RUNTIME_EVIDENCE_ENV: env }), 'ABORT');
}
expectThrow('authenticated-context:missing-actor', () => requireAuthenticatedContext({ environment: 'staging', release: 'test', commitSha: 'sha', authorizedTenant: 'A', targetTenant: 'B' }), 'actor');
expectThrow('authenticated-context:missing-authorized-tenant', () => requireAuthenticatedContext({ environment: 'staging', release: 'test', commitSha: 'sha', actor: 'A', targetTenant: 'B' }), 'authorizedTenant');
expectThrow('authenticated-context:missing-target-tenant', () => requireAuthenticatedContext({ environment: 'staging', release: 'test', commitSha: 'sha', actor: 'A', authorizedTenant: 'A' }), 'targetTenant');
expectThrow('authenticated-context:missing-release', () => requireAuthenticatedContext({ environment: 'staging', commitSha: 'sha', actor: 'A', authorizedTenant: 'A', targetTenant: 'B' }), 'release');
expectThrow('authenticated-context:missing-commit', () => requireAuthenticatedContext({ environment: 'staging', release: 'test', actor: 'A', authorizedTenant: 'A', targetTenant: 'B' }), 'commitSha');

const complete = {
  TEST_ID:'P0-2A-SELF', ENVIRONMENT:'staging', RELEASE:'test', COMMIT_SHA:'sha', TIMESTAMP:new Date().toISOString(),
  ACTOR:'A', AUTHORIZED_TENANT:'A', TARGET_TENANT:'B', SURFACE:'database', OPERATION:'SELECT', INPUT:'sentinel',
  EXPECTED:'ZERO UNAUTHORIZED ROWS', ACTUAL:'ZERO UNAUTHORIZED ROWS', ROWS_RETURNED:0, ROWS_AFFECTED:0,
  ERROR_CODE:'NONE', RESULT:'PASS', EVIDENCE_REFERENCE:'self-validation',
};
for (const field of ['ACTOR','AUTHORIZED_TENANT','TARGET_TENANT','ENVIRONMENT','COMMIT_SHA','EXPECTED','ACTUAL']) {
  const copy = { ...complete }; delete copy[field];
  expectThrow(`evidence:missing-${field}`, () => createEvidenceRecord(copy), 'NOT VERIFIED');
}
expectThrow('evidence:pass-without-row-counts', () => createEvidenceRecord({ ...complete, ROWS_RETURNED: undefined }), 'NOT VERIFIED');
expectThrow('evidence:invalid-result', () => createEvidenceRecord({ ...complete, RESULT:'CERTIFIED' }), 'Invalid evidence result');

const redacted = sanitizeEvidence({ password:'FAKE_TEST_PASSWORD', token:'FAKE_TEST_TOKEN', service_role:'FAKE_TEST_SERVICE_ROLE', authorization:'FAKE_AUTH', cookie:'FAKE_COOKIE', safe:'kept' });
assert.equal(redacted.password, '[REDACTED]');
assert.equal(redacted.token, '[REDACTED]');
assert.equal(redacted.service_role, '[REDACTED]');
assert.equal(redacted.authorization, '[REDACTED]');
assert.equal(redacted.cookie, '[REDACTED]');
assert.equal(redacted.safe, 'kept');
assert(!JSON.stringify(redacted).includes('FAKE_TEST_PASSWORD'));
assert(!JSON.stringify(redacted).includes('FAKE_TEST_TOKEN'));
assert(!JSON.stringify(redacted).includes('FAKE_TEST_SERVICE_ROLE'));
console.log('PASS evidence:secret-redaction');

const seed = spawnSync(process.execPath, ['scripts/runtime-evidence-seed.mjs'], { encoding:'utf8', env:{ PATH:process.env.PATH, HOME:process.env.HOME } });
assert.notEqual(seed.status, 0);
assert.match(`${seed.stdout}\n${seed.stderr}`, /ABORT: RUNTIME_EVIDENCE_ENV must be staging or test/);
console.log('PASS seed:abort-without-safe-environment');

const productionSeed = spawnSync(process.execPath, ['scripts/runtime-evidence-seed.mjs'], { encoding:'utf8', env:{ ...process.env, RUNTIME_EVIDENCE_ENV:'production' } });
assert.notEqual(productionSeed.status, 0);
assert.match(`${productionSeed.stdout}\n${productionSeed.stderr}`, /ABORT/);
console.log('PASS seed:abort-production');

console.log('P0-2A SELF-VALIDATION PASS: fail-closed guards, evidence validation, redaction, and seed safety behave as designed. No live tenant claim emitted.');
