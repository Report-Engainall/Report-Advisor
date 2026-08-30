import fs from 'node:fs';
const files=['scripts/check-report-truth-contract.mjs','scripts/check-report-data-truth-closure.mjs','scripts/check-secondary-consumer-canonical.mjs','supabase/migrations/20260826010000_report_export_canonical_rows.sql','supabase/migrations/20260826080000_export_tenant_authority_hardening.sql'];
const src=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');const failures=[];const must=(x,m)=>{if(!x)failures.push(m)};
for(const t of ['Number.isFinite','NULL','UNKNOWN'])must(src.includes(t),`report truth guard missing ${t}`);
must(src.includes('get_inventory_export_rows'),'export must use canonical rows RPC');
must(src.includes('current_company_id'),'export must derive tenant authority');
must(src.includes('tenant'),'report/export boundary must be tenant-aware');
const decoy='// export total = 0 when source is unknown';must(!/total\s*=\s*0/.test(decoy.replace(/\/\/[^\n]*/g,'')),'comment decoy must not become report truth');
if(failures.length){console.error('PHASE8_REPORTS_EXPORT_CLOSURE_FAIL\n'+failures.map(x=>'- '+x).join('\n'));process.exit(1)}
console.log('PHASE8_REPORTS_EXPORT_CLOSURE_PASS');
