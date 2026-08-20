import fs from 'node:fs';
import assert from 'node:assert/strict';

const semantic = fs.readFileSync('src/lib/semanticMetrics.ts', 'utf8');
const inventory = fs.readFileSync('src/lib/inventory-intelligence.ts', 'utf8');

for (const key of ['stockout_risk','alternative_group_demand','alternative_group_stock','lost_sales_estimate','liquidity_inventory_release','cash_position']) {
  assert.match(semantic, new RegExp(`key:'${key}'`), `missing metric ${key}`);
}
assert.match(semantic, /key:'cash_position'.*dependencies:\['payments'\]/s);
assert.match(semantic, /key:'stockout_risk'.*unit:'percent'/s);
assert.match(semantic, /MIN\(100, MAX\(0,/);
assert.match(inventory, /aggregateByProduct/);
assert.match(inventory, /current\.stock \+= stock/);
assert.doesNotMatch(inventory, /Number\(balance\.quantity\) > Number\(current\.quantity\)/);
console.log('inventory + semantic metric contract: PASS');
