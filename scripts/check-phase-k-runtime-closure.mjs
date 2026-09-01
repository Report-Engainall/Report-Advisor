import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const files=['src/lib/report-execution/production-coordinator-bridge.ts','src/lib/report-execution/durable-worker-adapter.ts','src/lib/phase-kl-runtime.ts','src/lib/phase-kl-supabase-runtime.ts'];
for(const f of files){if(!fs.existsSync(path.join(root,f))) throw new Error(`Phase K runtime file missing: ${f}`)}
const bridge=fs.readFileSync(path.join(root,files[0]),'utf8');
const canonicalTokens=[
  ['sourceHash',['sourceHash']],
  ['lineage',['diffRows','buildLineage']],
  ['consolidation',['consolidateRuntime','consolidateChronologically']],
  ['scenario',['chooseScenario','selectBoundedScenario']],
  ['portfolio',['prioritizeDecisions','rankDecisionPortfolio']],
  ['autonomy',['canAutonomouslyExecute','evaluateAutonomy']],
];
for(const [label,tokens] of canonicalTokens) if(!tokens.some(token=>bridge.includes(token))) throw new Error(`Phase K closure missing: ${label}`);
console.log('Phase K runtime closure: PASS');
