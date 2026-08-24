import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const file = path.join(root,'supabase/migrations/20260825090000_continuous_trust_autonomous_ops.sql');
if (!fs.existsSync(file)) throw new Error('Continuous trust migration missing');
const sql = fs.readFileSync(file,'utf8');
const required = [
  'tenant_isolation_canary_runs','automation_remediation_runs','intelligence_safety_adjustments',
  'billing_liveness_probes','artifact_verification_runs','incident_regression_links',
  'REVOKE ALL ON TABLE','company_id = public.current_company_id()',
  'is_continuous_trust_healthy','is_trust_certificate_valid','status IN (\'failed\',\'blocked\')'
];
const missing = required.filter(x => !sql.includes(x));
if (missing.length) throw new Error(`Continuous trust blockers:\n${missing.join('\n')}`);
const roadmap = fs.readFileSync(path.join(root,'docs/IMPLEMENTATION_ROADMAP.md'),'utf8');
const roadmapChecks = [
  'Runtime canary runner against isolated tenants',
  'Dynamic intelligence threshold controller using measured outcome drift',
  'Billing webhook liveness/replay canary runner',
  'Signed artifact verification at deployment boundary',
  'Automatic incident-to-regression proposal generation'
];
for (const item of roadmapChecks) if (!roadmap.includes(item)) throw new Error(`Roadmap item missing: ${item}`);
console.log('Continuous trust contract: PASS');
