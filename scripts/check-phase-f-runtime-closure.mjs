import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const requiredFiles = ['scripts/phase-f-live-resilience-probes.mjs','scripts/check-operational-resilience-contract.mjs','scripts/check-release-resilience-manifest.mjs','scripts/check-continuous-trust-contract.mjs','.github/workflows/phase-f-live-resilience.yml','supabase/migrations/20260825050000_operational_resilience_trust.sql','supabase/migrations/20260825090000_continuous_trust_autonomous_ops.sql'];
const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Phase F runtime closure blockers:\n${missing.join('\n')}`);
const migration = fs.readFileSync(path.join(root,'supabase/migrations/20260825050000_operational_resilience_trust.sql'),'utf8');
for (const token of ['ENABLE ROW LEVEL SECURITY','company_id = public.current_company_id()','REVOKE ALL ON TABLE','expires_at > now()','blocker_count = 0']) if (!migration.includes(token)) throw new Error(`Phase F security invariant missing: ${token}`);
const workflow = fs.readFileSync(path.join(root,'.github/workflows/phase-f-live-resilience.yml'),'utf8');
for (const token of ['phase-f-live-resilience','phase-f-live-resilience-probes.mjs','RESILIENCE_BACKUP_MODE','RESILIENCE_LOGICAL_SOURCE_DB_URL','RESILIENCE_MAX_RPO_SECONDS','supabase/setup-cli@v1']) if (!workflow.includes(token)) throw new Error(`Phase F workflow invariant missing: ${token}`);
if (!workflow.includes('npm run test:operational-resilience') && !workflow.includes('check-operational-resilience-contract.mjs')) throw new Error('Phase F workflow must execute the operational resilience contract');
if (!workflow.includes('workflow_dispatch')) throw new Error('Phase F live resilience must remain explicitly dispatchable');
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
for (const script of ['test:operational-resilience','test:release-resilience-manifest','test:continuous-trust']) if (!pkg.scripts?.[script]) throw new Error(`Package gate missing: ${script}`);
const probe = fs.readFileSync(path.join(root,'scripts/phase-f-live-resilience-probes.mjs'),'utf8');
for (const token of [
  'EXACT_HEAD',
  'EXACT_HEAD must be the full 40-character commit SHA.',
  'deployment_sha',
  'deployment_id',
  'DEPLOYMENT_SHA_MISMATCH',
  'logicalBackupRestore',
  "runCommand('supabase'",
  "'db', 'dump'",
  "'--db-url'",
  'artifact_sha256',
  'rpo_seconds',
  'rto_seconds',
  'logical-',
]) if (!probe.includes(token)) throw new Error(`Logical backup/restore runtime invariant missing: ${token}`);
console.log('Phase F runtime closure contract: PASS');
