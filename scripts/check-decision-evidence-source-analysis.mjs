import fs from 'node:fs';

const files = {
  migration: 'supabase/migrations/20260908223000_decision_evidence_source_analysis.sql',
  runtime: 'src/lib/decision-runtime.ts',
};

const required = [
  ['migration', "public.source_analysis_snapshots s where s.id::text=v_evidence_snapshot_id and s.company_id=v_company"],
  ['migration', "public.source_analysis_snapshots s where s.id::text=p_evidence_snapshot_id and s.company_id=v_company"],
  ['migration', "OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN"],
  ['runtime', "resolveCurrentCompanyId"],
  ['runtime', "p_evidence: { evidence_snapshot_id: evidenceSnapshotId.trim() }"],
  ['runtime', "p_decision_fingerprint: input.decisionFingerprint.trim()"],
];

for (const [key, needle] of required) {
  const content = fs.readFileSync(files[key], 'utf8');
  if (!content.includes(needle)) throw new Error(`Missing ${key} contract: ${needle}`);
}

console.log(`PASS: ${required.length} source-analysis decision-evidence assertions`);
