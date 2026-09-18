import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/ExecutiveCommandCenterPage.tsx', 'utf8');

for (const token of [
  'fetchDashboardSnapshot',
  'fetchDashboardIntelligence',
  'get_dashboard_snapshot',
  'get_dashboard_intelligence',
  'BusinessInvestigationDrawer',
  'طابور القرار',
  'مركز الانتباه',
  'isCompleteDashboardKPIs',
]) {
  assert.ok(source.includes(token), 'missing command-center contract token: ' + token);
}

for (const banned of [
  'getReceivableStatus',
  'getMarginStatus',
  'getCollectionStatus',
  'overdueRate',
  'statusDotClass',
]) {
  assert.ok(!source.includes(banned), 'command center must not derive UI authority from: ' + banned);
}

assert.match(source, /recommendations.filter/);
assert.match(source, /alerts.slice/);
assert.match(source, /source: 'get_dashboard_intelligence'/);
assert.match(source, /source: 'get_dashboard_snapshot'/);

console.log('Executive command center product contract: PASS');
