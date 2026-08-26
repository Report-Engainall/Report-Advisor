import { createServer, type ViteDevServer } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type Metrics = {
  revenue: number | null;
  cost: number | null;
  grossProfit: number | null;
  quantity: number | null;
  status: string;
};

type Evidence = {
  timestamp: string;
  surface: string;
  tenant: string;
  authenticatedExecution: string;
  consumer: string;
  queryIdentity: string;
  actual: Metrics | null;
  expected: Metrics | null;
  comparison: 'PASS' | 'FAIL' | 'NOT PROVEN';
  classification: string;
  nullMissingStatus: string;
  dateBoundaryStatus: string;
  exportRowCount: number | null;
  note?: string;
};

const required = [
  'CERT_SUPABASE_URL',
  'CERT_SUPABASE_ANON_KEY',
  'CERT_TENANT_A_ID',
  'CERT_TENANT_B_ID',
  'CERT_USER_A_JWT',
  'CERT_USER_B_JWT',
] as const;

for (const key of required) {
  if (!process.env[key]?.trim()) throw new Error(`RUNTIME_CONFIG_MISSING:${key}`);
}

const baseUrl = process.env.CERT_SUPABASE_URL!.replace(/\/$/, '');
const anonKey = process.env.CERT_SUPABASE_ANON_KEY!;
// Vite SSR loads the real production module; these are only the existing live certification values mapped to Vite's browser env names.
process.env.VITE_SUPABASE_URL = baseUrl;
process.env.VITE_SUPABASE_ANON_KEY = anonKey;

const fixturePath = resolve(process.cwd(), 'scripts/fixtures/gross-profit-runtime-fixture.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8')) as {
  scenarios: Record<string, { tenant: string; expected: Metrics }>;
};

let activeJwt = '';
const nativeFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  if (url.startsWith(`${baseUrl}/`)) {
    headers.set('apikey', anonKey);
    headers.set('Authorization', `Bearer ${activeJwt}`);
  }
  return nativeFetch(input, { ...init, headers });
};

const server: ViteDevServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

const evidence: Evidence[] = [];

function sameMetrics(actual: Metrics, expected: Metrics): boolean {
  return actual.revenue === expected.revenue
    && actual.cost === expected.cost
    && actual.grossProfit === expected.grossProfit
    && actual.quantity === expected.quantity
    && actual.status === expected.status;
}

async function loadProductionConsumer() {
  // This imports the exact production consumer used by the real UI surfaces. No query is duplicated here.
  const mod = await server.ssrLoadModule('/src/lib/queries.ts');
  if (typeof mod.fetchDashboardKPIs !== 'function') throw new Error('PRODUCTION_CONSUMER_NOT_FOUND:fetchDashboardKPIs');
  return mod.fetchDashboardKPIs as () => Promise<any>;
}

async function executeTenant(tenantLabel: 'A' | 'B', jwt: string, expectedKey: string) {
  activeJwt = jwt;
  const fetchDashboardKPIs = await loadProductionConsumer();
  const actual = await fetchDashboardKPIs();
  const metrics: Metrics = {
    revenue: typeof actual.totalSales === 'number' ? actual.totalSales : null,
    cost: typeof actual.totalCost === 'number' ? actual.totalCost : null,
    grossProfit: typeof actual.grossProfit === 'number' ? actual.grossProfit : null,
    quantity: null,
    status: String(actual.status),
  };
  const expected = fixture.scenarios[expectedKey]?.expected ?? null;

  const surfaces = [
    { surface: 'Dashboard', consumer: 'DashboardPage -> fetchDashboardKPIs()', query: 'src/lib/queries.ts:fetchDashboardKPIs' },
    { surface: 'Reports', consumer: 'ReportsPage/SalesReportPage -> fetchDashboardKPIs()', query: 'src/lib/queries.ts:fetchDashboardKPIs' },
    { surface: 'Executive Decision', consumer: 'ExecutiveCommandCenterPage -> fetchDashboardKPIs()', query: 'src/lib/queries.ts:fetchDashboardKPIs' },
  ];

  for (const s of surfaces) {
    const pass = expected ? sameMetrics(metrics, expected) : false;
    evidence.push({
      timestamp: new Date().toISOString(),
      surface: s.surface,
      tenant: tenantLabel,
      authenticatedExecution: `CERT_USER_${tenantLabel}_JWT (redacted)`,
      consumer: s.consumer,
      queryIdentity: s.query,
      actual: metrics,
      expected,
      comparison: pass ? 'PASS' : 'FAIL',
      classification: pass ? 'NONE' : 'REAL TRUTH BUG OR FIXTURE/ENVIRONMENT MISMATCH — ROOT CAUSE REQUIRED',
      nullMissingStatus: metrics.cost === null || metrics.grossProfit === null ? 'NULL/UNKNOWN' : 'NUMERIC',
      dateBoundaryStatus: 'NOT PROVEN — production consumer has no date-range argument',
      exportRowCount: null,
    });
  }
}

try {
  await executeTenant('A', process.env.CERT_USER_A_JWT!, 'tenantAComplete');
  await executeTenant('B', process.env.CERT_USER_B_JWT!, 'tenantBComplete');

  evidence.push({
    timestamp: new Date().toISOString(),
    surface: 'Export',
    tenant: 'A/B',
    authenticatedExecution: 'CERT_USER_A_JWT / CERT_USER_B_JWT (redacted)',
    consumer: 'NO CONNECTED GROSS-PROFIT EXPORT CONSUMER FOUND',
    queryIdentity: 'src/pages/ReportsPage.tsx export button is not wired to an execution path on target HEAD',
    actual: null,
    expected: null,
    comparison: 'NOT PROVEN',
    classification: 'NO INDEPENDENT GP CONSUMER FOUND',
    nullMissingStatus: 'NOT PROVEN',
    dateBoundaryStatus: 'NOT PROVEN',
    exportRowCount: null,
    note: 'Do not substitute report-export utilities or raw queries for a missing surface consumer. 25 > 20 completeness therefore remains NOT PROVEN.',
  });

  const tenantA = evidence.filter(e => e.tenant === 'A');
  const tenantB = evidence.filter(e => e.tenant === 'B');
  const tenantIsolation = tenantA.every(e => e.actual !== null) && tenantB.every(e => e.actual !== null);

  const artifact = {
    generatedAt: new Date().toISOString(),
    targetHead: process.env.GITHUB_SHA ?? 'unknown',
    auth: 'authenticated JWT execution; token values redacted',
    independentFixture: fixture,
    evidence,
    tenantIsolation: tenantIsolation ? 'SURFACE EXECUTION OBSERVED FOR A AND B; CROSS-TENANT DENIAL REQUIRES SEPARATE PROBE' : 'NOT PROVEN',
    closure: 'NOT PROVEN',
  };
  await writeFile(resolve(process.cwd(), 'gross-profit-runtime-results.json'), JSON.stringify(artifact, null, 2) + '\n');

  const failed = evidence.filter(e => e.comparison !== 'PASS');
  if (failed.length) {
    console.error(`FAIL-CLOSED: ${failed.length} runtime evidence records are not PASS/PROVEN`);
    process.exitCode = 10;
  }
} finally {
  await server.close();
}
