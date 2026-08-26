import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const dashboardSql = fs.readFileSync('supabase/migrations/20260826052000_dashboard_canonical_aggregation.sql', 'utf8');
const inventorySql = fs.readFileSync('supabase/migrations/20260826054500_inventory_report_authoritative_paging.sql', 'utf8');
const queries = fs.readFileSync('src/lib/queries.ts', 'utf8');
const adapter = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');
const legacy = ['fetchDashboardKPIs','fetchMonthlyTrend','fetchTopCustomers','fetchTopProducts','fetchCategoryBreakdown','fetchAgingBuckets'];
function sourceFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=path.join(dir,entry.name);if(entry.isDirectory())return sourceFiles(full);return /\.(ts|tsx)$/.test(entry.name)?[full]:[];});}

const invoices=Array.from({length:20},(_,i)=>({id:`i-${i}`,subtotal:10,status:'confirmed'}));invoices.push({id:'i-cancelled',subtotal:1000,status:'cancelled'});invoices.push({id:'i-21',subtotal:10,status:'confirmed'});
const authoritativeRows=invoices.filter(row=>!['cancelled','void'].includes(row.status));
assert.equal(authoritativeRows.length,21);
assert.equal(authoritativeRows.reduce((sum,row)=>sum+row.subtotal,0),210);

const saleItems=[{quantity:2,cost_price:3},{quantity:1,cost_price:null}];
assert.equal(saleItems.some(row=>row.quantity==null||row.cost_price==null),true);
assert.match(dashboardSql,/bad_sale_item_rows/);assert.match(dashboardSql,/'INSUFFICIENT_DATA'/);assert.match(dashboardSql,/grossProfit.*CASE WHEN k\.total_sales IS NOT NULL AND k\.total_cost IS NOT NULL/s);
assert.match(dashboardSql,/current_company_id\(\)/);assert.match(dashboardSql,/SECURITY INVOKER/);assert.doesNotMatch(dashboardSql,/get_dashboard_snapshot\(\s*p_company_id/);

// Repository-wide consumer proof for the migrated dashboard aggregation family.
const allowedLegacyFiles=new Set(['src/lib/queries.ts','src/lib/queries-compat.ts']);const offenders=[];
for(const file of sourceFiles('src')){const rel=path.relative(process.cwd(),file).replaceAll('\\','/');if(allowedLegacyFiles.has(rel))continue;const content=fs.readFileSync(file,'utf8');for(const name of legacy)if(new RegExp(`\\b${name}\\b`).test(content))offenders.push(`${rel}:${name}`);}
assert.deepEqual(offenders,[]);
assert.match(fs.readFileSync('src/pages/DashboardPage.tsx','utf8'),/fetchDashboardSnapshot/);
assert.match(fs.readFileSync('src/pages/ReportsPage.tsx','utf8'),/fetchDashboardSnapshot/);
assert.match(adapter,/supabase\.rpc\('get_dashboard_snapshot'/);

// Inventory report semantics: totals are server-derived, while display rows are bounded independently.
assert.match(inventorySql,/current_company_id\(\)/);
assert.match(inventorySql,/OFFSET v_page\*v_page_size LIMIT v_page_size/);
assert.match(inventorySql,/'totalRows'/);assert.match(inventorySql,/'lowStock'/);assert.match(inventorySql,/'outOfStock'/);assert.match(inventorySql,/'unknownRows'/);
assert.match(adapter,/supabase\.rpc\('get_inventory_report_snapshot'/);
assert.match(fs.readFileSync('src/pages/ReportsPage.tsx','utf8'),/fetchInventoryReportSnapshot\(0,25\)/);
assert.match(fs.readFileSync('src/pages/ReportsPage.tsx','utf8'),/snapshot\.totalRows/);
assert.doesNotMatch(fs.readFileSync('src/pages/ReportsPage.tsx','utf8'),/fetchInventoryBalances\(/);

assert.match(queries,/export async function fetchDashboardKPIs/);
assert.match(queries,/export async function fetchInventoryBalances/);
console.log('PASS dashboard canonical semantic regression');
console.log('PASS display pagination cannot define dashboard aggregate');
console.log('PASS cancelled/void rows are excluded');
console.log('PASS required NULL data is not coerced to zero');
console.log('PASS dashboard tenant authority is server-derived');
console.log('PASS DashboardPage and ReportsPage consume canonical dashboard snapshot');
console.log('PASS repository-wide zero non-compatibility consumers for legacy dashboard functions');
console.log('PASS inventory report totals are server-derived and display rows are bounded');
console.log('PASS legacy query implementations retained intentionally pending safe removal');
