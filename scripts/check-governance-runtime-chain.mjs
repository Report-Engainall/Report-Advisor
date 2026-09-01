import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const files=[
  'supabase/migrations/20260825100000_autonomous_governance_business_intelligence.sql',
  'supabase/migrations/20260825110000_governance_intelligence_hardening.sql',
  'src/lib/phase-kl-runtime.ts',
];
for(const f of files) if(!fs.existsSync(path.join(root,f))) throw new Error(`Missing governance runtime component: ${f}`);
const sql=files.slice(0,2).map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const runtime=fs.readFileSync(path.join(root,files[2]),'utf8');
for(const t of ['governance_policies','business_intelligence_decisions','governance_alerts','business_risk_budgets','decision_graph_nodes','anomaly_correlations','human_override_feedback','intelligence_quality_scores','governed_scenarios']) if(!sql.includes(t)) throw new Error(`Governance primitive missing: ${t}`);
for(const t of ['evidenceQuality','canAutonomouslyExecute','RiskBudget','evaluateAutonomyGate']) if(!runtime.includes(t)) throw new Error(`Governance-to-autonomy link missing: ${t}`);
if(/GRANT\s+ALL\s+TO\s+anon/i.test(sql)) throw new Error('Unsafe anonymous governance grant detected');
if(!/REVOKE\s+ALL\s+ON\s+TABLE[^;]+FROM\s+anon/i.test(sql)) throw new Error('Governance tables must explicitly revoke anonymous access');
console.log('Governance runtime chain: PASS');
