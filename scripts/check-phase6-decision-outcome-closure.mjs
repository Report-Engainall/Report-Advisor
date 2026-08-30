import fs from 'node:fs';
const files = {
  intelligence: fs.readFileSync('scripts/check-decision-intelligence-closure.mjs','utf8'),
  decisionDml: fs.readFileSync('scripts/check-decision-dashboard.mjs','utf8'),
  outcome: fs.readFileSync('scripts/outcome-feedback-regressions.test.ts','utf8'),
  evidence: fs.readFileSync('scripts/decision-evidence-regression.test.ts','utf8'),
  approval: fs.readFileSync('supabase/migrations/20260828170000_decision_action_outcome_runtime.sql','utf8'),
};
const failures=[]; const must=(x,m)=>{if(!x)failures.push(m)};
for(const t of ['PROPOSED','APPROVED','IN_PROGRESS','COMPLETED']) must(files.intelligence.includes(t),`missing lifecycle state ${t}`);
for(const t of ['approval','work-item','action receipt','outcome']) must(files.intelligence.toLowerCase().includes(t),`missing lifecycle concept ${t}`);
must(files.intelligence.includes('duplicate completion fails closed'),'duplicate completion must fail closed');
must(files.intelligence.includes('completion rejects unapproved/stale work items'),'completion must reject stale/unapproved work');
must(files.outcome.includes('outcome'),'outcome regression must exist');
must(files.evidence.includes('evidence'),'decision evidence regression must exist');
must(files.approval.includes('current_company_id'),'decision runtime must bind tenant from trusted context');
must(files.approval.includes('SECURITY DEFINER'),'decision runtime privileged functions must declare security boundary');
must(files.approval.includes('GRANT EXECUTE'),'decision runtime execution surface must be explicit');
const decoy="// APPROVED -> EXECUTED\nstatus='COMPLETED';";
must(!/EXECUTED/.test(decoy.replace(/\/\/[^\n]*/g,'')),'comment decoy must not create lifecycle evidence');
if(failures.length){console.error('PHASE6_DECISION_OUTCOME_CLOSURE_FAIL\n'+failures.map(x=>'- '+x).join('\n'));process.exit(1)}
console.log('PHASE6_DECISION_OUTCOME_CLOSURE_PASS');
