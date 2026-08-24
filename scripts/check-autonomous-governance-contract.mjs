import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const sql=fs.readFileSync(path.join(root,'supabase/migrations/20260825100000_autonomous_governance_business_intelligence.sql'),'utf8');
const required=['governance_policies','business_intelligence_decisions','kpi_evidence_snapshots','governance_alerts','can_execute_bi_decision','company_id=public.current_company_id()','REVOKE ALL ON TABLE','status=\'APPROVED\'','confidence,0) >= 0.80','is_continuous_trust_healthy'];
const missing=required.filter(x=>!sql.includes(x));
if(missing.length) throw new Error(`Autonomous governance blockers:\n${missing.join('\n')}`);
console.log('Autonomous governance contract: PASS');
