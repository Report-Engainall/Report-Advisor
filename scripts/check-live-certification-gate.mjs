#!/usr/bin/env node

/**
 * Fail closed until live certification evidence is explicitly supplied.
 * This is intentionally not a fake runtime test: it only validates the
 * evidence contract and exact revision binding.
 */

const expected = [
  'TENANT_AB_ISOLATION',
  'STORAGE_AB_ISOLATION',
  'REALTIME_AB_ISOLATION',
  'AI_VECTOR_AB_ISOLATION',
  'AUTHENTICATED_E2E',
  'WORKER_CRASH_RECOVERY',
  'LEASE_RECOVERY',
  'RETRY_DLQ_IDEMPOTENCY',
  'NATIVE_WATCHER',
  'BACKUP_RESTORE_RPO_RTO',
  'REAL_DOCUMENT_CORPUS',
  'PRODUCTION_TELEMETRY',
  'PRODUCTION_LOAD',
  'CANARY_ROLLBACK',
  'CRYPTO_MATRIX',
];

const sha = process.env.CERTIFIED_SHA;
const evidence = new Set(
  (process.env.LIVE_EVIDENCE || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean),
);

if (!sha) {
  console.error('LIVE_CERTIFICATION_BLOCKED: CERTIFIED_SHA is required');
  process.exit(1);
}

const missing = expected.filter((item) => !evidence.has(item));
if (missing.length) {
  console.error(`LIVE_CERTIFICATION_BLOCKED for ${sha}`);
  console.error(`Missing evidence: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`LIVE_CERTIFICATION_EVIDENCE_COMPLETE: ${sha}`);
