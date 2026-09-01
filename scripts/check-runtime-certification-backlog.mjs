import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const index = fs.readFileSync(path.join(root, 'docs/MASTER_EXECUTION_INDEX.md'), 'utf8');
const required = [
  'Real Supabase adversarial tenant certification',
  'Storage/signed URL verification',
  'Realtime authorization verification',
  'AI retrieval tenant isolation verification',
  'Backup restore drill + RPO/RTO evidence',
  'Staging migration dry-run + schema drift',
  'Signed artifact verification at deployment boundary',
  'Stuck-worker/dead-letter recovery drill',
  'Incident/SLO rollback + forward-fix drill',
  'Security/secret audit',
];
const missing = required.filter(item => !index.includes(item));
if (missing.length) throw new Error(`Certification backlog contract missing:\n${missing.join('\n')}`);

const liveRequired = [
  'Real Supabase adversarial tenant certification',
  'Backup restore drill + RPO/RTO evidence',
  'Staging migration dry-run + schema drift',
  'Stuck-worker/dead-letter recovery drill',
];
for (const item of liveRequired) {
  const marker = `- [ ] ${item}`;
  if (!index.includes(marker)) throw new Error(`Live certification item was incorrectly marked complete: ${item}`);
}
console.log(`Runtime certification backlog: PASS (${required.length} tracked blockers; ${liveRequired.length} explicitly live-required)`);
