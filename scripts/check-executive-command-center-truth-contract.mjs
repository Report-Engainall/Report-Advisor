import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('src/pages/ExecutiveCommandCenterPage.tsx', 'utf8');

assert.match(page, /fetchDashboardSnapshot\(months\)/);
assert.match(page, /fetchDashboardIntelligence\(\)/);
assert.match(page, /TruthContextStrip status=\{kpis\.status\}/);
assert.match(page, /asOf=\{asOf\}/);
assert.match(page, /asOfLabel="حتى"/);
assert.match(page, /rangeLabel=\{'آخر ' \+ months/);
assert.match(page, /get_dashboard_snapshot/);
assert.match(page, /get_dashboard_intelligence/);
assert.match(page, /لا يتم عرض قيم افتراضية/);
assert.doesNotMatch(page, /Math\.random\(|mock|synthetic|dummy/i);

console.log('Executive command center truth contract: PASS');
console.log('  - canonical snapshot status/as-of are surfaced at the top of the surface');
console.log('  - intelligence remains sourced from get_dashboard_intelligence');
console.log('  - no UI-generated fallback metrics are introduced');
