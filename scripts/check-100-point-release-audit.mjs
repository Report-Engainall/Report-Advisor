import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const pkg = JSON.parse(read('package.json'));
const roadmap = read('docs/IMPLEMENTATION_ROADMAP.md');
const scriptsDir = path.join(root, 'scripts');
const migrationsDir = path.join(root, 'supabase', 'migrations');
const scripts = fs.readdirSync(scriptsDir);
const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
const failures = [];
let checks = 0;
function check(ok, label) { checks += 1; if (!ok) failures.push(`${checks}. ${label}`); }
function hasScript(name) { return Object.hasOwn(pkg.scripts ?? {}, name); }
function hasFile(name) { return scripts.includes(name); }
function migrationHas(pattern) { return migrations.some(f => read(path.join('supabase/migrations', f)).includes(pattern)); }

for (const [ok, label] of [
 [pkg.name === 'vite-react-typescript-starter','package identity is stable'],
 [pkg.private === true,'package remains private'],
 [pkg.type === 'module','ESM mode is explicit'],
 [hasScript('build'),'build script exists'], [hasScript('lint'),'lint script exists'], [hasScript('typecheck'),'typecheck script exists'],
 [hasScript('test:auth-tenant-convergence'),'auth tenant convergence gate is wired'], [hasScript('test:tenant-security-contract'),'tenant security gate is wired'],
 [hasScript('test:global-tenant-rls'),'global RLS gate is wired'], [hasScript('test:import-rpc-tenant-context'),'import RPC tenant gate is wired'],
 [hasScript('test:production-gate-integrity'),'production gate integrity is wired'], [hasScript('test:production-gate-runtime'),'production gate runtime is wired'],
 [hasScript('test:production-release-blockers'),'release blocker gate is wired'], [hasScript('test:operational-resilience'),'operational resilience gate is wired'],
 [hasScript('test:release-resilience-manifest'),'resilience manifest gate is wired'], [hasScript('test:phase-m-certification'),'phase M certification gate is wired'],
 [hasScript('test:watched-report-pipeline'),'watched report gate is wired'], [hasScript('test:import-runtime-governance'),'import governance gate is wired'],
 [hasScript('test:business-control-plane'),'business control-plane gate is wired'], [hasScript('test:continuous-trust'),'continuous trust gate is wired'],
]) check(ok, label);

for (const [n, label] of [
 ['check-auth-tenant-convergence.mjs','auth convergence checker'], ['check-tenant-security-contract.mjs','tenant security checker'],
 ['check-global-tenant-rls.mjs','global RLS checker'], ['check-import-rpc-tenant-context.mjs','import RPC tenant checker'],
 ['check-import-runtime-governance.mjs','import runtime checker'], ['check-import-transaction-contract.mjs','import transaction checker'],
 ['check-import-business-key.mjs','business-key checker'], ['check-file-intelligence-security.mjs','file intelligence security checker'],
 ['check-document-intelligence-contract.mjs','document intelligence checker'], ['check-watched-report-pipeline-contract.mjs','watched report checker'],
 ['check-operational-resilience-contract.mjs','resilience checker'], ['check-release-resilience-manifest.mjs','resilience manifest checker'],
 ['check-production-release-blockers.mjs','production blocker checker'], ['check-production-gate-integrity.mjs','production gate checker'],
 ['check-production-gate-runtime.mjs','production runtime checker'], ['check-phase-m-certification-contract.mjs','phase M checker'],
 ['check-phase-k-production-intelligence.mjs','phase K checker'], ['check-phase-l-runtime-contract.mjs','phase L checker'],
 ['check-business-control-plane-contract.mjs','business control-plane checker'], ['check-master-requirements-contract.mjs','master requirements checker'],
]) check(hasFile(n), `present: ${label}`);

for (const [ok, label] of [
 [migrations.length > 0,'migration directory is non-empty'], [migrations.every(f => /^\d{14}_.+\.sql$/.test(f)),'all migrations use timestamped naming'],
 [migrations.every((f,i) => i === 0 || f > migrations[i-1]),'migration filenames sort deterministically'],
 [migrationHas('current_company_id'),'canonical tenant resolver appears in migrations'], [migrationHas('SECURITY DEFINER'),'security-definer database function contract exists'],
 [migrationHas('SET search_path = public'),'security-definer search_path is pinned'], [migrationHas('REVOKE EXECUTE'),'sensitive function execute revocation is represented'],
 [migrationHas('ROW LEVEL SECURITY'),'RLS is represented in migrations'], [migrationHas('ENABLE ROW LEVEL SECURITY'),'RLS enablement is represented'],
 [migrationHas('company_id = public.current_company_id()'),'tenant predicate is represented'], [migrationHas('WITH CHECK (company_id = public.current_company_id())'),'tenant write boundary is represented'],
 [migrationHas('TO authenticated'),'authenticated policies are represented'], [migrationHas('FROM anon'),'anonymous lockdown patterns are represented'],
 [migrationHas('backup_verification_runs'),'backup verification persistence exists'], [migrationHas('slo_evidence'),'SLO evidence persistence exists'],
 [migrationHas('incident_evidence'),'incident evidence persistence exists'], [migrationHas('trust_certifications'),'trust certification persistence exists'],
 [migrationHas('blocker_count = 0'),'trust certificate blocker invariant exists'], [migrationHas('expires_at > now()'),'trust certificate expiry invariant exists'],
 [migrationHas('UNIQUE(company_id'),'tenant-scoped uniqueness exists somewhere in migrations'],
]) check(ok, label);

for (const phrase of [
 'Real Supabase adversarial tenant certification','Storage/signed URL verification','Realtime authorization','AI retrieval isolation',
 'Backup/restore drill','Staging migration dry-run','schema drift','Signed artifact','Stuck-worker/dead-letter','rollback drill',
 'Automated tenant-isolation canary suite','Backup freshness/restore verification','Queue health, stuck-worker and dead-letter alerting',
 'Artifact delivery integrity monitoring','SLO dashboards','Periodic trust certification','runtime canary runner','billing webhook liveness',
 'incident-to-regression','executive trust dashboard',
]) check(roadmap.toLowerCase().includes(phrase.toLowerCase()), `roadmap tracks: ${phrase}`);

for (const phrase of [
 'cross-tenant read/write/search/export/retrieval','Client-side-only paid-feature enforcement','Unverified/non-idempotent billing webhooks',
 'Worker without tenant context and lease','AI retrieval without tenant namespace','Raw-file access from analytics',
 'Dropped/silently ignored source fields','Failed typecheck/lint/build','Reconciliation mismatch silently committed','Review/quarantine bypass',
 'Transaction commit without explicit approval','Automation executor bypassing the unified decision chain',
 'Replenishment exceeding protected liquidity','Forecast below deterministic baseline','Production SaaS certification blocker',
 'Artifact integrity/hash verification failure','Stale/failed backup verification','Expired/blocked trust certificate','Migration drift','Failed tenant-isolation',
]) check(roadmap.toLowerCase().includes(phrase.toLowerCase()), `release blocker recorded: ${phrase}`);

if (checks !== 100) throw new Error(`Audit definition error: expected 100 checks, built ${checks}`);
if (failures.length) {
  console.error(`100-point release audit FAILED: ${failures.length} failing checks`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('100-point release audit PASS: 100/100 repository invariants satisfied');
console.log(`migrations=${migrations.length} scripts=${scripts.length}`);
