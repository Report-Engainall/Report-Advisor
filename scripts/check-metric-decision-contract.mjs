import fs from 'node:fs';
const metric = fs.readFileSync('src/lib/metricEngine.ts','utf8');
const evidence = fs.readFileSync('src/lib/decisionEvidence.ts','utf8');
const semantic = fs.readFileSync('src/lib/semanticMetrics.ts','utf8');
for (const token of ['BUSINESS_METRICS','INSUFFICIENT_DATA','metricCanDriveDecision','sourceRows']) if (!metric.includes(token)) throw new Error(`Metric contract missing: ${token}`);
for (const token of ['explainDecision','blocked','filterActionableDecisions','metricCanDriveDecision']) if (!evidence.includes(token)) throw new Error(`Decision evidence contract missing: ${token}`);
for (const token of ['net_sales','gross_profit','inventory_value','cash_position']) if (!semantic.includes(`key:'${token}'`)) throw new Error(`Canonical metric missing: ${token}`);
console.log('Metric/decision evidence contract: PASS');
