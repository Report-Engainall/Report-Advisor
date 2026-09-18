import assert from 'node:assert/strict';
import fs from 'node:fs';

const api = fs.readFileSync('api/evidence-context.mjs', 'utf8');
const contract = fs.readFileSync('src/lib/evidence-agent-contract.ts', 'utf8');

assert.match(api, /current_company_id/);
assert.match(api, /supabaseUserRequest/);
assert.match(api, /get_dashboard_snapshot/);
assert.match(api, /metric_governance/);
assert.match(api, /business_intelligence_decisions/);
assert.match(api, /recommendation_outcomes/);
assert.doesNotMatch(api, /SUPABASE_SERVICE_ROLE_KEY/);
assert.doesNotMatch(api, /POST.*insert/i);
assert.match(contract, /AGHBARI_EVIDENCE_ENDPOINT/);
for (const tool of ['get_dashboard_snapshot','get_metric_definition','get_evidence_passport','get_decision_record','get_decision_outcome']) {
  assert.match(contract, new RegExp("'" + tool + "'"));
  assert.match(api, new RegExp("'" + tool + "'"));
}
console.log('Evidence Agent boundary contract: PASS');
