import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { timingSafeEqual } from 'node:crypto';
import { deploymentReady } from '../api/rollback-drill.mjs';
import { isProductionEnv } from '../src/server/resilience-runtime.mjs';

const files = [
  'api/health.mjs',
  'api/tenant-canary.mjs',
  'api/backup-restore-verify.mjs',
  'api/rollback-drill.mjs',
  'src/server/resilience-runtime.mjs',
  'scripts/phase-f-live-resilience-probes.mjs',
];
for (const file of files) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });

const a = Buffer.from('resilience-secret');
const b = Buffer.from('resilience-secret');
assert.equal(timingSafeEqual(a, b), true);

process.env.RESILIENCE_TARGET_ENV = 'production';
assert.equal(isProductionEnv(), true);
delete process.env.RESILIENCE_TARGET_ENV;

const originalFetch = globalThis.fetch;
const originalProjectId = process.env.VERCEL_PROJECT_ID;
const originalVercelToken = process.env.VERCEL_TOKEN;
process.env.VERCEL_PROJECT_ID = 'project-good';
process.env.VERCEL_TOKEN = 'test-token';

const responses = new Map();
const mockFetch = async (url) => {
  const id = decodeURIComponent(new URL(url).pathname.split('/').pop());
  const entry = responses.get(id);
  if (entry instanceof Error) throw entry;
  if (!entry) return new Response('not found', { status: 404 });
  return new Response(JSON.stringify(entry), { status: 200, headers: { 'content-type': 'application/json' } });
};

globalThis.fetch = mockFetch;
try {
  responses.set('same-a', { id: 'same-a', projectId: 'project-good', readyState: 'READY' });
  responses.set('same-b', { id: 'same-b', projectId: 'project-good', readyState: 'READY' });
  responses.set('foreign', { id: 'foreign', projectId: 'project-other', readyState: 'READY' });
  responses.set('not-ready', { id: 'not-ready', projectId: 'project-good', readyState: 'BUILDING' });
  responses.set('api-fail', new Error('network_timeout'));

  await assert.doesNotReject(() => deploymentReady('same-a'));
  await assert.doesNotReject(() => deploymentReady('same-b'));
  await assert.rejects(() => deploymentReady('foreign'), /deployment_project_mismatch/);
  await assert.rejects(() => deploymentReady('missing'), /deployment_lookup_failed:404/);
  await assert.rejects(() => deploymentReady('not-ready'), /deployment_not_ready:BUILDING/);
  await assert.rejects(() => deploymentReady('api-fail'), /network_timeout/);
  await assert.rejects(() => deploymentReady(''), /deployment_id_required/);

  const mixed = async () => Promise.all([deploymentReady('same-a'), deploymentReady('foreign')]);
  await assert.rejects(mixed, /deployment_project_mismatch/);

  delete process.env.VERCEL_PROJECT_ID;
  await assert.rejects(() => deploymentReady('same-a'), /vercel_project_id_required/);
} finally {
  globalThis.fetch = originalFetch;
  if (originalProjectId === undefined) delete process.env.VERCEL_PROJECT_ID;
  else process.env.VERCEL_PROJECT_ID = originalProjectId;
  if (originalVercelToken === undefined) delete process.env.VERCEL_TOKEN;
  else process.env.VERCEL_TOKEN = originalVercelToken;
}

console.log(`PASS: resilience runtime syntax + rollback security guards (${files.length} files).`);
