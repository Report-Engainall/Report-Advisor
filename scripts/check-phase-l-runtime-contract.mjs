import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const migration = fs.readFileSync(path.join(root,'supabase/migrations/20260825140000_phase_l_runtime_cockpit.sql'),'utf8');
for (const token of ['control_plane_health_snapshots','executive_evidence_graph','autonomy_certification_evidence','compute_control_plane_health','can_enter_phase_l_autonomy','REVOKE ALL ON TABLE','WITH CHECK']) {
  if (!migration.includes(token)) throw new Error(`Phase L contract missing: ${token}`);
}
for (const forbidden of ['GRANT ALL TO anon','SECURITY DEFINER SET search_path=public;']) {
  if (migration.includes(forbidden)) throw new Error(`Unsafe Phase L contract token: ${forbidden}`);
}
console.log('Phase L runtime cockpit contract: PASS');
