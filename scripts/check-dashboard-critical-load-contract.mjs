import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

for (const token of [
  "lazy(() => import('@/components/ui/Charts')",
  '<Suspense fallback=',
  'TrendChart',
  'CategoryPieChart',
  'HorizontalBarChart',
]) {
  assert.ok(source.includes(token), 'missing dashboard critical-load token: ' + token);
}

assert.ok(!source.includes("import { TrendChart, CategoryPieChart, HorizontalBarChart } from '@/components/ui/Charts';"), 'dashboard must not eagerly import chart bundle');
console.log('Dashboard critical-load contract: PASS');
