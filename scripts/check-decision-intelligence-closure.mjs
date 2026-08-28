import fs from 'node:fs';

const required = {
  'src/lib/decision-automation/action-runtime.ts': ['tenantId','evidenceRefs','idempotencyKey','requiresApproval'],
  'src/lib/decision-automation/execution-receipt.ts': ['AutomationExecutionReceipt','decisionFingerprint','evidenceSnapshotId','receiptKey'],
  'src/lib/analytics/forecast-backtest.ts': ['baselineMae','improvementVsBaselinePct','assertForecastQuality'],
  'src/lib/analytics/outcome-feedback.ts': ['DecisionOutcome','recordOutcome','persistOutcome','loadPersistedOutcomes','recommendation_outcomes','OUTCOME_TENANT_CONTEXT_MISMATCH'],
  'src/lib/analytics/intelligence-gate.ts': ['evaluateIntelligenceGate','FORECAST_BELOW_BASELINE','OUTCOME_ACCURACY_LOW'],
  'src/lib/decision-automation/vertical-slice-runtime.ts': ['createRuntimeRecommendation','createRuntimeDecision','requestRuntimeApproval','decideRuntimeApproval','createRuntimeWorkItem','notifyWorkItem','completeRuntimeWorkItem','loadRuntimeOutcome','resolveCurrentCompanyId'],
  'supabase/migrations/20260828170000_decision_action_outcome_runtime.sql': ['decision_approvals','decision_work_items','decision_action_receipts','request_decision_approval','decide_approval','complete_decision_work_item','recommendation_outcomes','current_company_id()','outcome_delta'],
  'supabase/migrations/20260828171000_decision_runtime_audit.sql': ['audit_decision_runtime_change','decision_approvals','decision_work_items','decision_action_receipts','audit_logs','current_company_id()','auth.uid()'],
};
for (const [file,tokens] of Object.entries(required)) { const source=fs.readFileSync(file,'utf8'); for(const token of tokens) if(!source.includes(token)) throw new Error(`${file}: missing ${token}`); }

const migration = fs.readFileSync('supabase/migrations/20260828170000_decision_action_outcome_runtime.sql','utf8');
if (!/status IN \('PENDING','APPROVED','REJECTED','CANCELLED'\)/.test(migration)) throw new Error('approval lifecycle is not deterministic');
if (!/status IN \('OPEN','IN_PROGRESS','COMPLETED','BLOCKED','CANCELLED'\)/.test(migration)) throw new Error('work lifecycle is not deterministic');
if (!/status IN \('ACCEPTED','RUNNING','SUCCEEDED','FAILED','BLOCKED','CANCELLED'\)/.test(migration)) throw new Error('action receipt lifecycle is not deterministic');
if (!migration.includes("AND d.status='PROPOSED'")) throw new Error('approval request bypasses decision state');
if (!migration.includes("SET status=CASE WHEN p_approve THEN 'APPROVED' ELSE 'REJECTED' END")) throw new Error('approval transition is not persisted');
if (!migration.includes("SET status='COMPLETED'")) throw new Error('completion does not persist terminal state');

console.log('decision/intelligence/runtime vertical slice closure contract: PASS');
