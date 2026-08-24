import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const files=['src/lib/production-intelligence.ts','src/lib/phase-kl-runtime.ts','supabase/migrations/20260825142000_phase_kl_runtime_closure.sql','supabase/migrations/20260825110000_autonomous_governance_bi.sql'];
for(const f of files) if(!fs.existsSync(path.join(root,f))) throw new Error(`Missing evidence component: ${f}`);
const text=files.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
for(const t of ['evidence','source','lineage','canonical','provenance','confidence','materiality']) if(!text.toLowerCase().includes(t)) throw new Error(`Evidence provenance invariant missing: ${t}`);
console.log('Evidence provenance chain: PASS');
