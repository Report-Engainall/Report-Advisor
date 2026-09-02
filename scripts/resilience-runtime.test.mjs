import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { timingSafeEqual } from 'node:crypto';
import rollbackHandler, { deploymentReady } from '../api/rollback-drill.mjs';
import { isProductionEnv, parseSecureOutboundUrl, secureOutboundFetch } from '../src/server/resilience-runtime.mjs';

const files = [
  'api/health.mjs',
  'api/tenant-canary.mjs',
  'api/backup-restore-verify.mjs',
  'api/rollback-drill.mjs',
  'src/server/resilience-runtime.mjs',
  'scripts/phase-f-live-resilience-probes.mjs',
];
for (const file of files) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });

assert.equal(timingSafeEqual(Buffer.from('resilience-secret'), Buffer.from('resilience-secret')), true);
process.env.RESILIENCE_TARGET_ENV = 'production';
assert.equal(isProductionEnv(), true);
delete process.env.RESILIENCE_TARGET_ENV;

assert.equal(parseSecureOutboundUrl('https://backup.example.test/artifact').protocol, 'https:');
assert.throws(() => parseSecureOutboundUrl('http://backup.example.test/artifact', 'backup_artifact_url'), /insecure_backup_artifact_url/);
assert.throws(() => parseSecureOutboundUrl('https://user:pass@backup.example.test/artifact', 'backup_artifact_url'), /credentialed_backup_artifact_url/);
assert.throws(() => parseSecureOutboundUrl('not-a-url', 'restore_verifier_url'), /invalid_restore_verifier_url/);
process.env.RESILIENCE_OUTBOUND_TIMEOUT_MS = '999';
await assert.rejects(() => secureOutboundFetch('https://backup.example.test/artifact', 'backup_artifact_url'), /invalid_resilience_outbound_timeout_ms/);
process.env.RESILIENCE_OUTBOUND_TIMEOUT_MS = '15000';

const original = Object.fromEntries([
  'VERCEL_PROJECT_ID', 'VERCEL_TOKEN', 'RESILIENCE_TARGET_ENV', 'RESILIENCE_COMPANY_ID',
  'RESILIENCE_ROLLBACK_DRILL_DOMAIN', 'RESILIENCE_PRODUCTION_DOMAIN',
  'RESILIENCE_ROLLBACK_FROM_DEPLOYMENT', 'RESILIENCE_ROLLBACK_FORWARD_DEPLOYMENT',
  'RESILIENCE_ROLLBACK_VERIFY_URL', 'RESILIENCE_OPERATIONAL_TOKEN', 'RESILIENCE_OUTBOUND_TIMEOUT_MS',
].map((key) => [key, process.env[key]]));
process.env.VERCEL_PROJECT_ID = 'project-good';
process.env.VERCEL_TOKEN = 'test-token';

const responses = new Map([
  ['same-a', { id: 'same-a', projectId: 'project-good', readyState: 'READY' }],
  ['same-b', { id: 'same-b', projectId: 'project-good', readyState: 'READY' }],
  ['foreign', { id: 'foreign', projectId: 'project-other', readyState: 'READY' }],
  ['not-ready', { id: 'not-ready', projectId: 'project-good', readyState: 'BUILDING' }],
  ['api-fail', new Error('network_timeout')],
]);
let aliasCalls = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options = {}) => {
  const parsed = new URL(url);
  if (options.method === 'POST' && parsed.pathname.includes('/aliases')) {
    aliasCalls.push(parsed.pathname);
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  }
  const id = decodeURIComponent(parsed.pathname.split('/').pop());
  const entry = responses.get(id);
  if (entry instanceof Error) throw entry;
  if (!entry) return new Response('not found', { status: 404 });
  return new Response(JSON.stringify(entry), { status: 200, headers: { 'content-type': 'application/json' } });
};

const makeResponse = () => {
  const state = { status: null, body: null };
  return { state, res: {
    status(code) { state.status = code; return this; },
    setHeader() { return this; },
    end(body) { state.body = JSON.parse(body); },
  }};
};

try {
  await assert.doesNotReject(() => deploymentReady('same-a'));
  await assert.doesNotReject(() => deploymentReady('same-b'));
  await assert.rejects(() => deploymentReady('foreign'), /deployment_project_mismatch/);
  await assert.rejects(() => deploymentReady('missing'), /deployment_lookup_failed:404/);
  await assert.rejects(() => deploymentReady('not-ready'), /deployment_not_ready:BUILDING/);
  await assert.rejects(() => deploymentReady('api-fail'), /network_timeout/);
  await assert.rejects(() => deploymentReady(''), /deployment_id_required/);
  await assert.rejects(() => Promise.all([deploymentReady('same-a'), deploymentReady('foreign')]), /deployment_project_mismatch/);
  delete process.env.VERCEL_PROJECT_ID;
  await assert.rejects(() => deploymentReady('same-a'), /vercel_project_id_required/);
  process.env.VERCEL_PROJECT_ID = 'project-good';

  process.env.RESILIENCE_OPERATIONAL_TOKEN = 'test-token';
  process.env.RESILIENCE_TARGET_ENV = 'staging';
  process.env.RESILIENCE_COMPANY_ID = 'company-good';
  process.env.RESILIENCE_ROLLBACK_DRILL_DOMAIN = 'drill.example.test';
  process.env.RESILIENCE_PRODUCTION_DOMAIN = 'production.example.test';
  process.env.RESILIENCE_ROLLBACK_FROM_DEPLOYMENT = 'same-a';
  process.env.RESILIENCE_ROLLBACK_FORWARD_DEPLOYMENT = 'same-a';
  process.env.RESILIENCE_ROLLBACK_VERIFY_URL = 'https://verify.example.test';

  let captured = makeResponse();
  await rollbackHandler({ method: 'POST', headers: { 'x-resilience-token': 'test-token' } }, captured.res);
  assert.equal(captured.state.status, 409);
  assert.equal(captured.state.body.error, 'rollback_deployments_must_differ');
  assert.equal(aliasCalls.length, 0);

  process.env.RESILIENCE_TARGET_ENV = 'production';
  process.env.RESILIENCE_ROLLBACK_FORWARD_DEPLOYMENT = 'same-b';
  captured = makeResponse();
  await rollbackHandler({ method: 'POST', headers: { 'x-resilience-token': 'test-token' } }, captured.res);
  assert.equal(captured.state.status, 409);
  assert.equal(captured.state.body.error, 'production_rollback_drill_forbidden');
  assert.equal(aliasCalls.length, 0);

  process.env.RESILIENCE_TARGET_ENV = 'staging';
  process.env.RESILIENCE_ROLLBACK_DRILL_DOMAIN = 'production.example.test';
  captured = makeResponse();
  await rollbackHandler({ method: 'POST', headers: { 'x-resilience-token': 'test-token' } }, captured.res);
  assert.equal(captured.state.status, 409);
  assert.equal(captured.state.body.error, 'rollback_domain_is_production_domain');
  assert.equal(aliasCalls.length, 0);

  process.env.RESILIENCE_ROLLBACK_DRILL_DOMAIN = 'drill.example.test';
  process.env.RESILIENCE_ROLLBACK_FROM_DEPLOYMENT = 'api-fail';
  process.env.RESILIENCE_ROLLBACK_FORWARD_DEPLOYMENT = 'foreign';
  aliasCalls = [];
  captured = makeResponse();
  await rollbackHandler({ method: 'POST', headers: { 'x-resilience-token': 'test-token' } }, captured.res);
  assert.equal(captured.state.status, 503);
  assert.equal(captured.state.body.status, 'failed');
  assert.equal(aliasCalls.length, 0, 'must not alias an unvalidated forward deployment');
} finally {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
}

console.log(`PASS: resilience syntax + rollback security/adversarial guards (${files.length} files).`);
