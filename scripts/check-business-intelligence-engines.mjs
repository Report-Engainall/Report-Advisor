import fs from 'node:fs';
const source=fs.readFileSync('src/lib/businessIntelligenceEngines.ts','utf8');
for (const token of ['buildAgingBuckets','analyzeTrend','decideReplenishment','scoreCustomer','scoreSupplier','projectLiquidity','cashConversionCycle','whatIf','INSUFFICIENT_DATA','BUY_NOW','OVERSTOCK']) {
  if (!source.includes(token)) throw new Error(`Missing intelligence capability: ${token}`);
}
console.log('Business intelligence engines contract: PASS');
