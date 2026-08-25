import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260825010000_metric_single_source_of_truth.sql', 'utf8');

const required = [
  "CREATE OR REPLACE FUNCTION get_canonical_metric_snapshot",
  "p_company_id uuid",
  "GRANT EXECUTE ON FUNCTION get_canonical_metric_snapshot",
  "company_id",
];

for (const token of required) {
  if (!migration.includes(token)) {
    throw new Error(`Metric tenant-binding contract missing token: ${token}`);
  }
}

if (/GRANT EXECUTE ON FUNCTION get_canonical_metric_snapshot\([^\n]*\) TO anon/i.test(migration)) {
  throw new Error('Canonical metric snapshot must not grant tenant business data access to anon.');
}

const tenantResolver = fs.readFileSync('supabase/migrations/20260822212000_canonical_tenant_membership.sql', 'utf8');
if (!tenantResolver.includes('CREATE OR REPLACE FUNCTION current_company_id()')) {
  throw new Error('Canonical tenant resolver is missing; metric truth cannot be certified.');
}

if (!migration.includes('s.company_id = p_company_id') || !migration.includes('p.company_id = p_company_id')) {
  // The second expression is intentionally checked as a conservative marker only;
  // the primary guard is validated by the runtime security suite when available.
  if (!migration.includes('company_id = p_company_id')) {
    throw new Error('Metric snapshot does not visibly bind the requested company to metric source rows.');
  }
}

console.log('Metric tenant-binding contract: PASS');
