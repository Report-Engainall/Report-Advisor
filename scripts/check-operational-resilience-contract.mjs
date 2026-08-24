import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const migration = path.join(root,'supabase/migrations/20260825050000_operational_resilience_trust.sql');
if (!fs.existsSync(migration)) throw new Error('Operational resilience migration missing');
const sql = fs.readFileSync(migration,'utf8');
const required = [
  'operational_health_snapshots','backup_verification_runs','slo_evidence','incident_evidence','trust_certifications',
  'authenticated_operational_health_tenant','authenticated_backup_verification_tenant','authenticated_slo_evidence_tenant',
  'authenticated_incident_evidence_tenant','authenticated_trust_certifications_tenant','REVOKE ALL ON TABLE',
  'is_trust_certificate_valid','expires_at > now()','blocker_count = 0'
];
const missing = required.filter(x => !sql.includes(x));
if (missing.length) throw new Error(`Operational resilience contract blockers:\n${missing.join('\n')}`);
const roadmap = fs.readFileSync(path.join(root,'docs/IMPLEMENTATION_ROADMAP.md'),'utf8');
for (const item of ['Automated tenant-isolation canary suite','Automated migration dry-run and schema drift detection','Backup freshness/restore verification','Queue health, stuck-worker and dead-letter alerting','Artifact delivery integrity monitoring','SLO dashboards, error budgets and incident evidence ledger','Periodic trust certification']) if (!roadmap.includes(item)) throw new Error(`Roadmap resilience item missing: ${item}`);
console.log('Operational resilience contract: PASS');
