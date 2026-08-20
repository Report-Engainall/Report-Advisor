import fs from 'node:fs';
const source = fs.readFileSync('src/lib/intelligence/predictiveIntelligence.ts', 'utf8');
for (const token of ['forecastSeries','backtestForecast','analyzeTrend','churnRisk','daysToStockout','INSUFFICIENT_DATA']) if (!source.includes(token)) throw new Error(`Predictive contract missing: ${token}`);
console.log('Predictive intelligence contract: PASS');
