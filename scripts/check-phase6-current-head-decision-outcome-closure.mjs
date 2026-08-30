import fs from 'node:fs';
const files={
 intelligence:'scripts/check-decision-intelligence-closure.mjs',
 outcome:'scripts/outcome-feedback-regressions.test.ts',
 evidence:'scripts/decision-evidence-regression.test.ts',
 migration:'supabase/migrations/20260828170000_decision_action_outcome_runtime.sql',
};
const failures=[];
for(const [name,file] of Object.entries(files)){if(!fs.existsSync(file)){failures.push(`missing:${file}`);continue;}const s=fs.readFileSync(file,'utf8');for(const t of name==='intelligence'?['PROPOSED','APPROVED','IN_PROGRESS','COMPLETED','duplicate completion fails closed','completion rejects unapproved/stale work items']:name==='migration'?['current_company_id','SECURITY DEFINER','GRANT EXECUTE']:['outcome','evidence'])if(!s.includes(t))failures.push(`${file}:missing:${t}`)}
const decoy='// APPROVED -> EXECUTED';
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,' ').replace(/(^|\n)\s*\/\/[^\n]*/g,'$1');
if(strip(decoy).includes('EXECUTED'))failures.push('comment lifecycle bypass');
if(failures.length){console.error('PHASE6_CURRENT_HEAD_DECISION_OUTCOME_CLOSURE_FAIL\n'+failures.map(x=>`- ${x}`).join('\n'));process.exit(1)}
console.log('PHASE6_CURRENT_HEAD_DECISION_OUTCOME_CLOSURE_PASS');
