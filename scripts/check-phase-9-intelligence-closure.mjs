import fs from 'node:fs';

const required = {
  'src/lib/advancedIntelligence.ts': ['analyzeTrend','forecastSeries','backtestForecast','classifyABCXYZ','classifyFSN','detectAnomalies','opportunityScan','unifiedConfidence'],
  'src/lib/canonicalIntelligence.ts': ['buildCanonicalIntelligence','forecast','backtest','replenishment','stochasticInventory','alternativeGroups','confidence','warnings'],
  'src/lib/analytics/forecast-backtest.ts': ['backtest'],
  'src/lib/analytics/intelligence-gate.ts': ['confidence'],
};
for (const [file, tokens] of Object.entries(required)) {
  if (!fs.existsSync(file)) throw new Error(`Phase 9 missing ${file}`);
  const source = fs.readFileSync(file, 'utf8');
  for (const token of tokens) if (!source.includes(token)) throw new Error(`Phase 9 capability ${token} missing in ${file}`);
}
const source = fs.readFileSync('src/lib/advancedIntelligence.ts', 'utf8');
if (!source.includes('insufficient: true') || !source.includes('confidence')) {
  throw new Error('Phase 9 forecast safety contract is incomplete');
}
const canonical = fs.readFileSync('src/lib/canonicalIntelligence.ts', 'utf8');
if (!canonical.includes('warnings') || !canonical.includes('INSUFFICIENT_DATA')) {
  throw new Error('Phase 9 evidence/warning propagation is incomplete');
}
console.log('Phase 9 intelligence closure: PASS');
