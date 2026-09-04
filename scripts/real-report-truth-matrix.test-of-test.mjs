import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = path.join(process.cwd(), 'scripts/real-report-truth-matrix.mjs');
const baseLayer = Object.fromEntries([
  ['status','PROVEN'],
  ...['sales','purchases','inventory','receivables','profitability','dashboard','rfm','abc','aging','reconciliation','currency'].map(key => [key, {value:key}]),
]);
const base = [{ case_id:'TOT-BASE', ...Object.fromEntries(['source_truth','parsed_truth','normalized_truth','db_truth','rpc_truth','analytics_truth','ui_truth','export_truth'].map(layer => [layer, {...baseLayer}])), mismatch_list:[] }];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'truth-matrix-test-'));
function run(name, record) {
  const file = path.join(tmp, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(record));
  const result = spawnSync(process.execPath, [script, file], {encoding:'utf8'});
  if (result.status === 0) throw new Error(`TEST-OF-TEST FAILED: mutation '${name}' unexpectedly passed`);
}

const missingLayer = JSON.parse(JSON.stringify(base)); delete missingLayer[0].export_truth; run('missing-layer', missingLayer);
const missingKey = JSON.parse(JSON.stringify(base)); delete missingKey[0].rpc_truth.currency; run('missing-key', missingKey);
const malformedMismatch = JSON.parse(JSON.stringify(base)); malformedMismatch[0].mismatch_list = {}; run('malformed-mismatch-list', malformedMismatch);
const missingStatus = JSON.parse(JSON.stringify(base)); delete missingStatus[0].ui_truth.status; run('missing-status', missingStatus);
const stale = JSON.parse(JSON.stringify(base)); stale[0].analytics_truth.sales = {value:'stale'}; run('stale-layer', stale);
const empty = [{}]; run('all-empty-record', empty);

console.log(JSON.stringify({status:'PASS', mutations_rejected:['missing-layer','missing-key','malformed-mismatch-list','missing-status','stale-layer','all-empty-record']}, null, 2));
