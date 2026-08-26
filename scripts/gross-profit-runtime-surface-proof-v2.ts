import { createServer, type ViteDevServer } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type Metrics = { revenue: number | null; cost: number | null; grossProfit: number | null; quantity: number | null; status: string };
type Evidence = {
  timestamp: string; surface: string; tenant: string; authenticatedExecution: string;
  consumer: string; queryIdentity: string; actual: Metrics | null; expected: Metrics | null;
  comparison: 'PASS' | 'FAIL' | 'NOT PROVEN'; classification: string;
  nullMissingStatus: string; dateBoundaryStatus: string; exportRowCount: number | null; note?: string;
};

const required = ['CERT_SUPABASE_URL','CERT_SUPABASE_ANON_KEY','CERT_TENANT_A_ID','CERT_TENANT_B_ID','CERT_USER_A_JWT','CERT_USER_B_JWT'] as const;
const fixturePath = resolve(process.cwd(), 'scripts/fixtures/gross-profit-runtime-fixture.json');
const fixture = JSON.parse(await readFile(fixturePath, 'utf8')) as { scenarios: Record<string, { tenant: string; expected: Metrics }> };
const missingConfig = required.filter(key => !process.env[key]?.trim());

const writeArtifact = async (evidence: Evidence[], closure = 'NOT PROVEN') => {
  await writeFile(resolve(process.cwd(), 'gross-profit-runtime-results.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    targetHead: process.env.GITHUB_SHA ?? 'unknown',
    auth: 'authenticated JWT execution; token values redacted',
    independentFixture: fixture,
    evidence,
    closure,
  }, null, 2) + '\n');
};

if (missingConfig.length) {
  const evidence: Evidence[] = [{
    timestamp: new Date().toISOString(), surface: 'ALL', tenant: 'A/B',
    authenticatedExecution: 'NOT EXECUTED', consumer: 'NOT EXECUTED', queryIdentity: 'NOT EXECUTED',
    actual: null, expected: null, comparison: 'NOT PROVEN', classification: 'RUNTIME BLOCKED',
    nullMissingStatus: 'NOT PROVEN', dateBoundaryStatus: 'NOT PROVEN', exportRowCount: null,
    note: `Missing required live certification configuration: ${missingConfig.join(', ')}`,
  }];
  await writeArtifact(evidence);
  console.error(`RUNTIME BLOCKED: missing live certification configuration: ${missingConfig.join(', ')}`);
  process.exit(10);
}

const baseUrl = process.env.CERT_SUPABASE_URL!.replace(/\/$/, '');
const anonKey = process.env.CERT_SUPABASE_ANON_KEY!;
process.env.VITE_SUPABASE_URL = baseUrl;
process.env.VITE_SUPABASE_ANON_KEY = anonKey;
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

const server: ViteDevServer = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const evidence: Evidence[] = [];
const sameMetrics = (a: Metrics, b: Metrics) => a.revenue === b.revenue && a.cost === b.cost && a.grossProfit === b.grossProfit && a.quantity === b.quantity && a.status === b.status;

async function loadDashboardConsumer() {
  const mod = await server.ssrLoadModule('/src/lib/queries.ts');
  if (typeof mod.fetchDashboardKPIs !== 'function') throw new Error('PRODUCTION_CONSUMER_NOT_FOUND:fetchDashboardKPIs');
  return mod.fetchDashboardKPIs as () => Promise<any>;
}

async function proveDashboard(tenantLabel: 'A' | 'B', jwt: string, expectedKey: string) {
  activeJwt = jwt;
  const consumer = await loadDashboardConsumer();
  const actual = await consumer();
  const metrics: Metrics = {
    revenue: typeof actual.totalSales === 'number' ? actual.totalSales : null,
    cost: typeof actual.totalCost === 'number' ? actual.totalCost : null,
    grossProfit: typeof actual.grossProfit === 'number' ? actual.grossProfit : null,
    quantity: typeof actual.totalQuantity === 'number' ? actual.totalQuantity : null,
    status: String(actual.status),
  };
  const expected = fixture.scenarios[expectedKey]?.expected ?? null;
  const pass = expected !== null && sameMetrics(metrics, expected);
  evidence.push({
    timestamp: new Date().toISOString(), surface: 'Dashboard', tenant: tenantLabel,
    authenticatedExecution: `CERT_USER_${tenantLabel}_JWT (redacted)`,
    consumer: 'production fetchDashboardKPIs()', queryIdentity: 'src/lib/queries.ts:fetchDashboardKPIs',
    actual: metrics, expected, comparison: pass ? 'PASS' : 'FAIL',
    classification: pass ? 'NONE' : 'REAL TRUTH BUG OR LIVE DATA/INDEPENDENT FIXTURE MISMATCH — ROOT CAUSE REQUIRED',
    nullMissingStatus: metrics.cost === null || metrics.grossProfit === null ? 'NULL/UNKNOWN' : 'NUMERIC',
    dateBoundaryStatus: 'NOT PROVEN — current production consumer has no date-range argument', exportRowCount: null,
  });
}

try {
  await proveDashboard('A', process.env.CERT_USER_A_JWT!, 'tenantAComplete');
  await proveDashboard('B', process.env.CERT_USER_B_JWT!, 'tenantBComplete');

  for (const surface of ['Reports', 'Executive Decision'] as const) {
    evidence.push({
      timestamp: new Date().toISOString(), surface, tenant: 'A/B',
      authenticatedExecution: 'JWT not executed for this surface because no independent authenticated production consumer was proven',
      consumer: 'NOT PROVEN', queryIdentity: 'No independent surface consumer established by the current source topology',
      actual: null, expected: null, comparison: 'NOT PROVEN',
      classification: surface === 'Executive Decision'
        ? 'EXECUTIVE ENTRYPOINT NOT PROVEN — an executive pipeline implementation exists, but no actual UI/action consumer reference was found'
        : 'REPORTS GP CONSUMER NOT PROVEN — current report surface reuses dashboard KPI reads and cannot be treated as an independent GP consumer',
      nullMissingStatus: 'NOT PROVEN', dateBoundaryStatus: 'NOT PROVEN', exportRowCount: null,
    });
  }

  evidence.push({
    timestamp: new Date().toISOString(), surface: 'Export', tenant: 'A/B',
    authenticatedExecution: 'NOT EXECUTED', consumer: 'NO CONNECTED GROSS-PROFIT EXPORT CONSUMER FOUND',
    queryIdentity: 'ReportsPage Download control has no proven execution path to an exporter',
    actual: null, expected: null, comparison: 'NOT PROVEN', classification: 'EXPORT CONSUMER ABSENT/DISCONNECTED',
    nullMissingStatus: 'NOT PROVEN', dateBoundaryStatus: 'NOT PROVEN', exportRowCount: null,
    note: '25 > 20 presentation completeness is NOT PROVEN; no substitute raw query/export utility is accepted as the missing consumer.',
  });

  evidence.push({
    timestamp: new Date().toISOString(), surface: 'Cross-Surface', tenant: 'A/B',
    authenticatedExecution: 'PARTIAL', consumer: 'Dashboard only', queryIdentity: 'Independent consumer chain not established for Reports/Executive/Export',
    actual: null, expected: null, comparison: 'NOT PROVEN', classification: 'CROSS-SURFACE EQUIVALENCE NOT PROVEN',
    nullMissingStatus: 'NOT PROVEN', dateBoundaryStatus: 'NOT PROVEN', exportRowCount: null,
  });

  await writeArtifact(evidence);
  const nonPass = evidence.filter(e => e.comparison !== 'PASS');
  console.log(`FAIL-CLOSED: ${nonPass.length} Gross Profit evidence records are not PASS.`);
  process.exitCode = 10;
} finally {
  await server.close();
}
