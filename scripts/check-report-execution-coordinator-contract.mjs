import fs from 'node:fs';
const files = {
  'src/lib/report-execution/execution-ledger.ts': ['ReportExecutionCoordinator','assertReportExecutionReady','assertNoQuarantine','IdempotencyRegistry','InMemoryReportQueue','immutable: true'],
};
for (const [file,tokens] of Object.entries(files)) { const s=fs.readFileSync(file,'utf8'); for (const token of tokens) if(!s.includes(token)) throw new Error(`${file}: missing ${token}`); }
const migration = 'supabase/migrations/20260830021624_harden_report_execution_claim_boundary.sql';
if (!fs.existsSync(migration)) throw new Error(`Missing report execution claim boundary migration: ${migration}`);
const migrationSql = fs.readFileSync(migration,'utf8');
for (const token of ["claim_report_execution_job(uuid,text,integer)", 'revoke execute', 'from authenticated', 'from anon', 'from public']) {
  if (!migrationSql.includes(token)) throw new Error(`${migration}: missing ${token}`);
}
console.log('report execution coordinator contract: PASS');
