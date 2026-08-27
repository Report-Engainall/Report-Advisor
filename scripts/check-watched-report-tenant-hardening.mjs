import fs from 'node:fs';

const sql=fs.readFileSync('supabase/migrations/20260828200000_watched_report_tenant_hardening.sql','utf8');
const required=[
  'current_company_id()',
  "f.company_id = v_company_id",
  "raise exception 'TENANT_CONTEXT_MISMATCH'",
  'security definer',
  'set search_path = public',
  "p_state not in ('new','changed','unchanged','processing','processed','failed','dead_letter','deleted')",
  'revoke all on function public.record_watched_report_file',
  'grant execute on function public.record_watched_report_file'
];
for(const token of required) if(!sql.includes(token)) throw new Error('missing tenant hardening invariant: '+token);
if(!/where company_id=v_company_id/.test(sql)) throw new Error('final watched-file lookup is not tenant constrained');
console.log('Watched-folder tenant hardening regression: PASS');
