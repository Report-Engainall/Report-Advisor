import assert from 'node:assert/strict';
import fs from 'node:fs';

const script = fs.readFileSync('scripts/provision-e2e-actors.mjs', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20261002050000_reconcile_e2e_actor_service_role_key_guard.sql', 'utf8');
const workflow = fs.readFileSync('.github/workflows/full-product-browser-e2e.yml', 'utf8');

assert.match(script, /auth\.admin\.createUser/);
assert.match(script, /createActor\(/);
assert.match(script, /provision_e2e_test_membership/);
assert.doesNotMatch(script, /\.from\(['"]company_memberships['"]\)[\s\S]{0,300}\.insert\(/);
assert.doesNotMatch(script, /\.from\(['"]company_memberships['"]\)[\s\S]{0,300}\.update\(/);
assert.match(script, /tagged =/);
assert.match(script, /actorCredentials\(/);
assert.match(script, /persistActorCredentials\(/);
assert.doesNotMatch(script, /E2E_EXISTING_USER_NOT_TAGGED/);
assert.match(script, /ensureApproverCredentials/);
assert.match(script, /GITHUB_RUN_ID/);
assert.match(script, /GITHUB_ENV/);

assert.match(migration, /security definer/i);
assert.match(migration, /set search_path = public, pg_catalog/i);
assert.doesNotMatch(migration, /request\.jwt\.claim\.role/);
assert.doesNotMatch(migration, /request\.jwt\.claims/);
assert.match(migration, /revoke all on function public\.provision_e2e_test_membership/i);
assert.match(migration, /grant execute on function public\.provision_e2e_test_membership/i);
assert.match(migration, /e2e_actor/);
assert.match(migration, /e2e_actor_membership_provisioned/);

assert.match(workflow, /Start exact Netlify preview with serverless API/);
assert.ok(workflow.includes('node scripts/provision-e2e-actors.mjs'));
const previewStep = workflow.indexOf('Start exact Netlify preview with serverless API');
const provisionStep = workflow.indexOf('node scripts/provision-e2e-actors.mjs', previewStep);
assert.ok(previewStep >= 0 && provisionStep > previewStep);
assert.match(workflow, /REPORT_ADVISOR_SUPABASE_URL: \$\{\{ secrets\.REPORT_ADVISOR_SUPABASE_URL \}\}/);
assert.match(workflow, /SUPABASE_SERVICE_ROLE_KEY: \$\{\{ secrets\.SUPABASE_SERVICE_ROLE_KEY \}\}/);
assert.match(workflow, /Prepare rerunnable E2E actor credentials/);

console.log('E2E_ACTOR_PROVISIONING_CONTRACT_PASS');
