import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const exists=(p)=>fs.existsSync(path.join(root,p));
const required=[
 ['K','src/lib/production-intelligence.ts',['evaluateAutonomyGate','selectBoundedScenario','rankPortfolio','calibrateConfidence']],
 ['K/L','src/lib/k-to-s-runtime.ts',['advanceLifecycle','buildDecisionPortfolio','chooseBoundedScenario','autonomyDecision','assessReleaseReadiness','assertNoCrossTenantEvidence']],
 ['K/L persistence','src/lib/phase-kl-supabase-runtime.ts',['recordControlPlaneHealth','recordEvidenceGraph']],
 ['Execution','src/lib/report-execution/checkpoint.ts',['assertValidTransition','createInitialCheckpoint']],
 ['Roadmap','docs/IMPLEMENTATION_ROADMAP.md',['Phase K','Phase L','Phase M','Phase N','Phase O','Phase P','Phase Q','Phase R','Phase S']]
];
for(const [name,file,tokens] of required){if(!exists(file)) throw new Error(`${name}: missing ${file}`);const s=read(file);for(const t of tokens)if(!s.includes(t))throw new Error(`${name}: missing ${t}`);}
const roadmap=read('docs/IMPLEMENTATION_ROADMAP.md');
const blockers=['cross-tenant','raw-file','reconciliation mismatch','protected liquidity','Forecast below deterministic baseline','Migration drift','Failed tenant-isolation'];
for(const b of blockers)if(!roadmap.includes(b))throw new Error(`release blocker missing: ${b}`);
const quality=read('.github/workflows/quality.yml');
for(const t of ['test:k-to-s-closure','test:phase-k-runtime','test:phase-l-resumable-execution','test:phase-m-certification'])if(!quality.includes(t))throw new Error(`quality gate missing: ${t}`);
// Prevent false completion claims: N-S are not accepted as live-certified by this static gate.
const liveCertTerms=['live certified','production_certified','can_release_production_certification'];
const certification=exists('supabase/migrations/20260825140000_phase_m_production_certification.sql')?read('supabase/migrations/20260825140000_phase_m_production_certification.sql'):'';
if(!certification.includes('can_release_production_certification')) throw new Error('M certification release predicate missing');
console.log('Deep K→S closure matrix: PASS (static/runtime-contract layer; live production certification remains fail-closed until evidence exists).');
