import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('scripts/report-value-cohort.mjs', 'utf8');
assert.ok(source.includes('async function isTerminalStatementTimeout(response)'), 'COHORT_TERMINAL_TIMEOUT_DETECTOR_REQUIRED');
assert.ok(source.includes("String(payload?.code ?? '') === '57014'"), 'COHORT_MUST_DETECT_POSTGRES_STATEMENT_TIMEOUT');
assert.ok(source.includes('/statement timeout|canceling statement/i'), 'COHORT_MUST_DETECT_TIMEOUT_MESSAGE');
assert.ok(source.includes('await response.clone().json().catch(() => null)'), 'COHORT_TIMEOUT_DETECTION_MUST_PRESERVE_RESPONSE_BODY');
assert.ok(source.includes('|| await isTerminalStatementTimeout(response)'), 'COHORT_MUST_NOT_RETRY_TERMINAL_SQL_TIMEOUT');
assert.ok(source.includes('attempt <= 5'), 'COHORT_NETWORK_RETRY_MUST_REMAIN_BOUNDED');
console.log('REPORT_VALUE_COHORT_RETRY_CONTRACT_PASS');
