export type AutomationActionKind = 'reorder' | 'transfer' | 'notify' | 'price_review' | 'cash_protection';
export type AutomationApproval = 'required' | 'approved' | 'rejected';
export type AutomationStatus = 'proposed' | 'approved' | 'executing' | 'succeeded' | 'failed' | 'dead_lettered';

export interface AutomationAction {
  actionId: string;
  companyId: string;
  kind: AutomationActionKind;
  sourceDecisionId: string;
  idempotencyKey: string;
  approval: AutomationApproval;
  status: AutomationStatus;
  payload: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface AutomationReceipt {
  actionId: string;
  companyId: string;
  idempotencyKey: string;
  status: 'succeeded' | 'failed';
  attempt: number;
  executedAt: string;
  externalRef?: string;
  errorCode?: string;
}

export function assertAutomationScope(action: AutomationAction): void {
  if (!action.companyId) throw new Error('AUTOMATION_COMPANY_SCOPE_REQUIRED');
  if (!action.actionId) throw new Error('AUTOMATION_ACTION_ID_REQUIRED');
  if (!action.sourceDecisionId) throw new Error('AUTOMATION_SOURCE_DECISION_REQUIRED');
  if (!action.idempotencyKey) throw new Error('AUTOMATION_IDEMPOTENCY_REQUIRED');
}

export function assertExternalSideEffectAllowed(action: AutomationAction): void {
  assertAutomationScope(action);
  if (action.approval !== 'approved') throw new Error('AUTOMATION_APPROVAL_REQUIRED');
  if (action.status !== 'approved' && action.status !== 'executing') {
    throw new Error('AUTOMATION_INVALID_EXECUTION_STATE');
  }
}

export function buildIdempotencyKey(companyId: string, actionKind: AutomationActionKind, sourceDecisionId: string): string {
  if (!companyId || !sourceDecisionId) throw new Error('AUTOMATION_IDEMPOTENCY_SCOPE_REQUIRED');
  return `${companyId}:${actionKind}:${sourceDecisionId}`;
}

export function assertReceiptMatchesAction(receipt: AutomationReceipt, action: AutomationAction): void {
  assertAutomationScope(action);
  if (receipt.companyId !== action.companyId) throw new Error('AUTOMATION_RECEIPT_COMPANY_MISMATCH');
  if (receipt.actionId !== action.actionId) throw new Error('AUTOMATION_RECEIPT_ACTION_MISMATCH');
  if (receipt.idempotencyKey !== action.idempotencyKey) throw new Error('AUTOMATION_RECEIPT_IDEMPOTENCY_MISMATCH');
  if (receipt.attempt < 1) throw new Error('AUTOMATION_ATTEMPT_INVALID');
}
