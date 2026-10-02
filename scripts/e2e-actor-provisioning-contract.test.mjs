import assert from 'node:assert/strict';
import fs from 'node:fs';

const script = fs.readFileSync('scripts/provision-e2e-actors.mjs', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20261002040000_e2e_actor_provisioning_contract.sql', 'utf8');
const workflow = fs.readFileSync('.github/workflows/full-product-browser-e2e.yml', 'utf8');

assert.match(script, /auth\.admin\.createUser/);
assert.match(script, /auth\.admin\.updateUserById/);
assert.match(script, /provision_e2e_test_membership/);
assert.doesNotMatch(script, /\.from\(['"]company_memberships['"]\)[\s\S]{0,300}\.insert\(/);
assert.doesNotMatch(script, /\.from\(['"]company_memberships['"]\)[\s\S]{0,300}\.update\(/);
assert.match(script, /E2E_EXISTING_USER_NOT_TAGGED/);

assert.match(migration, /security definer/i);
assert.match(migration, /set search_path = ''/i);
assert.match(migration, /request\.jwt\.claim\.role/);
assert.match(migration, /service_role/);
assert.match(migration, /revoke all on function public\.provision_e2e_test_membership/i);
assert.match(migration, /grant execute on function public\.provision_e2e_test_membership/i);
assert.match(migration, /e2e_actor/);
assert.match(migration, /e2e_actor_membership_provisioned/);

assert.match(workflow, /Provision deterministic E2E actors/);
const provisionStep = workflow.indexOf('Provision deterministic E2E actors');
const previewStep = workflow.indexOf('Start exact Netlify preview with serverless API');
assert.ok(provisionStep >= 0 && provisionStep < previewStep);
assert.match(workflow, /SUPABASE_SERVICE_ROLE_KEY: \$\{\{ secrets\.SUPABASE_SERVICE_ROLE_KEY \}\}/);
assert.match(workflow, /TEST_APPROVER_EMAIL: \$\{\{ secrets\.REPORT_ADVISOR_E2E_APPROVER_EMAIL \}\}/);

console.log('E2E_ACTOR_PROVISIONING_CONTRACT_PASS');
