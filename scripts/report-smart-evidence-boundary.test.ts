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

const cockpitPath = fileURLToPath(new URL('../src/components/ReportDecisionCockpit.tsx', import.meta.url));
const cockpit = fs.readFileSync(cockpitPath, 'utf8');

assert.match(
  cockpit,
  /const evidenceSnapshotId = typeof report\.renderedOutput\?\.evidenceSnapshotId === 'string'/,
  'decision cockpit must derive its decision evidence from the rendered Passport snapshot',
);
assert.match(
  cockpit,
  /evidenceSnapshotId,\n\s*\}\);/,
  'decision cockpit must pass the canonical Passport evidence snapshot',
);
assert.doesNotMatch(
  cockpit,
  /evidenceSnapshotId:\s*report\.sourceAnalysis\.id/,
  'decision cockpit must not use the analysis snapshot as Passport evidence',
);

const smartReportPath = fileURLToPath(new URL('../src/lib/report-smart.ts', import.meta.url));
const smartReport = fs.readFileSync(smartReportPath, 'utf8');

assert.match(
  smartReport,
  /from\('report_evidence_passports'\)/,
  'Smart Report must consult the current Evidence Passport instead of trusting stale rendered provenance',
);
assert.match(
  smartReport,
  /const effectiveRendered: Record<string, unknown> = currentPassport/,
  'Smart Report must derive its effective provenance from the current Passport',
);
assert.match(
  smartReport,
  /renderedOutput: effectiveRendered/,
  'Smart Report consumers must receive the Passport-refreshed provenance',
);
assert.match(
  smartReport,
  /evidenceSnapshotId: currentPassport\.evidence_snapshot_id/,
  'Smart Report must bind decision provenance to the Passport snapshot',
);

const catalogMatch = smartReport.match(/function mapCatalogItem\\([\\s\\S]*?\\n}\\n\\nexport async function fetchSmartReportCatalog/);
assert.ok(catalogMatch, 'Smart Report catalog mapper must remain discoverable for regression checks');
assert.doesNotMatch(
  catalogMatch[0],
  /effectiveRendered/,
  'catalog mapping must use its local rendered output; Passport-refreshed effectiveRendered exists only inside fetchSmartReport',
);

console.log('PASS: evidence verification, Advisor decision provenance, live Passport readback, catalog provenance scope and source-proposal reconciliation remain fail-closed.');
