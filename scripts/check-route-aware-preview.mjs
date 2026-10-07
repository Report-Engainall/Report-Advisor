import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
const preview = readFileSync(resolve(process.cwd(), 'src/pages/ProposalDemoPage.tsx'), 'utf8');

assert.doesNotMatch(app, /isNetlifyPreview|isPrimaryPublicPreview|isGitHubPagesPublicPreview/);
assert.match(app, /const demoQuery = query\.get\('demo'\) === '1';/);
assert.match(app, /const explicitPreviewQuery = query\.get\('preview'\) === '1';/);
assert.match(app, /const authQuery = query\.get\('auth'\) === '1';/);
assert.match(app, /if \(authQuery\) return <AuthGate \/>;/);
assert.match(app, /if \(demoQuery \|\| explicitPreviewQuery \|\| location\.pathname === '\/proposal-demo'\) return <ProposalDemoPage \/>;/);
assert.match(app, /return <AuthGate><AppShell \/><\/AuthGate>;/);

for (const required of [
  '/reports/inventory',
  '/reports/sales',
  '/reports/profitability',
  '/reports/receivables',
  '/reports/demand-velocity',
  '/command-center',
  '/decision-experience',
  '/work-center',
  '/data-quality',
  '/products',
  '/reports/smart/',
  '/analytics/liquidity',
  '/trust',
  '/replay',
]) {
  assert.match(preview, new RegExp(required.replaceAll('/', '\\/')), `route surface missing: ${required}`);
}

assert.match(preview, /28-inventory-stockout-reorder\.csv/);
assert.match(preview, /LIVE_TOTALS\.profit/);
assert.match(preview, /LOW_COVERAGE_ROWS/);
assert.match(preview, /حد المعاينة/);
assert.match(preview, /بيانات شركة حيّة/);
assert.match(preview, /FIXTURE-BOUND/);

console.log('PASS route-aware preview contract: customer routes use the canonical fixture with domain-safe unavailable states.');
