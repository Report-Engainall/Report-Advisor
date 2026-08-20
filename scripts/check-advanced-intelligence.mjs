import fs from 'node:fs';
const s=fs.readFileSync('src/lib/advancedIntelligence.ts','utf8');
for (const token of ['forecastSeries','backtestForecast','classifyABCXYZ','classifyFSN','detectAnomalies','opportunityScan','unifiedConfidence','MAE','mape']) {
  if (!s.includes(token)) throw new Error(`Missing advanced intelligence capability: ${token}`);
}
console.log('Advanced intelligence contract: PASS');
