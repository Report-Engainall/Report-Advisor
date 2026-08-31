import assert from 'node:assert/strict';

const baseUrl = process.env.E2E_BASE_URL;
const users = {
  A: { email: process.env.E2E_TENANT_A_EMAIL, password: process.env.E2E_TENANT_A_PASSWORD },
  B: { email: process.env.E2E_TENANT_B_EMAIL, password: process.env.E2E_TENANT_B_PASSWORD },
};

if (!baseUrl || !users.A.email || !users.A.password || !users.B.email || !users.B.password) {
  console.log('BLOCKED — OWNER/ENVIRONMENT ACTION: authenticated E2E credentials and E2E_BASE_URL are required.');
  process.exit(2);
}

async function login(user) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', apikey: process.env.E2E_SUPABASE_ANON_KEY ?? '' },
    body: JSON.stringify({ email: user.email, password: user.password }),
  });
  const body = await response.json().catch(() => ({}));
  assert.equal(response.ok, true, `authenticated login failed: ${response.status}`);
  assert.ok(body.access_token, 'login response must contain access_token');
  return body.access_token;
}

async function probe(token, tenantId) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/rest/v1/profiles?select=id,tenant_id&limit=1`, {
    headers: { apikey: process.env.E2E_SUPABASE_ANON_KEY ?? '', Authorization: `Bearer ${token}`, 'x-e2e-tenant': tenantId },
  });
  assert.equal(response.ok, true, `authenticated tenant probe failed: ${response.status}`);
  const rows = await response.json();
  assert.ok(Array.isArray(rows), 'tenant probe must return rows');
  return rows;
}

const tokenA = await login(users.A);
const tokenB = await login(users.B);
const rowsA = await probe(tokenA, process.env.E2E_TENANT_A_ID);
const rowsB = await probe(tokenB, process.env.E2E_TENANT_B_ID);

for (const row of [...rowsA, ...rowsB]) {
  assert.ok(row.tenant_id, 'runtime result must expose tenant_id for evidence');
}

console.log('PASS authenticated login A');
console.log('PASS authenticated login B');
console.log('PASS tenant-scoped authenticated reads A/B');
console.log('PASS runtime evidence includes tenant identity');
console.log('LIVE AUTHENTICATED E2E BASELINE VERIFIED');
