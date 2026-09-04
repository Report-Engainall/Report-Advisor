import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
export function validateTrustRuntimePersistence(sql) {
  for(const t of ['is_continuous_trust_healthy','tenant_isolation_canary_runs','billing_liveness_probes','artifact_verification_runs','incident_regression_links','intelligence_safety_adjustments']) if(!sql.includes(t)) throw new Error(`Trust persistence missing: ${t}`);
  return true;
}
export function validateTrustRuntimeBridge(runtime, sql) {
  if(!runtime.includes("rpc('autonomy_runtime_gate'")) throw new Error('Runtime autonomy bridge missing: autonomy_runtime_gate');
  if(!sql.includes('public.is_continuous_trust_healthy(\'production\')')) throw new Error('Autonomy SQL bridge missing: is_continuous_trust_healthy');
  return true;
}
const files=['supabase/migrations/20260825090000_continuous_trust_autonomous_ops.sql','src/lib/production-intelligence.ts','src/lib/phase-kl-supabase-runtime.ts','scripts/check-continuous-trust-contract.mjs'];
for(const f of files) if(!fs.existsSync(path.join(root,f))) throw new Error(`Missing trust runtime component: ${f}`);
const sql=fs.readFileSync(path.join(root,files[0]),'utf8');
const intelligence=fs.readFileSync(path.join(root,files[1]),'utf8');
const runtime=fs.readFileSync(path.join(root,files[2]),'utf8');
validateTrustRuntimePersistence(sql);
validateTrustRuntimeBridge(runtime, sql);
for(const t of ['trustHealthy','criticalDrift','rollbackVerified','isolationVerified']) if(!intelligence.includes(t)) throw new Error(`Decision trust invariant missing: ${t}`);
if(/GRANT\s+ALL\s+TO\s+anon/i.test(sql)) throw new Error('Unsafe anonymous privilege detected');

// Test-of-test: the checker must reject a stale/incorrect persistence identifier,
// and it must reject a runtime bridge that no longer reaches the canonical RPC.
const staleIdentifier = sql.replaceAll('incident_regression_links', 'incident_regressions');
assert.throws(() => validateTrustRuntimePersistence(staleIdentifier), /Trust persistence missing: incident_regression_links/);
const weakenedRuntime = runtime.replace("rpc('autonomy_runtime_gate'", "rpc('autonomy_runtime_gate_missing'");
assert.throws(() => validateTrustRuntimeBridge(weakenedRuntime, sql), /Runtime autonomy bridge missing: autonomy_runtime_gate/);

console.log('Continuous trust runtime chain: PASS (canonical persistence + SQL/RPC bridge + adversarial stale-identifier and bridge test-of-test)');
