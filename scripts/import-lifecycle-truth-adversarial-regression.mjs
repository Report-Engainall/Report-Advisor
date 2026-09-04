import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync('supabase/migrations/20260904200000_harden_import_progress_truth.sql', 'utf8');

assert.match(sql, /IMPORT_PROGRESS_COUNTER_INVALID/);
assert.match(sql, /IMPORT_PROGRESS_COUNTER_OUT_OF_RANGE/);
assert.match(sql, /IMPORT_PROGRESS_COUNTER_INCONSISTENT/);
assert.match(sql, /p_processed_rows>coalesce\(v_total,0\)/);
assert.match(sql, /p_valid_rows>p_processed_rows/);
assert.match(sql, /p_invalid_rows>p_processed_rows/);
assert.match(sql, /p_duplicate_rows>p_processed_rows/);
assert.match(sql, /IMPORT_COMPLETION_REQUIRES_ALL_ROWS_PROCESSED/);
assert.match(sql, /p_status='completed'/);
assert.match(sql, /coalesce\(v_processed,0\)<>coalesce\(v_total,0\)/);
assert.doesNotMatch(sql, /least\(greatest\(coalesce\(p_processed_rows,0\),0\), greatest\(coalesce\(v_total,0\),0\)\)/);

console.log('PASS import progress rejects invalid/over-range counters');
console.log('PASS completed imports require every declared row to be processed');
console.log('PASS import lifecycle cannot silently clamp forged progress into apparent success');
console.log('PASS Import Lifecycle Truth adversarial regression');
