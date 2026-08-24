import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const sql=fs.readFileSync(path.join(root,'supabase/migrations/20260825110000_governance_intelligence_hardening.sql'),'utf8');
const required=['business_risk_budgets','decision_graph_nodes','decision_graph_edges','anomaly_correlations','human_override_feedback','intelligence_quality_scores','governed_scenarios','REVOKE ALL ON TABLE','company_id=public.current_company_id()','status=\'active\'','expires_at','consumed_risk < b.max_risk','is_continuous_trust_healthy'];
const missing=required.filter(x=>!sql.includes(x));
if(missing.length) throw new Error(`Governance intelligence blockers:\n${missing.join('\n')}`);
console.log('Governance intelligence hardening contract: PASS');
