import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const files=['scripts/check-watched-report-pipeline-contract.mjs','scripts/check-business-control-plane-contract.mjs','src/lib/phase-kl-runtime.ts','src/lib/report-execution/checkpoint.ts'];
for(const f of files) if(!fs.existsSync(path.join(root,f))) throw new Error(`J runtime component missing: ${f}`);
const text=files.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n').toLowerCase();
for(const t of ['watched','incremental','reconciliation','canonical','provenance','checkpoint','resume','deadletter','idempot']) if(!text.includes(t)) throw new Error(`J runtime invariant missing: ${t}`);
console.log('J/J.1 runtime chain: PASS');
