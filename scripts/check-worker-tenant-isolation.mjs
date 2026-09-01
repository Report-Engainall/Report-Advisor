import fs from 'node:fs';
const s=fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql','utf8');
const functions=['heartbeat_report_execution_job','advance_report_execution_checkpoint','complete_report_execution_job','fail_report_execution_job','retry_report_execution_job'];
for(const fn of functions){const start=s.indexOf(`function public.${fn}`);const end=s.indexOf('\n$$;',start);const block=s.slice(start,end);if(!block.includes('company_id = public.current_company_id()')) throw new Error(`${fn} is missing tenant scope`);}
console.log(`PASS: tenant isolation enforced on ${functions.length}/${functions.length} lifecycle RPCs`);
