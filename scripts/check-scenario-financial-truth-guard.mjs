import fs from 'node:fs';

const guard = fs.readFileSync('src/pages/ScenarioTruthGuardPage.tsx', 'utf8');
const simulator = fs.readFileSync('src/pages/CanonicalScenarioPage.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');

const requiredGuardPatterns = [
  /fetchProfitabilitySnapshot\(\)/,
  /snapshot\.status\s*===\s*['"]CALCULATED['"]/, 
  /snapshot\.revenue\s*!==\s*null/,
  /snapshot\.cost\s*!==\s*null/,
  /setFinancials\(\s*\{\s*revenue\s*:\s*snapshot\.revenue\s*,\s*cost\s*:\s*snapshot\.cost(?:\s*,\s*currency\s*:\s*snapshot\.currency)?\s*\}\s*\)/s,
  /<CanonicalScenarioPage\s+baseRevenue=\{financials\.revenue\}\s+baseCost=\{financials\.cost\}\s+currency=\{financials\.currency\}\s*\/>/s,
];

for (const pattern of requiredGuardPatterns) {
  if (!pattern.test(guard)) throw new Error(`Scenario truth guard missing required boundary: ${pattern}`);
}

for (const token of ['baseRevenue: number', 'baseCost: number', 'formatCurrency(baseRevenue)', 'formatCurrency(baseCost)']) {
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
