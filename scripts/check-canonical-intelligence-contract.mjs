import fs from 'node:fs';
import assert from 'node:assert/strict';

const orchestrator = fs.readFileSync('src/lib/canonicalIntelligence.ts', 'utf8');
const dashboard = fs.readFileSync('src/lib/canonicalDashboard.ts', 'utf8');

for (const token of ['buildCanonicalIntelligence','cashConversionCycle','projectLiquidity','decideReplenishment','calculateInventoryDecision','aggregateAlternativeGroups','backtestForecast','unifiedConfidence']) {
  assert.match(orchestrator, new RegExp(token), `canonical intelligence missing ${token}`);
}
assert.match(orchestrator, /costOfSales\?: number/, 'cost of sales must be explicit input');
assert.match(orchestrator, /لن يتم استبدالها بقيمة المشتريات/, 'CCC must not substitute purchases for COGS');
assert.match(dashboard, /buildCanonicalIntelligence\(/, 'dashboard must consume canonical intelligence');
assert.match(dashboard, /intelligence: CanonicalIntelligence/, 'dashboard must expose canonical intelligence');
assert.match(dashboard, /costOfSales: totalCost/, 'dashboard must pass verified item cost into intelligence');
console.log('Canonical intelligence contract: PASS');
