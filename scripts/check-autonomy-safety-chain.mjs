import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const runtime=fs.readFileSync(path.join(root,'src/lib/production-intelligence.ts'),'utf8');
const supabase=fs.readFileSync(path.join(root,'src/lib/phase-kl-supabase-runtime.ts'),'utf8');
const sql=fs.readFileSync(path.join(root,'supabase/migrations/20260825142000_phase_kl_runtime_closure.sql'),'utf8');
const cert=fs.readFileSync(path.join(root,'supabase/migrations/20260825150000_phase_m_certification_bundle.sql'),'utf8');

for(const token of ['trustHealthy','evidenceQuality','confidence','riskBudgetValid','criticalDrift','rollbackVerified','isolationVerified']) {
  if(!runtime.includes(token)) throw new Error(`Autonomy gate missing: ${token}`);
}
const hasCanonicalClientLink = (source) => source.includes('autonomy_runtime_gate') && source.includes('autonomyGate');
if(!hasCanonicalClientLink(supabase)) throw new Error('Autonomy runtime client link missing: canonical autonomy_runtime_gate/autonomyGate');
for(const token of ['is_continuous_trust_healthy','current_company_id()','critical_drift','can_enter_phase_l_autonomy']) {
  if(!sql.includes(token)) throw new Error(`Autonomy SQL safety link missing: ${token}`);
}
for(const token of ['can_release_production_certification','rollback_passed','security_audit_passed','artifact_integrity_passed']) {
  if(!cert.includes(token)) throw new Error(`Production certification safety link missing: ${token}`);
}
if(cert.includes('GRANT ALL TO anon')) throw new Error('Unsafe certification grant detected');

// Test-of-test: a weakened client contract must be rejected.
const weakenedClient = supabase.replaceAll('autonomy_runtime_gate', 'missing_runtime_gate');
if(hasCanonicalClientLink(weakenedClient)) throw new Error('Autonomy test-of-test failed: weakened runtime gate was accepted');

console.log('Autonomy safety chain: PASS');
