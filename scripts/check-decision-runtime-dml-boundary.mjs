import fs from 'node:fs';

const path = 'src/lib/decision-automation/vertical-slice-runtime.ts';
const source = fs.readFileSync(path, 'utf8');
const recommendationMigration = 'supabase/migrations/20260830170000_harden_runtime_recommendation_evidence_boundary.sql';
const recommendationSql = fs.readFileSync(recommendationMigration, 'utf8');

const forbidden = [
  /from\(['"]recommendations['"]\)\s*\.insert\s*\(/,
  /from\(['"]business_intelligence_decisions['"]\)\s*\.insert\s*\(/,
  /from\(['"]alerts['"]\)\s*\.insert\s*\(/,
];

const failures = forbidden.filter((pattern) => pattern.test(source));
if (failures.length) {
  console.error('Decision runtime DML boundary regression: FAIL');
  console.error('Lifecycle-sensitive decision/recommendation/alert inserts must use canonical RPCs.');
  process.exit(1);
}

for (const required of [
  "rpc('create_runtime_recommendation'",
  "rpc('create_runtime_decision'",
  "rpc('notify_decision_work_item'",
]) {
  if (!source.includes(required)) {
    console.error(`Decision runtime DML boundary regression: missing ${required}`);
    process.exit(1);
  }
}

for (const required of [
  'p_evidence_snapshot_id uuid',
  'RECOMMENDATION_EVIDENCE_REQUIRED',
  'REVOKE ALL ON FUNCTION public.create_runtime_recommendation',
  'GRANT EXECUTE ON FUNCTION public.create_runtime_recommendation',
]) {
  if (!recommendationSql.includes(required)) {
    console.error(`Decision runtime recommendation evidence boundary regression: missing ${required}`);
    process.exit(1);
  }
}

// Test-of-test: comment-only decoys must not satisfy the executable evidence gate.
const stripSqlComments = (sql) => sql
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|\n)\s*--[^\n]*/g, '$1');
const tampered = stripSqlComments(recommendationSql)
  .replaceAll('RECOMMENDATION_EVIDENCE_REQUIRED', '')
  .replaceAll('p_evidence_snapshot_id uuid', '') + '\n-- RECOMMENDATION_EVIDENCE_REQUIRED\n-- p_evidence_snapshot_id uuid';
if (stripSqlComments(tampered).includes('RECOMMENDATION_EVIDENCE_REQUIRED')) {
  throw new Error('Decision runtime recommendation evidence test-of-test accepted comment-only gate evidence');
}

console.log('Decision runtime DML boundary regression: PASS');
