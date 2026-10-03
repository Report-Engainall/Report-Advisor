import assert from 'node:assert/strict';
import fs from 'node:fs';

const passportSchema = fs.readFileSync(
  'supabase/migrations/20261002143000_create_report_evidence_passport.sql',
  'utf8',
);
const passportRuntime = fs.readFileSync(
  'supabase/migrations/20261002144000_refresh_report_evidence_passport.sql',
  'utf8',
);
const passportGates = fs.readFileSync(
  'supabase/migrations/20261002145000_enforce_report_evidence_passport_gates.sql',
  'utf8',
);
const proposal = fs.readFileSync('src/lib/report-decisions.ts', 'utf8');
const reportPage = fs.readFileSync('src/pages/SmartReportPage.tsx', 'utf8');
const completion = fs.readFileSync('supabase/migrations/20261003141500_auto_refresh_report_evidence_passport_on_completion.sql', 'utf8');
const provenanceRepair = fs.readFileSync('supabase/migrations/20261003140500_reconcile_source_decision_passport_snapshot.sql', 'utf8');
const intelligencePanel = fs.readFileSync('src/components/ReportIntelligencePanel.tsx', 'utf8');
const decisionCockpit = fs.readFileSync('src/components/ReportDecisionCockpit.tsx', 'utf8');

assert.ok(passportSchema.includes('report_evidence_snapshots'));
assert.ok(passportSchema.includes('report_evidence_passports'));
assert.ok(passportSchema.includes('company_id'));
assert.ok(passportSchema.includes('source_hash'));
assert.ok(passportSchema.includes('source_version_id'));
assert.ok(passportSchema.includes('analysis_snapshot_id'));
assert.ok(passportRuntime.includes('refresh_report_evidence_passport'));
assert.ok(passportRuntime.includes('DETERMINISTIC_SOURCE_BOUND'));
assert.ok(passportRuntime.includes('LEGACY_UNRESOLVED'));
assert.ok(passportRuntime.includes('evidenceSnapshotId'));
assert.ok(passportGates.includes('SOURCE_EVIDENCE_PASSPORT_REQUIRED'));
assert.ok(passportGates.includes('SOURCE_DECISION_EVIDENCE_PASSPORT_REQUIRED'));
assert.ok(passportGates.includes('SOURCE_WORK_EVIDENCE_PASSPORT_REQUIRED'));
assert.ok(proposal.includes("report_evidence_passports"));
assert.ok(proposal.includes("verification_status', 'VERIFIED'"));
assert.ok(proposal.includes('evidencePassportId'));
assert.ok(proposal.includes('confidence: null'));
assert.ok(proposal.includes("confidenceSemantics: 'NOT_ASSESSED'"));
assert.ok(!proposal.includes('confidence: 0.5'));
assert.ok(reportPage.includes('EVIDENCE PASSPORT'));
assert.ok(reportPage.includes('legacyPriorVerification'));
assert.ok(reportPage.includes('decisionReadiness'));
assert.ok(completion.includes('refresh_report_evidence_passport'));
assert.ok(completion.includes("'evidencePassportRefresh'"));
assert.ok(provenanceRepair.includes("repairedLegacyProposal"));
assert.ok(provenanceRepair.includes("evidencePassportId"));
assert.ok(intelligencePanel.includes("report.renderedOutput?.evidenceSnapshotId"));
assert.ok(!intelligencePanel.includes("evidenceSnapshotId: report.sourceAnalysis?.id"));
assert.ok(decisionCockpit.includes("report.renderedOutput?.evidenceSnapshotId"));
assert.ok(!decisionCockpit.includes("evidenceSnapshotId: report.sourceAnalysis.id"));

console.log('REPORT_EVIDENCE_PASSPORT_CONTRACT_PASS');
