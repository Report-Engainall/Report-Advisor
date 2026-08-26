#!/usr/bin/env node
/**
 * Live Gross Profit runtime adapter.
 *
 * This deliberately uses the existing certification primitives (CERT_* + JWT)
 * and the live Supabase REST boundary. Expected values are supplied by an
 * independent fixture; this file never imports canonicalFinancialQueries.
 */

const required = [
  'CERT_SUPABASE_URL',
  'CERT_SUPABASE_ANON_KEY',
  'CERT_TENANT_A_ID',
  'CERT_TENANT_B_ID',
  'CERT_USER_A_JWT',
  'CERT_USER_B_JWT',
];

for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required runtime secret: ${name}`);
}

const base = process.env.CERT_SUPABASE_URL.replace(/\/$/, '');
const headers = (jwt) => ({
  apikey: process.env.CERT_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${jwt}`,
});

async function request(path, jwt) {
  const response = await fetch(`${base}${path}`, { headers: headers(jwt) });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: response.status, ok: response.ok, body };
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function independentExpected(rows) {
  // Fixture/domain arithmetic is intentionally independent from application code.
  const revenue = rows.reduce((s, r) => s + Number(r.line_total), 0);
  const quantity = rows.reduce((s, r) => s + Number(r.quantity), 0);
  const hasMissingCost = rows.some((r) => r.cost_price === null || r.cost_price === undefined);
  const cost = hasMissingCost ? null : rows.reduce((s, r) => s + Number(r.cost_price) * Number(r.quantity), 0);
  return { revenue, cost, gross_profit: cost === null ? null : revenue - cost, quantity,
    status: hasMissingCost ? 'INSUFFICIENT_DATA' : 'CALCULABLE' };
}

const fixture = JSON.parse(process.env.GP_RUNTIME_FIXTURE_JSON || '[]');
if (!Array.isArray(fixture) || fixture.length === 0) {
  throw new Error('GP_RUNTIME_FIXTURE_JSON must contain the deterministic live fixture rows.');
}

const tenants = [
  { name: 'A', id: process.env.CERT_TENANT_A_ID, jwt: process.env.CERT_USER_A_JWT },
  { name: 'B', id: process.env.CERT_TENANT_B_ID, jwt: process.env.CERT_USER_B_JWT },
];

const results = [];

for (const tenant of tenants) {
  const expectedRows = fixture.filter((r) => r.tenant_id === tenant.id);
  const expected = independentExpected(expectedRows);

  // Real data boundary: read the underlying sale_items through the authenticated tenant.
  // The result is intentionally raw; no canonical financial query is used here.
  const query = `/rest/v1/sale_items?tenant_id=eq.${encodeURIComponent(tenant.id)}&select=id,tenant_id,line_total,cost_price,quantity,created_at&order=created_at.asc`;
  const actualResponse = await request(query, tenant.jwt);
  const rows = Array.isArray(actualResponse.body) ? actualResponse.body : [];
  const actual = {
    revenue: rows.reduce((s, r) => s + Number(r.line_total ?? 0), 0),
    cost: rows.some((r) => r.cost_price == null) ? null : rows.reduce((s, r) => s + Number(r.cost_price) * Number(r.quantity), 0),
    gross_profit: rows.some((r) => r.cost_price == null) ? null : rows.reduce((s, r) => s + Number(r.line_total) - Number(r.cost_price) * Number(r.quantity), 0),
    quantity: rows.reduce((s, r) => s + Number(r.quantity ?? 0), 0),
    row_count: rows.length,
  };

  results.push({
    timestamp: new Date().toISOString(),
    surface: 'authenticated-live-data-boundary',
    tenant: tenant.name,
    tenant_id_hash: Buffer.from(tenant.id).toString('base64url').slice(0, 16),
    authenticated_execution: true,
    consumer: 'live Supabase sale_items REST boundary',
    query_identity: 'sale_items tenant-scoped REST select',
    expected,
    actual,
    comparison: JSON.stringify(actual) === JSON.stringify({ ...expected, row_count: actual.row_count }) ? 'PASS' : 'DIFF',
    source_rows: rows.length,
  });
}

// Explicit cross-tenant probes using the opposite JWTs. Do not infer security from query text.
for (const [from, target] of [[tenants[0], tenants[1]], [tenants[1], tenants[0]]]) {
  const query = `/rest/v1/sale_items?tenant_id=eq.${encodeURIComponent(target.id)}&select=id,tenant_id,line_total,cost_price,quantity`;
  const response = await request(query, from.jwt);
  const rows = Array.isArray(response.body) ? response.body : [];
  results.push({
    timestamp: new Date().toISOString(),
    surface: 'tenant-isolation',
    from_tenant: from.name,
    target_tenant: target.name,
    authenticated_execution: true,
    query_identity: 'cross-tenant sale_items REST probe',
    status: response.status,
    returned_rows: rows.length,
    result: rows.length === 0 || response.status >= 400 ? 'PASS' : 'FAIL',
  });
}

const artifact = {
  schema: 'gross-profit-runtime-results/v1',
  generated_at: new Date().toISOString(),
  secrets_included: false,
  results,
};

process.stdout.write(`${JSON.stringify(artifact, null, 2)}\n`);
