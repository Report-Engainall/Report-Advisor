import { readFileSync } from 'node:fs';

const file = readFileSync('src/lib/automationExecutor.ts', 'utf8');
for (const token of [
  'createAutomationExecutor',
  'assertExternalSideEffectAllowed',
  'assertReceiptMatchesAction',
  'calculateRetryDelay',
  'shouldDeadLetter',
  'retryable',
  'idempotencyKey',
]) {
  if (!file.includes(token)) throw new Error(`Missing automation executor contract: ${token}`);
}
if (!file.includes('TIMEOUT') || !file.includes('RATE_LIMITED')) throw new Error('Retryable error policy missing');
if (!file.includes('maxAttempts')) throw new Error('Dead-letter policy missing');
console.log('Automation executor contract: PASS');
