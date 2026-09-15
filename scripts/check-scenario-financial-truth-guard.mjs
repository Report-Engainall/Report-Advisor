import fs from 'node:fs';

const guard = fs.readFileSync('src/pages/ScenarioTruthGuardPage.tsx', 'utf8');
const simulator = fs.readFileSync('src/pages/CanonicalScenarioPage.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');

for (const token of [
  'fetchProfitabilitySnapshot()',
  "snapshot.status === 'CALCULATED'",
  'snapshot.revenue !== null',
  'snapshot.cost !== null',
  'snapshot.currency !== null',
  'setFinancials({ revenue: snapshot.revenue, cost: snapshot.cost, currency: snapshot.currency })',
  '<CanonicalScenarioPage\n        baseRevenue={financials.revenue}\n        baseCost={financials.cost}\n        currency={financials.currency}\n      />',
]) {
  if (!guard.includes(token)) throw new Error(`Scenario truth guard missing required boundary: ${token}`);
}

for (const token of [
  'baseRevenue: number',
  'baseCost: number',
  'currency: string',
  'formatCurrency(baseRevenue, currency)',
  'formatCurrency(baseCost, currency)',
  'formatCurrency(newRevenue, currency)',
  'formatCurrency(newCost, currency)',
  'formatCurrency(newProfit, currency)',
]) {
  if (!simulator.includes(token)) throw new Error(`Canonical scenario simulator missing required input boundary: ${token}`);
}

if (!simulator.includes('baseProfit === 0 ? null')) {
  throw new Error('Scenario simulator must fail safely when base profit is zero');
}

if (!app.includes('path="/intelligence/scenarios" element={<ScenarioTruthGuardPage />}')) {
  throw new Error('Scenario route must use the financial-truth guard');
}

if (app.includes('path="/intelligence/scenarios" element={<ScenariosPage />}')) {
  throw new Error('Scenario route must not bypass the financial-truth guard');
}

console.log('Scenario financial truth guard: PASS');
