import fs from 'node:fs';
import path from 'node:path';
import { BUSINESS_METRICS } from '../src/lib/semanticMetrics.ts';
import { SEMANTIC_METRIC_REGISTRY, getSemanticMetric, validateSemanticMetricRegistry } from '../src/lib/semantic-metric-registry.ts';
import { evaluateMetric } from '../src/lib/metricEngine.ts';
import { semanticMetricIsFresh } from '../src/lib/semantic-metric-service.ts';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

assert(SEMANTIC_METRIC_REGISTRY.length === BUSINESS_METRICS.length, 'registry must cover every BUSINESS_METRICS definition');
assert(SEMANTIC_METRIC_REGISTRY.every((entry) => BUSINESS_METRICS.some((metric) => entry.key === metric.key && entry.formula === metric.formula)), 'registry must reuse canonical metric formulas');
assert(validateSemanticMetricRegistry().length === 0, `registry integrity failed: ${validateSemanticMetricRegistry().join('; ')}`);

const golden = ['metric.net_sales', 'metric.gross_profit', 'metric.receivables', 'metric.inventory_value', 'metric.stockout_risk'];
for (const metricId of golden) {
  const definition = getSemanticMetric(metricId);
  assert(Boolean(definition), `golden metric missing: ${metricId}`);
  assert(Boolean(definition?.formula), `golden metric formula missing: ${metricId}`);
  assert(Boolean(definition?.evidence?.length), `golden metric evidence missing: ${metricId}`);
  assert((definition?.version ?? 0) >= 1, `golden metric version invalid: ${metricId}`);
}

const first = evaluateMetric({ key: 'net_sales', value: 350, confidence: 1, sourceRows: 10, timeSemantic: 'transaction' });
const second = evaluateMetric({ key: 'net_sales', value: 350, confidence: 1, sourceRows: 10, timeSemantic: 'transaction' });
assert(first.value === 350 && second.value === 350, 'deterministic metric execution changed result');
assert(first.metricId === 'metric.net_sales' && first.metricVersion === second.metricVersion, 'metric execution is not bound to semantic identity/version');
try { evaluateMetric({ key: 'inventory_value', value: 100, timeSemantic: 'transaction' }); failures.push('time-semantic mismatch was accepted'); } catch {}
assert(semanticMetricIsFresh(null, new Date().toISOString()) === 'UNKNOWN', 'missing governance must yield UNKNOWN freshness');
const governance = { freshness: { maxAgeMinutes: 15 } };
const asOf = new Date(Date.now() - 5 * 60 * 1000).toISOString();
assert(semanticMetricIsFresh(governance, asOf) === 'FRESH', 'freshness policy failed to classify fresh data');
const staleAsOf = new Date(Date.now() - 30 * 60 * 1000).toISOString();
assert(semanticMetricIsFresh(governance, staleAsOf) === 'STALE', 'freshness policy failed to classify stale data');

const registry = read('src/lib/semantic-metric-registry.ts');
const service = read('src/lib/semantic-metric-service.ts');
const engine = read('src/lib/metricEngine.ts');
const inspector = read('src/pages/MetricInspectorPage.tsx');
const governanceMigration = read('supabase/migrations/20260828150000_semantic_metric_governance.sql');
const tenantRlsMigration = read('supabase/migrations/20260828153000_metric_governance_tenant_rls.sql');
const tenantUniqueMigration = read('supabase/migrations/20260828160000_metric_governance_tenant_unique.sql');

assert(registry.includes('BUSINESS_METRICS.map'), 'registry is not derived from BUSINESS_METRICS');
assert(service.includes("from('metric_governance')") && service.includes('getSemanticMetric('), 'service contract is not persistence + SSOT backed');
assert(engine.includes('getSemanticMetric(input.key)') && engine.includes('metricVersion'), 'metric engine is not semantically bound');
assert(inspector.includes('listSemanticMetricContracts') && inspector.includes('dir="rtl"'), 'Metric Inspector entry point missing');
for (const token of ['DRAFT','REVIEWED','CERTIFIED','DEPRECATED','metric_governance_audit','metric_governance_guard_certified_update','private.metric_governance_transition']) {
  assert(governanceMigration.includes(token), `governance persistence/lifecycle artifact missing: ${token}`);
}
assert(governanceMigration.includes('company_id uuid NOT NULL'), 'governance persistence lacks tenant key');
assert(tenantRlsMigration.includes('company_id = public.current_company_id()'), 'tenant RLS policy is not canonical');
assert(tenantUniqueMigration.includes('company_id, metric_id, version'), 'tenant-scoped metric version uniqueness is missing');

if (failures.length) {
  console.error(`W2.1 semantic metric acceptance: FAIL (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('W2.1 semantic metric acceptance: PASS');
console.log(`- BUSINESS_METRICS SSOT coverage: ${BUSINESS_METRICS.length}/${SEMANTIC_METRIC_REGISTRY.length}`);
console.log('- Golden metrics: 5/5');
console.log('- Deterministic execution: PASS');
console.log('- Time semantics: PASS');
console.log('- Freshness: PASS');
console.log('- Persistence + lifecycle + tenant RLS: PASS');
console.log('- Service contract + Metric Inspector: PASS');
