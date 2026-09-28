import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync('supabase/migrations/20260928233000_post_upload_execution_task_ledger.sql', 'utf8');
const adapter = readFileSync('src/lib/report-execution/durable-worker-adapter.ts', 'utf8');
const runner = readFileSync('src/lib/report-execution/durable-production-runner.ts', 'utf8');
const server = readFileSync('src/server/canonical-import-executor.ts', 'utf8');
const adapterBoundary = readFileSync('src/lib/import/canonical-production-adapter.ts', 'utf8');
const queries = readFileSync('src/lib/queries.ts', 'utf8');
const ui = readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');
for (const token of ['create table if not exists public.report_execution_tasks','report_execution_tasks_tenant_select','start_report_execution_task','complete_report_execution_task','fail_report_execution_task','Execution task ordering violation','grant execute on function public.start_report_execution_task']) assert.ok(migration.includes(token), `missing task-ledger invariant: ${token}`);
for (const token of ["from('report_execution_tasks')","rpc('start_report_execution_task'","rpc('complete_report_execution_task'","rpc('fail_report_execution_task'"]) assert.ok(adapter.includes(token), `missing worker task RPC: ${token}`);
for (const token of ['activeTask','store.startTask','store.completeTask','store.failTask']) assert.ok(runner.includes(token), `missing durable task lifecycle: ${token}`);
for (const token of ["mode === 'enqueue'",'enqueue_report_execution_job','payload.durableJobId','REPORT_EXECUTION_JOB_SOURCE_HASH_MISMATCH']) assert.ok(server.includes(token), `missing authoritative queue boundary: ${token}`);
for (const token of ['enqueueCanonicalImportForExecution',"mode === 'enqueue'",'durableJobId?: string']) assert.ok(adapterBoundary.includes(token), `missing browser orchestration boundary: ${token}`);
for (const token of ['ReportExecutionTaskRecord','fetchReportExecutionTasks']) assert.ok(queries.includes(token), `missing task readback contract: ${token}`);
for (const token of ['LIVE EXECUTION REPORT','توزيع المهام الفعلي بعد السحب','EXECUTION REPORT','تقرير ما حدث فعليًا بعد السحب','fetchReportExecutionTasks','enqueueCanonicalImportForExecution']) assert.ok(ui.includes(token), `missing visible post-upload execution report: ${token}`);
console.log('Report execution task ledger contract: PASS');
