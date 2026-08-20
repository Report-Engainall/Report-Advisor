import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');
const required = [
  'src/App.tsx',
  'src/lib/tenantContext.ts',
  'src/lib/inventory-intelligence.ts',
  'src/lib/semanticMetrics.ts',
  'src/lib/intelligence/groupDemand.ts',
  'src/lib/intelligence/inventoryEngine.ts',
  'src/lib/free-toolbox/time-series.ts',
  'src/lib/free-toolbox/executive-scorecard.ts',
  'supabase/migrations/20260820010000_multitenant_security.sql',
  'supabase/migrations/20260820020000_security_hardening.sql',
];
for (const path of required) assert.ok(fs.existsSync(path), `missing production invariant file: ${path}`);

const app = read('src/App.tsx');
for (const route of ['/cockpit','/inventory/intelligence','/finance/intelligence','/metrics','/decisions','/chat','/reports/studio','/intelligence/recommendations']) {
  assert.match(app, new RegExp(`path=["']${route.replaceAll('/', '\\/')}["']`), `missing route ${route}`);
}
assert.match(app, /resolveTenantContext\(/, 'tenant bootstrap missing');
assert.match(app, /authenticated&&tenantReady/, 'tenant readiness gate missing');

const tenant = read('src/lib/tenantContext.ts');
assert.match(tenant, /from\('tenant_memberships'\)/, 'membership lookup missing');
assert.match(tenant, /eq\('user_id', user\.id\)/, 'membership must be user scoped');
assert.match(tenant, /eq\('status', 'active'\)/, 'inactive memberships must be excluded');

const inventory = read('src/lib/inventory-intelligence.ts');
assert.match(inventory, /aggregateByProduct/, 'inventory aggregation missing');
assert.match(inventory, /current\.stock \+= stock/, 'warehouse balances must be additive');
assert.doesNotMatch(inventory, /quantity\) > Number\(current\.quantity\)/, 'largest-warehouse selection must never return');

const semantic = read('src/lib/semanticMetrics.ts');
assert.match(semantic, /key:'cash_position'.*dependencies:\['payments'\]/s, 'cash metric dependency drift');
assert.match(semantic, /key:'stockout_risk'.*unit:'percent'/s, 'stockout risk unit drift');
assert.match(semantic, /MIN\(100, MAX\(0,/, 'stockout risk must be bounded');

const group = read('src/lib/intelligence/groupDemand.ts');
assert.match(group, /new Set<string>/, 'alternative members must be deduplicated');
assert.match(group, /normalizedDemand/, 'group demand normalization missing');
assert.match(group, /normalizedStock/, 'group stock normalization missing');
assert.match(group, /recommendedOrder/, 'group reorder recommendation missing');

console.log('production invariants: PASS');
