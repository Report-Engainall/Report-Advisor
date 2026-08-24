import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const candidates=['scripts/check-backup-integrity.mjs','scripts/check-restore-integrity.mjs','scripts/check-disaster-recovery.mjs'];
const existing=candidates.filter(f=>fs.existsSync(path.join(root,f)));
if(existing.length<2) throw new Error(`Recovery contract incomplete: found ${existing.length}/${candidates.length}`);
const text=existing.map(f=>fs.readFileSync(path.join(root,f),'utf8').toLowerCase()).join('\n');
for(const token of ['backup','restore','rollback']) if(!text.includes(token)) throw new Error(`Recovery contract missing: ${token}`);
console.log(`RECOVERY CONTRACT: PASS (${existing.length} checks)`);
