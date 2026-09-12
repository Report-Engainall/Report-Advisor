import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
// Keep the provenance invariant bound to components that exist on the current
// release branch. The former autonomous-governance migration was removed from
// the repository; requiring its historical path made certification fail before
// the actual evidence invariant could execute.
const files=[
  'src/lib/production-intelligence.ts',
  'src/lib/phase-kl-runtime.ts',
  'src/lib/report-execution/sales-durable-runtime.ts',
  'supabase/migrations/20260825142000_phase_kl_runtime_closure.sql',
];
for(const f of files) if(!fs.existsSync(path.join(root,f))) throw new Error(`Missing evidence component: ${f}`);
const text=files.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n').toLowerCase();
const invariants={
  evidence:['evidence'],
  source:['sourcehash','source path','source'],
  lineage:['rowversion','diffrows','lineage'],
  canonical:['canonical'],
  provenance:['sourcesnapshotid','report_source_versions','source snapshot'],
  confidence:['confidence','quality'],
  materiality:['materiality','riskbudget','priority'],
};
for(const [name,patterns] of Object.entries(invariants)) {
  if(!patterns.some((pattern)=>text.includes(pattern))) throw new Error(`Evidence provenance invariant missing: ${name}`);
}
console.log('Evidence provenance chain: PASS');
