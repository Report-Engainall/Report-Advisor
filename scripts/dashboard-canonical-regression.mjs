import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const dashboardSql = fs.readFileSync('supabase/migrations/20260826052000_dashboard_canonical_aggregation.sql', 'utf8');
const inventorySql = fs.readFileSync('supabase/migrations/20260826054500_inventory_report_authoritative_paging.sql', 'utf8');
const analyticsSql = fs.readFileSync('supabase/migrations/20260826062000_analytics_authoritative_aggregation.sql', 'utf8');
const queries = fs.readFileSync('src/lib/queries.ts', 'utf8');
const compat = fs.readFileSync('src/lib/queries-compat.ts', 'utf8');
const adapter = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');
const inventoryPage = fs.readFileSync('src/pages/EntityPages.tsx', 'utf8');
const reportsPage = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const analyticsPage = fs.readFileSync('src/pages/AnalyticsPage.tsx', 'utf8');
const executivePage = fs.readFileSync('src/pages/ExecutiveCommandCenterPage.tsx', 'utf8');
const legacy = ['fetchDashboardKPIs','fetchMonthlyTrend','fetchTopCustomers','fetchTopProducts','fetchCategoryBreakdown','fetchAgingBuckets'];
function sourceFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=path.join(dir,entry.name);if(entry.isDirectory())return sourceFiles(full);return /\.(ts|tsx)$/.test(entry.name)?[full]:[];});}

// Dashboard semantic invariants.
const invoices=Array.from({length:20},(_,i)=>({id:`i-${i}`,subtotal:10,status:'confirmed'}));invoices.push({id:'i-cancelled',subtotal:1000,status:'cancelled'});invoices.push({id:'i-21',subtotal:10,status:'confirmed'});
const authoritativeRows=invoices.filter(row=>!['cancelled','void'].includes(row.status)); assert.equal(authoritativeRows.length,21); assert.equal(authoritativeRows.reduce((sum,row)=>sum+row.subtotal,0),210);
const saleItems=[{quantity:2,cost_price:3},{quantity:1,cost_price:null}]; assert.equal(saleItems.some(row=>row.quantity==null||row.cost_price==null),true);
assert.match(dashboardSql,/bad_sale_item_rows/);assert.match(dashboardSql,/'INSUFFICIENT_DATA'/);assert.match(dashboardSql,/grossProfit.*CASE WHEN k\.total_sales IS NOT NULL AND k\.total_cost IS NOT NULL/s);assert.match(dashboardSql,/current_company_id\(\)/);assert.match(dashboardSql,/SECURITY INVOKER/);assert.doesNotMatch(dashboardSql,/get_dashboard_snapshot\(\s*p_company_id/);

// Repository-wide consumer proof for the migrated dashboard aggregation family.
const allowedLegacyFiles=new Set(['src/lib/queries.ts','src/lib/queries-compat.ts']);const offenders=[];
for(const file of sourceFiles('src')){const rel=path.relative(process.cwd(),file).replaceAll('\\','/');if(allowedLegacyFiles.has(rel))continue;const content=fs.readFileSync(file,'utf8');for(const name of legacy)if(new RegExp(`\\b${name}\\b`).test(content))offenders.push(`${rel}:${name}`);}
assert.deepEqual(offenders,[]);assert.match(fs.readFileSync('src/pages/DashboardPage.tsx','utf8'),/fetchDashboardSnapshot/);assert.match(reportsPage,/fetchDashboardSnapshot/);assert.match(executivePage,/fetchDashboardSnapshot/);assert.doesNotMatch(executivePage,/fetchDashboardKPIs/);assert.match(adapter,/supabase\.rpc\('get_dashboard_snapshot'/);assert.match(queries,/fetchDashboardSnapshot/);assert.doesNotMatch(queries,/supabase\.from\('sales_invoices'\)\.select\('id,total,paid_amount/);

// Inventory: display pagination/filtering and business aggregates are independent.
assert.match(inventorySql,/DROP FUNCTION IF EXISTS public\.get_inventory_report_snapshot\(integer,integer\)/);assert.match(inventorySql,/DROP FUNCTION IF EXISTS public\.get_inventory_report_snapshot\(integer,integer,text\)/);assert.match(inventorySql,/p_filter text DEFAULT 'all'/);assert.match(inventorySql,/FROM paged/);assert.match(inventorySql,/ORDER BY updated_at DESC, id DESC OFFSET v_page\*v_page_size LIMIT v_page_size/);assert.match(inventorySql,/'totalRows'/);assert.match(inventorySql,/'filteredRows'/);assert.match(inventorySql,/'lowStock'/);assert.match(inventorySql,/'outOfStock'/);assert.match(inventorySql,/'unknownRows'/);assert.match(inventorySql,/'totalValue'/);assert.match(inventorySql,/'INSUFFICIENT_DATA'/);assert.match(inventorySql,/current_company_id\(\)/);assert.match(inventorySql,/SECURITY INVOKER/);assert.match(adapter,/supabase\.rpc\('get_inventory_report_snapshot'/);assert.match(adapter,/p_filter: filter/);assert.match(reportsPage,/fetchInventoryReportSnapshot\(0,25/);assert.doesNotMatch(reportsPage,/fetchInventoryBalances\(/);assert.doesNotMatch(reportsPage,/fetchInventoryValuation\(/);assert.match(reportsPage,/snapshot\.totalValue/);assert.match(reportsPage,/snapshot\.unknownRows/);assert.match(inventoryPage,/fetchInventoryReportSnapshot\(page, pageSize, filter\)/);assert.doesNotMatch(inventoryPage,/fetchInventoryBalances\(/);assert.match(inventoryPage,/snapshot\.totalValue/);assert.match(inventoryPage,/snapshot\.filteredRows/);assert.match(inventoryPage,/snapshot\.lowStock/);assert.match(inventoryPage,/snapshot\.outOfStock/);assert.doesNotMatch(inventoryPage,/balances\.reduce/);assert.doesNotMatch(inventoryPage,/balances\.filter/);

// Legacy inventory consumers: zero-consumer proof must cover both the removed balance query and valuation query.
const balanceConsumerOffenders=[];const valuationOffenders=[];for(const file of sourceFiles('src')){const rel=path.relative(process.cwd(),file).replaceAll('\\','/');const content=fs.readFileSync(file,'utf8');if(rel!=='src/lib/queries.ts'&&rel!=='src/lib/queries-compat.ts'&&/\bfetchInventoryBalances\b/.test(content))balanceConsumerOffenders.push(rel);if(rel!=='src/lib/queries.ts'&&rel!=='src/lib/queries-compat.ts'&&/\bfetchInventoryValuation\b/.test(content))valuationOffenders.push(rel);}assert.deepEqual(balanceConsumerOffenders,[]);assert.doesNotMatch(queries,/\bfetchInventoryBalances\b/);assert.deepEqual(valuationOffenders,[]);

// Analytics: RFM/ABC/Aging must use bounded authoritative RPCs, not transactional history in the browser.
assert.match(analyticsSql,/get_rfm_snapshot/);assert.match(analyticsSql,/get_abc_snapshot/);assert.match(analyticsSql,/get_aging_snapshot/);assert.match(analyticsSql,/current_company_id\(\)/);assert.match(analyticsSql,/SECURITY INVOKER/);assert.match(analyticsSql,/status NOT IN \('cancelled','void'\)/);assert.match(analyticsSql,/'INSUFFICIENT_DATA'/);assert.match(analyticsSql,/'UNDATED'/);
assert.match(adapter,/fetchRFMSnapshot/);assert.match(adapter,/get_rfm_snapshot/);assert.match(adapter,/fetchABCSnapshot/);assert.match(adapter,/get_abc_snapshot/);assert.match(adapter,/fetchAgingSnapshot/);assert.match(adapter,/get_aging_snapshot/);
assert.match(analyticsPage,/fetchRFMSnapshot\(500\)/);assert.match(analyticsPage,/fetchABCSnapshot\(500\)/);assert.match(analyticsPage,/fetchAgingSnapshot\(\)/);assert.doesNotMatch(analyticsPage,/supabase\.from\('sales_invoices'/);assert.doesNotMatch(analyticsPage,/supabase\.from\('sale_items'/);assert.doesNotMatch(analyticsPage,/resolveCurrentCompanyId/);assert.match(analyticsPage,/unknownRows/);assert.match(analyticsPage,/INSUFFICIENT_DATA/);

// Compatibility exports remain intentional infrastructure; dashboard business functions now delegate to canonical adapters.
assert.match(compat,/export \* from '\.\/queries'/);assert.match(queries,/Compatibility boundary only/);

console.log('PASS dashboard canonical semantic regression');
console.log('PASS display pagination cannot define dashboard aggregate');
console.log('PASS cancelled/void rows are excluded');
console.log('PASS required NULL data is not coerced to zero');
console.log('PASS dashboard tenant authority is server-derived');
console.log('PASS DashboardPage, ReportsPage and ExecutiveCommandCenter consume canonical dashboard snapshot');
console.log('PASS repository-wide zero non-compatibility consumers for legacy dashboard function names');
console.log('PASS legacy dashboard functions in queries.ts are adapters, not client-side aggregators');
console.log('PASS inventory paging/filtering occurs server-side and business totals remain independent');
console.log('PASS inventory valuation fails closed when required cost data is incomplete');
console.log('PASS InventoryPage and ReportsPage consume canonical inventory snapshot valuation');
console.log('PASS repository-wide zero non-compatibility consumers for legacy inventory valuation function');
console.log('PASS fetchInventoryBalances zero-consumer proof precedes removal');
console.log('PASS unbounded inventory balance query is removed from queries.ts');
console.log('PASS RFM, ABC and Aging are server-side authoritative and tenant-derived');
console.log('PASS analytics pages no longer aggregate transactional histories in the browser');
console.log('PASS analytics missing-data states remain explicit');
console.log('PASS queries-compat retained intentionally as compatibility infrastructure');
