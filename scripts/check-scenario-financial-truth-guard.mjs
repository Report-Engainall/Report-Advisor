import fs from 'node:fs';

const guard = fs.readFileSync('src/pages/ScenarioTruthGuardPage.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');

for (const token of ['fetchProfitabilitySnapshot()', "snapshot.status === 'CALCULATED'", 'snapshot.revenue !== null', 'snapshot.cost !== null', '<ScenariosPage />']) {
  if (!guard.includes(token)) throw new Error(`Scenario truth guard missing required boundary: ${token}`);
}

if (!app.includes('path="/intelligence/scenarios" element={<ScenarioTruthGuardPage />}')) {
  throw new Error('Scenario route must use the financial-truth guard');
}

if (app.includes('path="/intelligence/scenarios" element={<ScenariosPage />}')) {
  throw new Error('Scenario route must not bypass the financial-truth guard');
}

console.log('Scenario financial truth guard: PASS');
