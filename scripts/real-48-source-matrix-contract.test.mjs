import fs from 'node:fs';

const fail = (message) => { throw new Error(message); };
const source = fs.readFileSync(new URL('./real-48-source-matrix-preflight.mjs', import.meta.url), 'utf8');

for (const marker of [
  "verification_status: 'VERIFIED'",
  "decision_readiness: 'READY'",
  "report_evidence_snapshots",
  "analysis_snapshot_id",
  "runReportArchetype",
  "claim.archetypeId === profile.id",
  "claim.evidenceSnapshotId === candidate.snapshot.id",
  "status: supported === profiles.length ? 'PASS' : 'NOT_PROVEN'",
]) {
  if (!source.includes(marker)) fail('Missing real-48 proof invariant: ' + marker);
}
if (source.includes("create_source_intelligence_proposal")) fail('Preflight must remain read-only');
if (source.includes("request_decision_approval")) fail('Preflight must not create approvals');
if (source.includes("create_decision_work_item")) fail('Preflight must not create work items');

console.log('real-48-source-matrix-contract: PASS');
