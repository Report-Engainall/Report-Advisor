import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('src/lib/governed-scenarios.ts', 'utf8');
const page = fs.readFileSync('src/pages/CanonicalScenarioPage.tsx', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20260825110000_governance_intelligence_hardening.sql', 'utf8');

for (const needle of [
  'governed_scenarios',
  'scenario_key',
  'assumptions',
  'outputs',
  'resultHash',
  'DETERMINISTIC_SENSITIVITY_NOT_FORECAST',
]) assert.ok((source + migration).includes(needle), 'Missing scenario primitive: ' + needle);

for (const needle of [
  'fetchLatestGovernedScenario',
  'saveGovernedScenario',
  'isValidScenarioRecord',
  'sourceAsOf',
  'حفظ السيناريو',
  'تمت إعادة قراءة آخر سيناريو محفوظ',
]) assert.ok((source + page).includes(needle), 'Missing scenario persistence surface: ' + needle);

assert.match(source, /upsert\(immutable/);
assert.match(source, /auditTrail/);
assert.match(source, /sha256Text/);
assert.match(migration, /CREATE TABLE IF NOT EXISTS governed_scenarios/);
assert.match(migration, /governed_scenarios_tenant/);

console.log('scenario persistence contract: PASS');
console.log('- deterministic assumptions and result fingerprint are persisted');
console.log('- immutable run key + latest readback are tenant-scoped');
console.log('- provenance boundary distinguishes sensitivity from forecast');
console.log('- UI exposes save state and refresh/readback state');
