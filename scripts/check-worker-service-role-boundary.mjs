import fs from 'node:fs';
const s=fs.readFileSync('supabase/migrations/20260901040000_report_execution_worker_lifecycle.sql','utf8');
for (const fn of ['heartbeat_report_execution_job','advance_report_execution_checkpoint','complete_report_execution_job','fail_report_execution_job','retry_report_execution_job']) {
  const block=s.slice(s.indexOf(`function public.${fn}`), s.indexOf('\n$$;', s.indexOf(`function public.${fn}`))+4);
  if(!block.includes('security definer')) throw new Error(`${fn} must be security definer`);
  if(!s.includes(`grant execute on function public.${fn}`)) throw new Error(`${fn} grant missing`);
}
console.log('PASS: all worker lifecycle RPCs use the service-role boundary');
