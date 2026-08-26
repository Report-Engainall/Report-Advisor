import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migration = path.join(root, 'supabase', 'migrations', '20260826093000_inventory_intelligence_tenant_authority.sql');
const source = fs.readFileSync(migration, 'utf8');

const failures = [];
const oldSignatures = [
  'inventory_liquidity_velocity(uuid,date,integer)',
  'demand_reorder_snapshot(uuid,date,integer,numeric,numeric)',
  'cash_liquidity_snapshot(uuid,date,date)',
];
for (const signature of oldSignatures) {
  if (!source.includes(`DROP FUNCTION IF EXISTS public.${signature};`)) failures.push(`missing explicit drop for ${signature}`);
}
for (const name of ['inventory_liquidity_velocity', 'demand_reorder_snapshot', 'cash_liquidity_snapshot']) {
  if (!source.includes('public.current_company_id()')) failures.push(`${name}: current_company_id() missing`);
  if (!source.includes(`GRANT EXECUTE ON FUNCTION public.${name}`)) failures.push(`${name}: authenticated grant missing`);
}
if (/p_company_id\s+uuid/i.test(source)) failures.push('inventory intelligence migration must not introduce caller-supplied p_company_id');
if (/SECURITY\s+DEFINER/i.test(source)) failures.push('inventory intelligence RPCs must remain SECURITY INVOKER');

if (failures.length) {
  console.error('INVENTORY_INTELLIGENCE_TENANT_AUTHORITY_FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('INVENTORY_INTELLIGENCE_TENANT_AUTHORITY_PASS');
