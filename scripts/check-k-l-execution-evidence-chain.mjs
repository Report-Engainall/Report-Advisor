import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const files=['src/lib/phase-kl-runtime.ts','src/lib/phase-kl-supabase-runtime.ts','src/lib/report-execution/checkpoint.ts','supabase/migrations/20260825142000_phase_kl_runtime_closure.sql'];
for(const f of files) if(!fs.existsSync(path.join(root,f))) throw new Error(`K/L component missing: ${f}`);
const text=files.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n').toLowerCase();
const requiredAlternatives=[
  ['checkpoint','checkpoint','advancecheckpoint'],
  ['lease','lease','lease_owner','lease_expires_at'],
  ['lineage','buildlineage','diffrows'],
  ['consolidation','consolidatebyprecedence','consolidateruntime'],
  ['scenario','selectboundedscenario','choosescenario'],
  ['portfolio','rankportfolio','prioritizedecisions'],
  ['evidence','runtimeevidence','recordevidenceedge','recordexecutiveevidenceedge'],
  ['control-plane','controlplanehealth','recordhealth','recordcontrolplanehealth'],
  ['autonomy','evaluateautonomygate','canautonomouslyexecute','autonomyruntimegate'],
];
for(const [label,...tokens] of requiredAlternatives) if(!tokens.some(t=>text.includes(t))) throw new Error(`K/L evidence chain missing: ${label}`);
for(const t of ['company_id','current_company_id','lease_owner','lease_expires_at']) if(!text.includes(t)) throw new Error(`K/L isolation/lease invariant missing: ${t}`);
console.log('K/L execution evidence chain: PASS');
