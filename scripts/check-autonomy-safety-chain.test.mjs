import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const checker = path.join(process.cwd(), 'scripts', 'check-autonomy-safety-chain.mjs');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'autonomy-chain-'));
for (const dir of ['src/lib', 'supabase/migrations']) fs.mkdirSync(path.join(temp, dir), { recursive: true });

const files = {
  'src/lib/production-intelligence.ts': 'trustHealthy evidenceQuality confidence riskBudgetValid criticalDrift rollbackVerified isolationVerified',
  'src/lib/phase-kl-supabase-runtime.ts': "autonomyGate(domainKey) rpc('autonomy_runtime_gate'",
  'supabase/migrations/20260825140000_phase_l_runtime_cockpit.sql': `CREATE OR REPLACE FUNCTION public.can_enter_phase_l_autonomy(p_domain_key text)\nSELECT public.can_certify_autonomous_domain(p_domain_key) AND public.compute_control_plane_health() >= .9 AND current_company_id();`,
  'supabase/migrations/20260825142000_phase_kl_runtime_closure.sql': `CREATE OR REPLACE FUNCTION public.autonomy_runtime_gate(p_domain_key text)\nSELECT public.can_enter_phase_l_autonomy(p_domain_key), public.is_continuous_trust_healthy('production'), critical_drift;`,
  'supabase/migrations/20260903033000_reconcile_phase_l_autonomy_runtime_boundary.sql': `CREATE TABLE IF NOT EXISTS public.control_plane_health_snapshots;\nCREATE TABLE IF NOT EXISTS public.executive_evidence_graph;\nCREATE TABLE IF NOT EXISTS public.autonomy_certification_evidence;\nCREATE OR REPLACE FUNCTION public.compute_control_plane_health;\nCREATE OR REPLACE FUNCTION public.can_enter_phase_l_autonomy;\nCREATE OR REPLACE FUNCTION public.autonomy_runtime_gate;`,
  'supabase/migrations/20260903034000_lockdown_autonomy_runtime_execute.sql': `REVOKE ALL ON FUNCTION public.compute_control_plane_health() FROM PUBLIC;\nGRANT EXECUTE ON FUNCTION public.compute_control_plane_health() TO authenticated;\nREVOKE ALL ON FUNCTION public.can_enter_phase_l_autonomy(text) FROM PUBLIC;\nGRANT EXECUTE ON FUNCTION public.can_enter_phase_l_autonomy(text) TO authenticated;\nREVOKE ALL ON FUNCTION public.autonomy_runtime_gate(text) FROM PUBLIC;\nGRANT EXECUTE ON FUNCTION public.autonomy_runtime_gate(text) TO authenticated;`,
  'supabase/migrations/20260825150000_phase_m_certification_bundle.sql': 'can_release_production_certification rollback_passed security_audit_passed artifact_integrity_passed',
};

for (const [relative, content] of Object.entries(files)) fs.writeFileSync(path.join(temp, relative), content);
execFileSync(process.execPath, [checker], { cwd: temp, stdio: 'pipe' });

const cockpitPath = path.join(temp, 'supabase/migrations/20260825140000_phase_l_runtime_cockpit.sql');
const cockpit = fs.readFileSync(cockpitPath, 'utf8').replace(
  'public.can_certify_autonomous_domain(p_domain_key) AND public.compute_control_plane_health() >= .9',
  'public.compute_control_plane_health() >= .9 AND public.can_certify_autonomous_domain(p_domain_key)',
);
fs.writeFileSync(cockpitPath, cockpit);
assert.throws(() => execFileSync(process.execPath, [checker], { cwd: temp, stdio: 'pipe' }), /Canonical autonomy gate relation is not intact/);

fs.writeFileSync(cockpitPath, files['supabase/migrations/20260825140000_phase_l_runtime_cockpit.sql']);
const closurePath = path.join(temp, 'supabase/migrations/20260825142000_phase_kl_runtime_closure.sql');
const closure = fs.readFileSync(closurePath, 'utf8').replace(
  "public.can_enter_phase_l_autonomy(p_domain_key), public.is_continuous_trust_healthy('production')",
  "public.is_continuous_trust_healthy('production'), public.can_enter_phase_l_autonomy(p_domain_key)",
);
fs.writeFileSync(closurePath, closure);
assert.throws(() => execFileSync(process.execPath, [checker], { cwd: temp, stdio: 'pipe' }), /Autonomy runtime closure relation is not intact/);

fs.writeFileSync(closurePath, files['supabase/migrations/20260825142000_phase_kl_runtime_closure.sql']);
const lockdownPath = path.join(temp, 'supabase/migrations/20260903034000_lockdown_autonomy_runtime_execute.sql');
const lockdown = fs.readFileSync(lockdownPath, 'utf8').replace('REVOKE ALL ON FUNCTION public.autonomy_runtime_gate(text) FROM PUBLIC;', '-- weakened: public.autonomy_runtime_gate(text) remains executable by PUBLIC');
fs.writeFileSync(lockdownPath, lockdown);
assert.throws(() => execFileSync(process.execPath, [checker], { cwd: temp, stdio: 'pipe' }), /Autonomy execute lockdown missing: public\.autonomy_runtime_gate\(text\)/);

fs.writeFileSync(lockdownPath, files['supabase/migrations/20260903034000_lockdown_autonomy_runtime_execute.sql']);
const runtimePath = path.join(temp, 'src/lib/production-intelligence.ts');
fs.writeFileSync(runtimePath, `${fs.readFileSync(runtimePath, 'utf8')}\n// stale alias mutation: canAutonomouslyExecute`);
assert.throws(() => execFileSync(process.execPath, [checker], { cwd: temp, stdio: 'pipe' }), /Stale non-canonical autonomy gate reference: canAutonomouslyExecute/);

fs.rmSync(temp, { recursive: true, force: true });
console.log('Autonomy safety chain Test-of-Test: PASS');
