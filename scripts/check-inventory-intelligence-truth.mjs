import fs from 'node:fs';

const page = fs.readFileSync('src/pages/InventoryIntelligencePage.tsx', 'utf8');
const canonical = fs.readFileSync('src/lib/free-toolbox/inventory-intelligence-canonical.ts', 'utf8');
const migrations = fs.readdirSync('supabase/migrations')
  .filter((file) => file.endsWith('.sql') && file.includes('inventory_intelligence'))
  .map((file) => fs.readFileSync(`supabase/migrations/${file}`, 'utf8'))
  .join('\n');
const failures = [];

if (!page.includes('fetchInventoryIntelligenceSource')) failures.push('page is not wired to canonical inventory source');
if (/resolveCurrentCompanyId|supabase\.from\(|fetchProductDemandSeries/.test(page)) failures.push('inventory business/data reads leaked into page consumer');
if (/\.reduce\s*\(/.test(page)) failures.push('business aggregation leaked into page consumer');
if (/Math\.max\(0,/.test(page)) failures.push('page-level zero fallback detected');

if (!canonical.includes("supabase.rpc('inventory_intelligence_snapshot'")) failures.push('canonical adapter is not backed by authoritative snapshot RPC');
if (/resolveCurrentCompanyId|supabase\.from\(/.test(canonical)) failures.push('canonical adapter still contains direct tenant/data reads');
if (!canonical.includes('Number.isFinite')) failures.push('canonical adapter missing explicit numeric validation');
if (!canonical.includes('Number.NaN')) failures.push('canonical adapter missing unavailable metric semantics');

if (!migrations.includes('CREATE OR REPLACE FUNCTION public.inventory_intelligence_snapshot(')) failures.push('authoritative inventory snapshot function missing');
if (!migrations.includes('public.current_company_id()')) failures.push('snapshot does not derive tenant from canonical database resolver');
if (!migrations.includes('SECURITY DEFINER')) failures.push('snapshot must execute with explicit security boundary');
if (!migrations.includes('SET search_path = public')) failures.push('snapshot search_path is not pinned');
if (!migrations.includes('REVOKE ALL ON FUNCTION public.inventory_intelligence_snapshot(date, integer) FROM PUBLIC')) failures.push('snapshot public execute privilege is not revoked');
if (!migrations.includes('GRANT EXECUTE ON FUNCTION public.inventory_intelligence_snapshot(date, integer) TO authenticated')) failures.push('snapshot authenticated execute grant is missing');
if (!migrations.includes("inv.status IN ('confirmed', 'posted', 'paid')")) failures.push('snapshot status semantics are not explicit');
if (!migrations.includes('LEAST(GREATEST(COALESCE(p_days, 180), 1), 3650)')) failures.push('snapshot analysis period is not safely bounded');
if (!migrations.includes('LEFT JOIN stock')) failures.push('products without stock are incorrectly excluded from the canonical snapshot');
if (!migrations.includes('COUNT(DISTINCT m.group_id)')) failures.push('group cardinality is not calculated from distinct group memberships');
if (!migrations.includes('CASE WHEN membership_count = 1 THEN group_id ELSE NULL END')) failures.push('ambiguous group membership is not represented as NULL');
if (!migrations.includes('WHEN sales.total_quantity IS NULL THEN NULL')) failures.push('missing demand is being converted into a numeric value');
if (!migrations.includes('daily_demand')) failures.push('snapshot does not expose canonical daily demand');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('inventory intelligence authoritative truth regression: PASS');
