import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const checker = path.join(process.cwd(), 'scripts', 'check-autonomy-safety-chain.mjs');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'autonomy-chain-'));
for (const dir of ['src/lib', 'supabase/migrations']) fs.mkdirSync(path.join(temp, dir), { recursive: true });

const runtime = 'trustHealthy evidenceQuality confidence riskBudgetValid criticalDrift rollbackVerified isolationVerified';
const canonicalAdapter = `import type { SupabaseClient } from '@supabase/supabase-js';\nexport class PhaseKLSupabaseRuntime {\n  constructor(private readonly client: SupabaseClient) {}\n  async autonomyGate(domainKey: string) {\n    const { data, error } = await this.client.rpc('autonomy_runtime_gate', { p_domain_key: domainKey });\n    if (error) throw error;\n    return data;\n  }\n}`;
const cockpit = `CREATE OR REPLACE FUNCTION public.can_enter_phase_l_autonomy(p_domain_key text)\nRETURNS boolean LANGUAGE sql AS $$\nSELECT public.can_certify_autonomous_domain(p_domain_key)\n  AND public.compute_control_plane_health() >= .9\n  AND public.current_company_id() IS NOT NULL\n  AND NOT EXISTS (SELECT 1 FROM control_plane_drift_events WHERE severity IN ('high','critical') AND status IN ('open','blocked'));\n$$;`;
const closure = `CREATE OR REPLACE FUNCTION public.autonomy_runtime_gate(p_domain_key text)\nRETURNS jsonb LANGUAGE sql AS $$\nSELECT jsonb_build_object('eligible', public.can_enter_phase_l_autonomy(p_domain_key), 'trust_healthy', public.is_continuous_trust_healthy('production'), 'critical_drift', EXISTS (SELECT 1 FROM control_plane_drift_events));\n$$;`;
const repair = `CREATE TABLE IF NOT EXISTS public.control_plane_health_snapshots;\nCREATE TABLE IF NOT EXISTS public.executive_evidence_graph;\nCREATE TABLE IF NOT EXISTS public.autonomy_certification_evidence;\nCREATE OR REPLACE FUNCTION public.compute_control_plane_health;\nCREATE OR REPLACE FUNCTION public.can_enter_phase_l_autonomy;\nCREATE OR REPLACE FUNCTION public.autonomy_runtime_gate;`;
const lockdown = `REVOKE ALL ON FUNCTION public.compute_control_plane_health() FROM PUBLIC;\nGRANT EXECUTE ON FUNCTION public.compute_control_plane_health() TO authenticated;\nREVOKE ALL ON FUNCTION public.can_enter_phase_l_autonomy(text) FROM PUBLIC;\nGRANT EXECUTE ON FUNCTION public.can_enter_phase_l_autonomy(text) TO authenticated;\nREVOKE ALL ON FUNCTION public.autonomy_runtime_gate(text) FROM PUBLIC;\nGRANT EXECUTE ON FUNCTION public.autonomy_runtime_gate(text) TO authenticated;`;
const cert = 'can_release_production_certification rollback_passed security_audit_passed artifact_integrity_passed';

const files = {
  'src/lib/production-intelligence.ts': runtime,
  'src/lib/phase-kl-supabase-runtime.ts': canonicalAdapter,
  'supabase/migrations/20260825140000_phase_l_runtime_cockpit.sql': cockpit,
  'supabase/migrations/20260825142000_phase_kl_runtime_closure.sql': closure,
  'supabase/migrations/20260903033000_reconcile_phase_l_autonomy_runtime_boundary.sql': repair,
  'supabase/migrations/20260903034000_lockdown_autonomy_runtime_execute.sql': lockdown,
  'supabase/migrations/20260825150000_phase_m_certification_bundle.sql': cert,
};

for (const [relative, content] of Object.entries(files)) fs.writeFileSync(path.join(temp, relative), content);
const runChecker = () => execFileSync(process.execPath, [checker], { cwd: temp, stdio: 'pipe' });

// Canonical signature: PASS.
runChecker();

// Adapter method removed: FAIL.
fs.writeFileSync(path.join(temp, 'src/lib/phase-kl-supabase-runtime.ts'), canonicalAdapter.replace(/async autonomyGate[\s\S]*?\n  }\n}/, '}'));
assert.throws(runChecker, /Canonical autonomy runtime adapter method missing: autonomyGate/);
fs.writeFileSync(path.join(temp, 'src/lib/phase-kl-supabase-runtime.ts'), canonicalAdapter);

// RPC changed to a non-canonical name: FAIL.
fs.writeFileSync(path.join(temp, 'src/lib/phase-kl-supabase-runtime.ts'), canonicalAdapter.replace("rpc('autonomy_runtime_gate'", "rpc('autonomy_runtime_gate_alias'"));
assert.throws(runChecker, /Canonical autonomyGate must call rpc\('autonomy_runtime_gate'/);
fs.writeFileSync(path.join(temp, 'src/lib/phase-kl-supabase-runtime.ts'), canonicalAdapter);

// DB chain broken: FAIL.
fs.writeFileSync(
  path.join(temp, 'supabase/migrations/20260825140000_phase_l_runtime_cockpit.sql'),
  cockpit.replace('SELECT public.can_certify_autonomous_domain(p_domain_key)', 'SELECT public.compute_control_plane_health() >= .9'),
);
assert.throws(runChecker, /Canonical autonomy gate relation is not intact/);
fs.writeFileSync(path.join(temp, 'supabase/migrations/20260825140000_phase_l_runtime_cockpit.sql'), cockpit);

// Execute lockdown removed: FAIL.
fs.writeFileSync(
  path.join(temp, 'supabase/migrations/20260903034000_lockdown_autonomy_runtime_execute.sql'),
  lockdown.replace('REVOKE ALL ON FUNCTION public.autonomy_runtime_gate(text) FROM PUBLIC;', '-- weakened lockdown'),
);
assert.throws(runChecker, /Autonomy execute lockdown missing: public\.autonomy_runtime_gate\(text\)/);
fs.writeFileSync(path.join(temp, 'supabase/migrations/20260903034000_lockdown_autonomy_runtime_execute.sql'), lockdown);

// Stale alias introduced without changing the canonical adapter: FAIL.
fs.writeFileSync(
  path.join(temp, 'src/lib/phase-kl-supabase-runtime.ts'),
  `${canonicalAdapter}\n// stale alias: canAutonomouslyExecute`,
);
assert.throws(runChecker, /Stale non-canonical autonomy gate reference: canAutonomouslyExecute/);

fs.rmSync(temp, { recursive: true, force: true });
console.log('Autonomy safety chain Test-of-Test: PASS');
