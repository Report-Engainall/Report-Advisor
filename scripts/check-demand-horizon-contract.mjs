import fs from 'node:fs';
const source = fs.readFileSync('src/lib/intelligence/demandHorizon.ts', 'utf8');
for (const token of ['normalizeDemandHorizon', 'normalizedDailyRequests', 'projectDemand', 'sourceDays', 'targetDays']) {
  if (!source.includes(token)) throw new Error(`demand-horizon: missing ${token}`);
}
console.log('demand-horizon-contract: PASS');
