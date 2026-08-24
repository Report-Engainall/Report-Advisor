import fs from 'node:fs';
const source = fs.readFileSync('src/lib/intelligence/decisionScore.ts', 'utf8');
for (const token of [
  'calculateDecisionScore',
  'canAutomateDecision',
  'forecastConfidence',
  'liquiditySafety',
  'scenarioSafety',
  'alternativeAvailability',
  'stockoutExposure',
  'STALE_EVIDENCE',
  'LIQUIDITY_UNSAFE',
  'SCENARIO_UNSAFE',
  'HIGH_PRIORITY'
]) if (!source.includes(token)) throw new Error(`decision-score: missing ${token}`);
console.log('decision-score-contract: PASS');
