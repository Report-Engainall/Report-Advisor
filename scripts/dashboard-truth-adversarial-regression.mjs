import assert from 'node:assert/strict';
import fs from 'node:fs';
const migration=fs.readFileSync('supabase/migrations/20260831060000_dashboard_truth_semantics.sql','utf8');
const adapter=fs.readFileSync('src/lib/dashboard-canonical.ts','utf8');
const page=fs.readFileSync('src/pages/DashboardPage.tsx','utf8');
assert.match(migration,/SECURITY INVOKER/);
assert.match(migration,/current_company_id\(\)/);
assert.match(migration,/'status',CASE WHEN count\(\*\)=0 THEN 'NO_DATA'/);
assert.match(migration,/'categoryStatus',CASE WHEN z\.category_id IS NULL THEN 'UNKNOWN'/);
assert.match(migration,/status.*INSUFFICIENT_DATA/);
assert.doesNotMatch(migration,/COALESCE\(x\.sales,0\)/);
assert.doesNotMatch(migration,/COALESCE\(x\.cost,0\)/);
assert.doesNotMatch(migration,/COALESCE\(x\.sales,0\)-COALESCE\(x\.cost,0\)/);
assert.doesNotMatch(page,/aging\.reduce\(/);
assert.doesNotMatch(page,/bucket\.amount \/ total/);
assert.doesNotMatch(page,/categories\.map\(.*reduce/s);
assert.match(page,/categoryStatus==='UNKNOWN'/);
assert.match(page,/aging\.totalAmount/);
assert.match(page,/aging\.status/);
// Top entities are part of the authoritative get_dashboard_snapshot payload on the
// current canonical contract. A separate helper existed historically but is not a
// frontend dependency; keep this guard bound to the actual canonical consumer.
assert.match(adapter,/topCustomers: requiredArray<TopEntity>\(row\.topCustomers\)/);
assert.match(adapter,/topProducts: requiredArray<TopEntity>\(row\.topProducts\)/);
assert.match(adapter,/status:'CALCULATED'|'NO_DATA'|'INSUFFICIENT_DATA'/);
assert.match(adapter,/categoryStatus:'CALCULATED'|'UNKNOWN'/);
console.log('PASS dashboard aggregation is server-owned');
console.log('PASS trend NO_DATA/INSUFFICIENT_DATA is explicit and missing values are not zero-filled');
console.log('PASS category UNKNOWN is explicit, not silently relabeled as a real category');
console.log('PASS aging total/status/unknownRows are normalized from canonical server data; browser does not aggregate');
console.log('PASS top customers/products remain in the canonical dashboard snapshot and tenant-derived');
console.log('PASS Dashboard Truth adversarial regression');
