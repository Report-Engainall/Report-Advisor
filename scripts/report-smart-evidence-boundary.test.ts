import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
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


const panelPath = fileURLToPath(new URL('../src/components/ReportIntelligencePanel.tsx', import.meta.url));
const panel = fs.readFileSync(panelPath, 'utf8');

assert.match(
  panel,
  /const evidenceSnapshotId = typeof report\.renderedOutput\?\.evidenceSnapshotId === 'string'/,
  'advisor case action must derive its decision evidence from the rendered Passport snapshot',
);
assert.match(
  panel,
  /evidenceSnapshotId,\n\s*\}\);/,
  'createSourceDecisionProposal must receive the canonical Passport evidence snapshot',
);
assert.doesNotMatch(
  panel,
  /evidenceSnapshotId:\s*report\.sourceAnalysis\?\.id/,
  'analysis snapshot ids must not be used as Passport decision evidence',
);

console.log('PASS: canonical commit/evidence verification and Advisor decision provenance remain independent and fail closed.');
