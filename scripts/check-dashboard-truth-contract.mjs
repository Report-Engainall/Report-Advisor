import fs from 'node:fs';
const m=fs.readFileSync('supabase/migrations/20260827150000_dashboard_truth.sql','utf8');
const q=fs.readFileSync('src/lib/queries.ts','utf8');
for(const s of ['public.current_company_id()',"NOT IN ('cancelled','canceled','void')",'line_total IS NOT NULL','cost_price IS NOT NULL','quantity IS NOT NULL']) if(!m.includes(s)) throw new Error('Missing dashboard truth invariant: '+s);
if(!q.includes("supabase.rpc('report_dashboard_truth')")) throw new Error('Dashboard KPI adapter is not canonical.');
console.log('Dashboard truth contract: PASS');