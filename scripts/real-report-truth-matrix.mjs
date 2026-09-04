import fs from 'node:fs';
import path from 'node:path';

const input = process.argv[2];
const requiredLayers = ['source_truth','parsed_truth','normalized_truth','db_truth','rpc_truth','analytics_truth','ui_truth','export_truth'];
const canonicalKeys = ['sales','purchases','inventory','receivables','profitability','dashboard','rfm','abc','aging','reconciliation','currency'];
const allowedStatuses = new Set(['PASS', 'CALCULATED', 'VALID', 'PROVEN', 'INSUFFICIENT_DATA', 'BLOCKED', 'NOT_PROVEN']);
const valueBearingStatuses = new Set(['PASS', 'CALCULATED', 'VALID', 'PROVEN']);
const isMissingCanonicalValue = (value) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

if (!input) {
  console.log('READY: provide a JSON file containing runtime report evidence records to execute the truth comparison.');
  console.log(JSON.stringify({ requiredLayers, canonicalKeys, comparison: 'strict equality for canonical values + explicit mismatch list', status: 'READY' }, null, 2));
  process.exit(0);
}

const file = path.resolve(input);
if (!fs.existsSync(file)) throw new Error(`TRUTH_MATRIX_INPUT_NOT_FOUND: ${file}`);
let records;
try {
  records = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (error) {
  throw new Error(`TRUTH_MATRIX_INVALID_JSON: ${error instanceof Error ? error.message : String(error)}`);
}
if (!Array.isArray(records) || records.length === 0) throw new Error('TRUTH_MATRIX_INPUT_MUST_BE_NONEMPTY_ARRAY');

const failures = [];
const results = [];

for (const record of records) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    failures.push({ case: '<unknown>', reason: 'INVALID_RECORD' });
    continue;
  }

  const id = String(record.case_id ?? '<missing-case-id>');
  const caseFailures = [];
  if (record.case_id === undefined || record.case_id === null || String(record.case_id).trim() === '') {
    caseFailures.push('MISSING_CASE_ID');
  }

  for (const layer of requiredLayers) {
    const value = record[layer];
    if (!Object.prototype.hasOwnProperty.call(record, layer)) {
      caseFailures.push(`MISSING_LAYER:${layer}`);
      continue;
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      caseFailures.push(`INVALID_LAYER_SHAPE:${layer}`);
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(value, 'status')) {
      caseFailures.push(`MISSING_STATUS:${layer}`);
    } else if (typeof value.status !== 'string' || !allowedStatuses.has(value.status)) {
      caseFailures.push(`INVALID_STATUS:${layer}`);
    }
    for (const key of canonicalKeys) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        caseFailures.push(`MISSING_CANONICAL_KEY:${layer}:${key}`);
        continue;
      }
      if (valueBearingStatuses.has(value.status) && isMissingCanonicalValue(value[key])) {
        caseFailures.push(`MISSING_CANONICAL_VALUE:${layer}:${key}`);
      }
    }
  }

  if (!Object.prototype.hasOwnProperty.call(record, 'mismatch_list')) {
    caseFailures.push('MISSING_MISMATCH_LIST');
  } else if (!Array.isArray(record.mismatch_list)) {
    caseFailures.push('INVALID_MISMATCH_LIST_TYPE');
  } else if (record.mismatch_list.some(item => typeof item !== 'string' || item.trim() === '')) {
    caseFailures.push('INVALID_MISMATCH_LIST_ENTRY');
  }

  const mismatches = Array.isArray(record.mismatch_list) ? [...record.mismatch_list] : [];
  for (const key of canonicalKeys) {
    const values = requiredLayers.map(layer => record[layer]?.[key]);
    if (values.some(value => value === undefined)) continue;
    const serialized = values.map(value => JSON.stringify(value));
    if (new Set(serialized).size > 1) mismatches.push(`TRUTH_MISMATCH:${key}`);
  }

  const uniqueMismatches = [...new Set(mismatches)];
  if (uniqueMismatches.length) caseFailures.push({ reason: 'MISMATCH', mismatches: uniqueMismatches });

  if (caseFailures.length) {
    failures.push({ case: id, reason: caseFailures });
  }

  results.push({
    case_id: id,
    failure_count: caseFailures.length,
    mismatch_count: uniqueMismatches.length,
    status: caseFailures.length ? 'FAIL' : 'PASS',
  });
}

console.log(JSON.stringify({ records: records.length, requiredLayers, canonicalKeys, results, failures, status: failures.length ? 'FAIL' : 'PASS' }, null, 2));
if (failures.length) process.exitCode = 1;
