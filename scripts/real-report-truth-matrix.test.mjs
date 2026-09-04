import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const layers = ['source_truth','parsed_truth','normalized_truth','db_truth','rpc_truth','analytics_truth','ui_truth','export_truth'];
const keys = ['sales','purchases','inventory','receivables','profitability','dashboard','rfm','abc','aging','reconciliation','currency'];
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'truth-matrix-'));
const input = path.join(root, 'case.json');

const makeRecord = (status = 'PROVEN', value = 'canonical-value') => {
  const record = { case_id: 'truth-test', mismatch_list: [] };
  for (const layer of layers) record[layer] = Object.fromEntries([['status', status], ...keys.map(key => [key, value])]);
  return record;
};

const run = (record) => {
  fs.writeFileSync(input, JSON.stringify([record], null, 2));
  return spawnSync(process.execPath, ['scripts/real-report-truth-matrix.mjs', input], { encoding: 'utf8' });
};

const valid = run(makeRecord());
assert.equal(valid.status, 0, valid.stderr || valid.stdout);
assert.match(valid.stdout, /"status": "PASS"/);

const missingPositive = makeRecord();
missingPositive.db_truth.sales = null;
const rejectedPositive = run(missingPositive);
assert.notEqual(rejectedPositive.status, 0);
assert.match(rejectedPositive.stdout, /MISSING_CANONICAL_VALUE:db_truth:sales/);

const allowedInsufficient = makeRecord('INSUFFICIENT_DATA');
allowedInsufficient.db_truth.sales = null;
const acceptedInsufficient = run(allowedInsufficient);
assert.equal(acceptedInsufficient.status, 0, acceptedInsufficient.stderr || acceptedInsufficient.stdout);

const invalidMismatchEntry = makeRecord();
invalidMismatchEntry.mismatch_list = [''];
const rejectedMismatchEntry = run(invalidMismatchEntry);
assert.notEqual(rejectedMismatchEntry.status, 0);
assert.match(rejectedMismatchEntry.stdout, /INVALID_MISMATCH_LIST_ENTRY/);

console.log('Real-report truth matrix semantic test: PASS (positive-value null, insufficient-data null, and mismatch-entry attacks covered)');
