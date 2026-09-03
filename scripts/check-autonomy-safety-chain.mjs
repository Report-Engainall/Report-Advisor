import fs from 'node:fs';
import path from 'node:path';

export function validateAutonomySafetyChain({ runtime, supabase, cockpit, closure, repair, executeLockdown, cert }) {
  const requiredRuntime = ['trustHealthy', 'evidenceQuality', 'confidence', 'riskBudgetValid', 'criticalDrift', 'rollbackVerified', 'isolationVerified'];
  for (const token of requiredRuntime) if (!runtime.includes(token)) throw new Error(`Autonomy gate missing: ${token}`);

  const allSources = [runtime, supabase, cockpit, closure, repair, executeLockdown, cert].join('\n');
  for (const stale of ['canAutonomouslyExecute', 'can_run_phase_l_autonomy']) {
    if (allSources.includes(stale)) throw new Error(`Stale non-canonical autonomy gate reference: ${stale}`);
  }

  if (!supabase.includes("rpc('autonomy_runtime_gate'")) throw new Error('Autonomy runtime adapter missing: autonomy_runtime_gate');
  if (!supabase.includes('autonomyGate(domainKey)')) throw new Error('Autonomy runtime adapter missing: autonomyGate');

  for (const token of [
    'CREATE OR REPLACE FUNCTION public.can_enter_phase_l_autonomy',
    'public.can_certify_autonomous_domain(p_domain_key)',
    'public.compute_control_plane_health() >= .9',
    'current_company_id()',
  ]) if (!cockpit.includes(token)) throw new Error(`Canonical autonomy gate missing: ${token}`);

  if (!/CREATE OR REPLACE FUNCTION public\.can_enter_phase_l_autonomy[\s\S]*?SELECT public\.can_certify_autonomous_domain\(p_domain_key\)[\s\S]*?public\.compute_control_plane_health\(\) >= \.9[\s\S]*?current_company_id\(\)/.test(cockpit)) {
    throw new Error('Canonical autonomy gate relation is not intact');
  }

  for (const token of [
    'CREATE OR REPLACE FUNCTION public.autonomy_runtime_gate',
    'public.can_enter_phase_l_autonomy(p_domain_key)',
    "public.is_continuous_trust_healthy('production')",
    'critical_drift',
  ]) if (!closure.includes(token)) throw new Error(`Autonomy runtime closure missing: ${token}`);

  if (!/CREATE OR REPLACE FUNCTION public\.autonomy_runtime_gate[\s\S]*?public\.can_enter_phase_l_autonomy\(p_domain_key\)[\s\S]*?public\.is_continuous_trust_healthy\('production'\)/.test(closure)) {
    throw new Error('Autonomy runtime closure relation is not intact');
  }

  for (const token of [
    'CREATE TABLE IF NOT EXISTS public.control_plane_health_snapshots',
    'CREATE TABLE IF NOT EXISTS public.executive_evidence_graph',
    'CREATE TABLE IF NOT EXISTS public.autonomy_certification_evidence',
    'CREATE OR REPLACE FUNCTION public.compute_control_plane_health',
    'CREATE OR REPLACE FUNCTION public.can_enter_phase_l_autonomy',
    'CREATE OR REPLACE FUNCTION public.autonomy_runtime_gate',
  ]) if (!repair.includes(token)) throw new Error(`Autonomy runtime reconciliation missing: ${token}`);

  for (const fn of [
    'public.compute_control_plane_health()',
    'public.can_enter_phase_l_autonomy(text)',
    'public.autonomy_runtime_gate(text)',
  ]) {
    if (!executeLockdown.includes(`REVOKE ALL ON FUNCTION ${fn} FROM PUBLIC`)) throw new Error(`Autonomy execute lockdown missing: ${fn}`);
    if (!executeLockdown.includes(`GRANT EXECUTE ON FUNCTION ${fn} TO authenticated`)) throw new Error(`Autonomy authenticated execute grant missing: ${fn}`);
  }

  for (const token of ['can_release_production_certification', 'rollback_passed', 'security_audit_passed', 'artifact_integrity_passed']) {
    if (!cert.includes(token)) throw new Error(`Production certification safety link missing: ${token}`);
  }
  if (cert.includes('GRANT ALL TO anon')) throw new Error('Unsafe certification grant detected');
}

const root = process.cwd();
validateAutonomySafetyChain({
  runtime: fs.readFileSync(path.join(root, 'src/lib/production-intelligence.ts'), 'utf8'),
  supabase: fs.readFileSync(path.join(root, 'src/lib/phase-kl-supabase-runtime.ts'), 'utf8'),
  cockpit: fs.readFileSync(path.join(root, 'supabase/migrations/20260825140000_phase_l_runtime_cockpit.sql'), 'utf8'),
  closure: fs.readFileSync(path.join(root, 'supabase/migrations/20260825142000_phase_kl_runtime_closure.sql'), 'utf8'),
  repair: fs.readFileSync(path.join(root, 'supabase/migrations/20260903033000_reconcile_phase_l_autonomy_runtime_boundary.sql'), 'utf8'),
  executeLockdown: fs.readFileSync(path.join(root, 'supabase/migrations/20260903034000_lockdown_autonomy_runtime_execute.sql'), 'utf8'),
  cert: fs.readFileSync(path.join(root, 'supabase/migrations/20260825150000_phase_m_certification_bundle.sql'), 'utf8'),
});

console.log('Autonomy safety chain: PASS');
