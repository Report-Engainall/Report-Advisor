import fs from 'node:fs';
import path from 'node:path';

const input = process.argv[2];
const requiredLayers = ['source_truth','parsed_truth','normalized_truth','db_truth','rpc_truth','analytics_truth','ui_truth','export_truth'];

if (!input) {
  console.log('READY: provide a JSON file containing runtime report evidence records to execute the truth comparison.');
  console.log(JSON.stringify({ requiredLayers, comparison: 'strict-equality for canonical values + explicit mismatch list', status: 'READY' }, null, 2));
  process.exit(0);
}

const file = path.resolve(input);
if (!fs.existsSync(file)) throw new Error(`TRUTH_MATRIX_INPUT_NOT_FOUND: ${file}`);
const records = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!Array.isArray(records)) throw new Error('TRUTH_MATRIX_INPUT_MUST_BE_ARRAY');

const canonicalKeys = ['sales','purchases','inventory','receivables','profitability','dashboard','rfm','abc','aging','reconciliation','currency'];
const failures = [];
const results = [];

for (const record of records) {
  if (!record || typeof record !== 'object') { failures.push({ case: '<unknown>', reason: 'INVALID_RECORD' }); continue; }
  const id = String(record.case_id ?? '<missing-case-id>');
  for (const layer of requiredLayers) {
    if (!(layer in record)) failures.push({ case: id, reason: `MISSING_LAYER:${layer}` });
  }
  const mismatches = Array.isArray(record.mismatch_list) ? record.mismatch_list : [];
  for (const key of canonicalKeys) {
    const values = requiredLayers.map(layer => record[layer]?.[key]).filter(v => v !== undefined);
    if (values.length > 1) {
      const serialized = values.map(v => JSON.stringify(v));
      if (new Set(serialized).size > 1) mismatches.push(`TRUTH_MISMATCH:${key}`);
    }
  }
  const uniqueMismatches = [...new Set(mismatches)];
  if (uniqueMismatches.length) failures.push({ case: id, reason: 'MISMATCH', mismatches: uniqueMismatches });
  results.push({ case_id: id, mismatch_count: uniqueMismatches.length, status: uniqueMismatches.length ? 'FAIL' : 'PASS' });
}

console.log(JSON.stringify({ records: records.length, requiredLayers, results, failures, status: failures.length ? 'FAIL' : 'PASS' }, null, 2));
if (failures.length) process.exitCode = 1;
