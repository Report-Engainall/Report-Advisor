import fs from 'node:fs';
import assert from 'node:assert/strict';

const migration = fs.readFileSync(
  'supabase/migrations/20260830032500_enforce_single_default_company_membership.sql',
  'utf8',
);

assert.match(
  migration,
  /CREATE UNIQUE INDEX IF NOT EXISTS uq_company_memberships_one_active_default[\s\S]*ON public\.company_memberships \(user_id\)[\s\S]*WHERE is_active = true AND is_default = true;/,
  'single active default membership invariant is not enforced',
);
assert.match(
  migration,
  /idx_company_memberships_user_active_default/,
  'default-company lookup index is missing',
);

console.log('Company default context contract: PASS');

const customerResolverMigration = fs.readFileSync(
  'supabase/migrations/20260925170000_reconcile_current_customer_company_id.sql',
  'utf8',
);

assert.match(
  customerResolverMigration,
  /create\s+or\s+replace\s+function\s+public\.current_customer_company_id\s*\([\s\S]*?from\s+public\.profiles\s+p[\s\S]*?where\s+p\.id\s*=\s*auth\.uid\(\)/i,
  'customer tenant resolver must remain bound to the authenticated customer profile organization_id',
);
assert.doesNotMatch(
  customerResolverMigration,
  /select\s+public\.current_company_id\s*\(\s*\)/i,
  'customer tenant resolver must not collapse into the staff/company tenant resolver',
);
assert.match(
  customerResolverMigration,
  /grant\s+execute\s+on\s+function\s+public\.current_customer_company_id\s*\([^)]*\)\s+to\s+authenticated\s*,?\s*service_role/i,
  'customer tenant resolver execute grants must remain explicit',
);

console.log('Customer tenant resolver parity contract: PASS');
