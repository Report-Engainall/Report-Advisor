import fs from 'node:fs';

const page = fs.readFileSync('src/pages/InventoryIntelligencePage.tsx', 'utf8');
const canonical = fs.readFileSync('src/lib/free-toolbox/inventory-intelligence-canonical.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20260827210000_inventory_intelligence_truth_hardening.sql', 'utf8');
const failures = [];

if (!page.includes('fetchInventoryIntelligenceSource')) failures.push('page is not wired to canonical inventory source');
if (/resolveCurrentCompanyId|supabase\.from\(|fetchProductDemandSeries/.test(page)) failures.push('inventory business/data reads leaked into page consumer');
if (/\.reduce\s*\(/.test(page)) failures.push('business aggregation leaked into page consumer');
if (/Math\.max\(0,/.test(page)) failures.push('page-level zero fallback detected');

if (!canonical.includes("supabase.rpc('inventory_intelligence_snapshot'")) failures.push('canonical adapter is not backed by authoritative snapshot RPC');
if (/resolveCurrentCompanyId|supabase\.from\(/.test(canonical)) failures.push('canonical adapter still contains direct tenant/data reads');
if (!canonical.includes('Number.isFinite')) failures.push('canonical adapter missing explicit numeric validation');
if (!canonical.includes('Number.NaN')) failures.push('canonical adapter missing unavailable metric semantics');

if (!migration.includes('CREATE OR REPLACE FUNCTION public.inventory_intelligence_snapshot(')) failures.push('authoritative inventory snapshot function missing');
if (!migration.includes('public.current_company_id()')) failures.push('snapshot does not derive tenant from canonical database resolver');
if (!migration.includes('SECURITY DEFINER')) failures.push('snapshot must execute with explicit security boundary');
if (!migration.includes('SET search_path = public')) failures.push('snapshot search_path is not pinned');
if (!migration.includes('REVOKE ALL ON FUNCTION public.inventory_intelligence_snapshot(date, integer) FROM PUBLIC')) failures.push('snapshot public execute privilege is not revoked');
if (!migration.includes('GRANT EXECUTE ON FUNCTION public.inventory_intelligence_snapshot(date, integer) TO authenticated')) failures.push('snapshot authenticated execute grant is missing');
if (!migration.includes("inv.status IN ('confirmed', 'posted', 'paid')")) failures.push('snapshot status semantics are not explicit');
if (!migration.includes('LEAST(GREATEST(COALESCE(p_days, 180), 1), 3650)')) failures.push('snapshot analysis period is not safely bounded');
if (!migration.includes('LEFT JOIN stock')) failures.push('products without stock are incorrectly excluded from the canonical snapshot');
if (!migration.includes('COUNT(DISTINCT m.group_id) = 1')) failures.push('ambiguous multi-group membership is not represented safely');
if (!migration.includes('WHEN sales.total_quantity IS NULL THEN NULL')) failures.push('missing demand is being converted into a numeric value');
if (!migration.includes('daily_demand')) failures.push('snapshot does not expose canonical daily demand');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('inventory intelligence authoritative truth regression: PASS');
