import {
  type AutomationAction,
  type AutomationReceipt,
  assertExternalSideEffectAllowed,
  assertReceiptMatchesAction,
} from './automationExecutionContract';

export type ExecutorClock = () => Date;
export type SideEffect = (action: AutomationAction) => string | undefined;

export interface AutomationExecutionResult {
  receipt: AutomationReceipt;
  retryable: boolean;
}

export interface AutomationExecutor {
  execute(action: AutomationAction, sideEffect: SideEffect, attempt?: number): AutomationExecutionResult;
}

const RETRYABLE_ERRORS = new Set(['TIMEOUT', 'RATE_LIMITED', 'TEMPORARY_UNAVAILABLE']);

export function createAutomationExecutor(clock: ExecutorClock = () => new Date()): AutomationExecutor {
  return {
    execute(action, sideEffect, attempt = 1) {
      assertExternalSideEffectAllowed(action);
      if (!Number.isInteger(attempt) || attempt < 1) throw new Error('AUTOMATION_ATTEMPT_INVALID');

      try {
        const externalRef = sideEffect(action);
        const receipt: AutomationReceipt = {
          actionId: action.actionId,
          companyId: action.companyId,
          idempotencyKey: action.idempotencyKey,
          status: 'succeeded',
          attempt,
          executedAt: clock().toISOString(),
          externalRef,
        };
        assertReceiptMatchesAction(receipt, action);
        return { receipt, retryable: false };
      } catch (error) {
        const errorCode = error instanceof Error ? error.message : 'AUTOMATION_UNKNOWN_ERROR';
        const receipt: AutomationReceipt = {
          actionId: action.actionId,
          companyId: action.companyId,
          idempotencyKey: action.idempotencyKey,
          status: 'failed',
          attempt,
          executedAt: clock().toISOString(),
          errorCode,
        };
        assertReceiptMatchesAction(receipt, action);
        return { receipt, retryable: RETRYABLE_ERRORS.has(errorCode) };
      }
    },
  };
}

export function calculateRetryDelay(attempt: number, baseMs = 1000, maxMs = 60_000): number {
  if (!Number.isInteger(attempt) || attempt < 1) throw new Error('AUTOMATION_ATTEMPT_INVALID');
  if (baseMs < 1 || maxMs < baseMs) throw new Error('AUTOMATION_RETRY_POLICY_INVALID');
  return Math.min(maxMs, baseMs * 2 ** (attempt - 1));
}

export function shouldDeadLetter(attempt: number, maxAttempts = 5): boolean {
  if (!Number.isInteger(attempt) || attempt < 1) throw new Error('AUTOMATION_ATTEMPT_INVALID');
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) throw new Error('AUTOMATION_RETRY_POLICY_INVALID');
  return attempt >= maxAttempts;
}
