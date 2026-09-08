import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reports = fs.readFileSync(path.join(root, 'src/pages/ReportsPage.tsx'), 'utf8');
const download = fs.readFileSync(path.join(root, 'src/lib/report-execution/download.ts'), 'utf8');
const runner = fs.readFileSync(path.join(root, 'src/lib/report-execution/durable-production-runner.ts'), 'utf8');
const adapter = fs.readFileSync(path.join(root, 'src/lib/report-execution/durable-worker-adapter.ts'), 'utf8');

// Interactive browser exports are presentation/download operations. They must not
// acquire the protected durable worker adapter or execute service-role worker RPCs.
assert.match(reports, /downloadReportArtifact/);
assert.match(reports, /fetchSalesExportRows/);
assert.match(reports, /fetchPurchaseExportRows/);
assert.match(reports, /fetchInventoryExportRows/);
assert.doesNotMatch(reports, /durable-production-runner/);
assert.doesNotMatch(reports, /durable-worker-adapter/);
assert.doesNotMatch(reports, /SupabaseReportExecutionStore/);

// The durable boundary remains explicit and tenant-bound; worker RPCs stay behind
// the server/worker store rather than becoming browser-callable implementation detail.
assert.match(runner, /runDurableProductionLifecycle/);
assert.match(runner, /const tenantId = input\.request\.tenantId/);
assert.match(adapter, /claim_report_execution_job/);
assert.match(adapter, /p_company_id: tenantId/);
assert.match(adapter, /p_lease_token: job\.leaseToken/);

// Do not allow this contract guard to be satisfied by merely importing the worker
// internals into the interactive report surface.
assert.doesNotMatch(download, /SupabaseReportExecutionStore/);
assert.doesNotMatch(download, /runDurableProductionLifecycle/);

console.log('Report export / durable execution boundary: PASS');
