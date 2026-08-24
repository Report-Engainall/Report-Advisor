import fs from 'node:fs';
const scenario = fs.readFileSync('src/lib/intelligence/scenario-decision-engine.ts','utf8');
const gate = fs.readFileSync('src/lib/intelligence/forecast-confidence-gate.ts','utf8');
for (const [name, text, tokens] of [
 ['scenario', scenario, ['simulateScenario','sensitivity','protectedCash','liquidityPressure','HIGH_LIQUIDITY_PRESSURE']],
 ['confidence', gate, ['evaluateForecastGate','minimumObservations','INSUFFICIENT_COVERAGE','MODEL_NOT_BETTER_THAN_BASELINE','EXCESSIVE_BIAS']]
]) for (const token of tokens) if (!text.includes(token)) throw new Error(`${name}: missing ${token}`);
console.log('scenario-confidence-contracts: PASS');
