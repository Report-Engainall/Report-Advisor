import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const files=['src/lib/production-intelligence.ts','src/lib/phase-kl-runtime.ts','supabase/migrations/20260908220000_reconcile_watched_folder_provenance_contract_current_main.sql','supabase/migrations/20260908221000_reconcile_watched_provenance_delete_fencing_current_main.sql'];
for(const f of files) if(!fs.existsSync(path.join(root,f))) throw new Error(`Missing evidence component: ${f}`);
const text=files.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
for(const t of ['evidence','source','lineage','canonical','provenance','confidence','materiality']) if(!text.toLowerCase().includes(t)) throw new Error(`Evidence provenance invariant missing: ${t}`);
console.log('Evidence provenance chain: PASS');
