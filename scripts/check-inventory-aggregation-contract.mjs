import fs from 'node:fs';
const source = fs.readFileSync('src/lib/intelligence/inventoryData.ts','utf8');
for (const token of ['aggregateInventoryBalances','inventoryValue','warehouseCount','current.stock += stock','current.inventoryValue += stock * cost']) {
  if (!source.includes(token)) throw new Error(`Missing inventory aggregation contract: ${token}`);
}
console.log('Inventory aggregation contract: PASS');
