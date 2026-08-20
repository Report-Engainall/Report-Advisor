import fs from 'node:fs';
const source = fs.readFileSync('src/lib/intelligence/financialIntelligence.ts', 'utf8');
for (const token of ['cashConversionCycle', 'projectLiquidity', 'protectCashReserve', 'prioritizeReceivables', 'prioritizeSupplierPayments', 'PROFIT_UNAVAILABLE', 'marginPct']) {
  if (!source.includes(token)) throw new Error(`Financial intelligence contract missing: ${token}`);
}
if (!source.includes('cost == null')) throw new Error('Financial intelligence must explicitly block unavailable COGS');
if (!source.includes('costOfSales: cost ?? 0')) throw new Error('Financial intelligence must pass zero only as a guarded engine input, not as an accounting substitute');
console.log('Financial intelligence contract: PASS');
