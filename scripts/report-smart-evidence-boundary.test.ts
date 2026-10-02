import assert from 'node:assert/strict';
import { resolveReportEvidenceStatus } from '../src/lib/report-smart-evidence-status.ts';

assert.equal(
  resolveReportEvidenceStatus(
    { evidenceStatus: 'AWAITING_EVIDENCE_SNAPSHOT' },
    true,
  ),
  'AWAITING_EVIDENCE_SNAPSHOT',
  'canonical commit must not promote awaiting evidence to VERIFIED',
);

assert.equal(
  resolveReportEvidenceStatus(
    { evidenceStatus: 'VERIFIED' },
    true,
  ),
  'AWAITING_EVIDENCE_SNAPSHOT',
  'a stale VERIFIED label without an evidence snapshot must fail closed',
);

assert.equal(
  resolveReportEvidenceStatus(
    { evidenceStatus: 'VERIFIED', evidenceSnapshotId: 'evidence-123' },
    true,
  ),
  'VERIFIED',
  'VERIFIED requires an explicit evidence snapshot plus canonical coverage',
);

assert.equal(
  resolveReportEvidenceStatus(
    { evidenceStatus: 'VERIFIED', evidenceSnapshotId: 'evidence-123' },
    false,
  ),
  'PENDING_EVIDENCE',
  'evidence must not verify when canonical coverage is incomplete',
);

assert.equal(
  resolveReportEvidenceStatus(
    { evidenceStatus: 'REVIEW' },
    true,
  ),
  'REVIEW',
  'review state must remain a real state',
);

assert.equal(
  resolveReportEvidenceStatus(
    { evidenceStatus: 'BLOCKED' },
    false,
  ),
  'BLOCKED',
  'blocked state must remain a real state',
);

console.log('PASS: canonical commit and evidence verification remain independent and fail closed.');
