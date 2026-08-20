import fs from 'node:fs';
const source = fs.readFileSync('src/lib/intelligence/financialIntelligence.ts', 'utf8');
for (const token of ['cashConversionCycle', 'projectLiquidity', 'protectCashReserve', 'prioritizeReceivables', 'prioritizeSupplierPayments', 'PROFIT_UNAVAILABLE', 'marginPct']) {
  if (!source.includes(token)) throw new Error(`Financial intelligence contract missing: ${token}`);
}
if (!source.includes('costOfSales ??')) throw new Error('Financial intelligence must not silently substitute purchases for COGS');
console.log('Financial intelligence contract: PASS');
