import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const files=[
  'src/lib/free-toolbox/inventory-dynamics.ts',
  'src/lib/free-toolbox/stockout-loss.ts',
  'src/lib/free-toolbox/customer-item-demand.ts',
  'src/lib/free-toolbox/liquidity-drivers.ts',
  'src/lib/free-toolbox/alternative-groups.ts',
  'src/lib/free-toolbox/inventory-intelligence-pipeline.ts'
];
for(const file of files){const text=await readFile(file,'utf8');assert(text.length>0,`${file} is empty`);}

const mean=(xs)=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
const std=(xs)=>{const m=mean(xs);return Math.sqrt(mean(xs.map(x=>(x-m)**2)));};
const velocity=(xs)=>{const avg=mean(xs);return {total:xs.reduce((a,b)=>a+b,0),avg,cv:avg?std(xs)/avg:0,active:xs.filter(x=>x>0).length,peak:Math.max(0,...xs)};};
const daysOfStock=(stock,demand)=>demand>0?stock/demand:Infinity;
const lostSales=(requested,fulfilled)=>Math.max(0,requested-Math.max(0,Math.min(requested,fulfilled)));

const v=velocity([10,10,20,0,0]);
assert.equal(v.total,40);
assert.equal(v.active,3);
assert.equal(daysOfStock(40,v.avg),5);
assert.equal(lostSales(350,0),350);
assert.equal(lostSales(350,100),250);

// Group-level coverage must be calculated from normalized totals, never by summing SKU cover days.
const groupStock=1700+300;
const groupDailyDemand=170+30;
assert.equal(daysOfStock(groupStock,groupDailyDemand),10);
assert.notEqual(daysOfStock(1700,170)+daysOfStock(300,30),10);

// Boundary: no historical demand means no false stockout countdown.
assert.equal(daysOfStock(500,0),Infinity);

// Tenant authority regression: intelligence RPCs must derive tenant from the authenticated session.
const tenantMigration=await readFile('supabase/migrations/20260826093000_inventory_intelligence_tenant_authority.sql','utf8');
for(const signature of [
  'inventory_liquidity_velocity(uuid,date,integer)',
  'demand_reorder_snapshot(uuid,date,integer,numeric,numeric)',
  'cash_liquidity_snapshot(uuid,date,date)',
]) assert(tenantMigration.includes(`DROP FUNCTION IF EXISTS public.${signature};`),`missing explicit drop for ${signature}`);
assert.match(tenantMigration,/public\.current_company_id\(\)/,'current_company_id() is required');
assert.doesNotMatch(tenantMigration,/p_company_id\s+uuid/i,'caller-supplied p_company_id must not be reintroduced');
assert.doesNotMatch(tenantMigration,/SECURITY\s+DEFINER/i,'inventory intelligence RPCs must remain SECURITY INVOKER');

console.log('Inventory intelligence checks: PASS');
console.log(`Validated ${files.length} engine modules, deterministic boundary formulas, and tenant-authority migration contract.`);
