import fs from 'node:fs';
const required = {
  'src/lib/decision-automation/action-runtime.ts': ['tenantId','evidenceRefs','idempotencyKey','requiresApproval'],
  'src/lib/decision-automation/execution-receipt.ts': ['AutomationExecutionReceipt','decisionFingerprint','evidenceSnapshotId','receiptKey'],
  'src/lib/analytics/forecast-backtest.ts': ['baselineMae','improvementVsBaselinePct','assertForecastQuality'],
  'src/lib/analytics/outcome-feedback.ts': ['DecisionOutcome','recordOutcome','persistOutcome','loadPersistedOutcomes','recommendation_outcomes','OUTCOME_TENANT_CONTEXT_MISMATCH'],
  'src/lib/analytics/intelligence-gate.ts': ['evaluateIntelligenceGate','FORECAST_BELOW_BASELINE','OUTCOME_ACCURACY_LOW'],
};
for (const [file,tokens] of Object.entries(required)) { const source=fs.readFileSync(file,'utf8'); for(const token of tokens) if(!source.includes(token)) throw new Error(`${file}: missing ${token}`); }
console.log('decision/intelligence closure contract: PASS');
