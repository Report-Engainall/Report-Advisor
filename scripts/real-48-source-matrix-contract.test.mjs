import fs from 'node:fs';

const fail = (message) => { throw new Error(message); };
const source = fs.readFileSync(new URL('./real-48-source-matrix-preflight.mjs', import.meta.url), 'utf8');
const canonicalSchema = fs.readFileSync(new URL('../src/lib/report-intelligence/canonical-schema.ts', import.meta.url), 'utf8');

for (const marker of [
  "verification_status: 'VERIFIED'",
  "decision_readiness: 'READY'",
  "report_evidence_snapshots",
  "analysis_snapshot_id",
  "runReportArchetype",
  "claim.archetypeId === profile.id",
  "claim.evidenceSnapshotId === candidate.snapshot.id",
  "persistedArchetypeConsistency",
  "persistedArchetypeId",
  "status: supported === profiles.length ? 'PASS' : 'NOT_PROVEN'",
  "canonicalRowsRead: chosen ? sourceRowsCache.get(String(chosen.job.id))?.length ?? 0 : 0,",
]) {
  if (!source.includes(marker)) fail('Missing real-48 proof invariant: ' + marker);
}
for (const marker of ['customer_id','supplier_id','invoice_number','net_sales','sales_amount','purchase_amount','net_local_amount','payment_amount','inbound_quantity','outbound_quantity']) {
  if (!canonicalSchema.includes(marker)) fail('Missing real-source canonical alias: ' + marker);
}
if (source.includes("create_source_intelligence_proposal")) fail('Preflight must remain read-only');
if (source.includes("request_decision_approval")) fail('Preflight must not create approvals');
if (source.includes("create_decision_work_item")) fail('Preflight must not create work items');

console.log('real-48-source-matrix-contract: PASS');
