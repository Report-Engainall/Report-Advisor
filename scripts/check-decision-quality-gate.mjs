import fs from 'node:fs';
const src=fs.readFileSync('src/lib/decisionEngine.ts','utf8');
for(const token of ['evaluateMetric','metricCanDriveDecision','blocked','blockedReason','Math.min(ruleConfidence, metric.confidence)']) if(!src.includes(token)) throw new Error(`Decision quality gate missing: ${token}`);
console.log('Decision quality gate: PASS');
