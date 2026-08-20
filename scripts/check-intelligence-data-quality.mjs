import fs from 'node:fs';

const source = fs.readFileSync('src/lib/intelligence/dataQuality.ts', 'utf8');
for (const token of ['assessDemandData', 'minimumDays', 'minimumObservations', "'ready'", "'limited'", "'insufficient'", 'safeRate']) {
  if (!source.includes(token)) throw new Error(`Missing intelligence quality contract: ${token}`);
}
console.log('Intelligence data quality contract: PASS');
