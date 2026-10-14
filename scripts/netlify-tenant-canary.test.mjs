import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../netlify/functions/tenant-canary.mjs';

const envKeys = [
  'RESILIENCE_OPERATIONAL_TOKEN',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'RESILIENCE_COMPANY_ID',
  'RESILIENCE_CANARY_FOREIGN_COMPANY_ID',
];
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
const originalFetch = globalThis.fetch;

function restoreEnv() {
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
}

function configureEnv() {
  process.env.RESILIENCE_OPERATIONAL_TOKEN = 'operator-test-token';
  process.env.SUPABASE_URL = 'https://supabase.example.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  process.env.SUPABASE_ANON_KEY = 'anon-test-key';
  delete process.env.VITE_SUPABASE_ANON_KEY;
  process.env.RESILIENCE_COMPANY_ID = 'own-company';
  process.env.RESILIENCE_CANARY_FOREIGN_COMPANY_ID = 'foreign-company';
}

function request({ method = 'GET', operatorToken = 'operator-test-token', bearerToken = 'user-test-token' } = {}) {
  const headers = {};
  if (operatorToken !== null) headers['x-resilience-token'] = operatorToken;
  if (bearerToken !== null) headers.authorization = `Bearer ${bearerToken}`;
  return new Request('https://app.example.test/api/tenant-canary', { method, headers });
}

function response(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function mockSupabase({ leakForeignRows = false, missingForeignSeed = false } = {}) {
  const requests = [];
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url));
    requests.push({ url: parsed.href, method: options.method || 'GET', headers: options.headers || {}, body: options.body });

    if (parsed.pathname !== '/rest/v1/operational_health_snapshots') {
      return response(404, { message: 'unexpected_path' });
    }
    if (options.method === 'POST') {
      return response(201, []);
    }

    const companyFilter = parsed.searchParams.get('company_id');
    const auth = options.headers?.Authorization;
    if (auth === 'Bearer service-role-test-key' && companyFilter === 'eq.foreign-company') {
      return response(200, missingForeignSeed ? [] : [{ id: 'foreign-seed' }]);
    }
    if (auth === 'Bearer user-test-token' && companyFilter === 'eq.own-company') {
      return response(200, [{ id: 'own-row' }]);
    }
    if (auth === 'Bearer user-test-token' && companyFilter === 'eq.foreign-company') {
      return response(200, leakForeignRows ? [{ id: 'foreign-row-visible' }] : []);
    }
    return response(401, { message: 'unexpected_auth_or_filter' });
  };
  return requests;
}

try {
  configureEnv();
  const methodFailure = await handler(request({ method: 'POST' }));
  assert.equal(methodFailure.status, 405, 'non-GET methods are rejected');

  delete process.env.RESILIENCE_OPERATIONAL_TOKEN;
  const missingOperator = await handler(request());
  assert.equal(missingOperator.status, 503, 'unconfigured operator token blocks the probe');
  assert.equal((await missingOperator.json()).error, 'operational_token_not_configured');

  process.env.RESILIENCE_OPERATIONAL_TOKEN = 'operator-test-token';
  const invalidOperator = await handler(request({ operatorToken: 'wrong-token' }));
  assert.equal(invalidOperator.status, 401, 'wrong operator token is rejected');

  const missingBearer = await handler(request({ bearerToken: null }));
  assert.equal(missingBearer.status, 401, 'user JWT is required');

  delete process.env.SUPABASE_URL;
  const missingConfig = await handler(request());
  assert.equal(missingConfig.status, 503, 'missing Supabase config blocks the probe');
  assert.match((await missingConfig.json()).missing.join(','), /SUPABASE_URL/);
  process.env.SUPABASE_URL = 'https://supabase.example.test';

  const seedRequests = mockSupabase({ missingForeignSeed: true });
  const missingSeed = await handler(request());
  assert.equal(missingSeed.status, 503, 'foreign tenant seed must exist before isolation is measured');
  assert.equal((await missingSeed.json()).error, 'foreign_canary_seed_missing');
  assert.equal(seedRequests.some((entry) => entry.method === 'POST'), false, 'no health evidence is written without a foreign seed');

  const successfulRequests = mockSupabase();
  const success = await handler(request());
  assert.equal(success.status, 200, 'isolated foreign tenant returns healthy');
  assert.equal((await success.json()).isolated, true);
  const successfulEvidence = successfulRequests.find((entry) => entry.method === 'POST');
  assert.ok(successfulEvidence, 'the result is persisted as an operational health snapshot');
  const evidenceBody = JSON.parse(successfulEvidence.body);
  assert.equal(evidenceBody.company_id, 'own-company');
  assert.equal(evidenceBody.component, 'tenant-isolation-canary');
  assert.equal(evidenceBody.status, 'healthy');
  assert.equal(evidenceBody.metadata.foreign_rows_visible, 0);

  const leakingRequests = mockSupabase({ leakForeignRows: true });
  const leak = await handler(request());
  assert.equal(leak.status, 500, 'cross-tenant visibility must fail the probe');
  assert.equal((await leak.json()).isolated, false);
  const leakEvidence = leakingRequests.find((entry) => entry.method === 'POST');
  assert.ok(leakEvidence, 'cross-tenant failure is persisted');
  assert.equal(JSON.parse(leakEvidence.body).status, 'critical');

  const failingRequests = [];
  globalThis.fetch = async (url, options = {}) => {
    failingRequests.push({ url: String(url), method: options.method });
    throw new Error('sensitive upstream failure detail');
  };
  const upstreamFailure = await handler(request());
  assert.equal(upstreamFailure.status, 503, 'upstream errors fail closed');
  const upstreamFailureBody = await upstreamFailure.json();
  assert.equal(upstreamFailureBody.error, 'tenant_canary_probe_failed');
  assert.doesNotMatch(JSON.stringify(upstreamFailureBody), /sensitive upstream failure detail/);
  assert.equal(failingRequests.length, 1, 'the failed external read is not retried or duplicated');

  const toml = fs.readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
  assert.match(
    toml,
    /\[\[redirects\]\]\s+from = "\/api\/tenant-canary"\s+to = "\/\.netlify\/functions\/tenant-canary"\s+status = 200\s+force = true/,
    'the public API path routes to the Netlify function before the SPA fallback',
  );

  console.log('Netlify tenant-canary runtime tests: PASS');
  console.log('  - method and operator-token guards fail closed');
  console.log('  - authenticated tenant identity and foreign-seed prerequisites are required');
  console.log('  - own/foreign reads use user JWT; evidence write remains scoped to own company');
  console.log('  - detected cross-tenant rows persist critical evidence and fail');
  console.log('  - upstream details are not leaked');
  console.log('  - /api/tenant-canary routes to the function rather than the SPA');
} finally {
  globalThis.fetch = originalFetch;
  restoreEnv();
}
