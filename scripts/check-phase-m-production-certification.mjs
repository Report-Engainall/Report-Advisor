import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const migration=fs.readdirSync(path.join(root,'supabase','migrations')).find(n=>n.includes('phase_m_production_certification'));
if(!migration) throw new Error('Phase M migration missing');
const sql=fs.readFileSync(path.join(root,'supabase','migrations',migration),'utf8');
for(const token of ['production_certification_runs','production_rollback_drills','can_release_production_certification','tenant_isolation','backup_restore','migration_parity','artifact_integrity','rollback_verified']) if(!sql.includes(token)) throw new Error(`Phase M contract missing: ${token}`);
for(const token of ['REVOKE ALL ON TABLE','CREATE POLICY']) if(!sql.includes(token)) throw new Error(`Phase M security contract missing: ${token}`);
console.log('Phase M production certification contract: PASS');
