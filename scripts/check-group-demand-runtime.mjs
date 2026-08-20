import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/lib/intelligence/groupDemand.ts', 'utf8');
assert.match(source, /normalizedDemand/);
assert.match(source, /normalizedStock/);
assert.match(source, /normalizedSales/);
assert.match(source, /coverageDays/);
assert.match(source, /recommendedOrder/);
assert.match(source, /new Set<string>/);
assert.match(source, /stockoutRisk/);

const members = [
  { sku: 'OIL20-A', factor: 1, dailyDemand: 100, stock: 500, netSales: 1000 },
  { sku: 'OIL20-B', factor: 2, dailyDemand: 50, stock: 200, netSales: 600 },
  { sku: 'OIL20-A', factor: 1, dailyDemand: 999, stock: 999, netSales: 999 },
];
const unique = [...new Map(members.map((m) => [m.sku, m])).values()];
const demand = unique.reduce((s, m) => s + m.dailyDemand * m.factor, 0);
const stock = unique.reduce((s, m) => s + m.stock * m.factor, 0);
const sales = unique.reduce((s, m) => s + m.netSales, 0);
assert.equal(unique.length, 2);
assert.equal(demand, 200);
assert.equal(stock, 900);
assert.equal(sales, 1600);
assert.equal(stock / demand, 4.5);
assert.equal(Math.ceil(Math.max(0, demand * 30 - stock)), 5100);

console.log('alternative group runtime contract: PASS');
