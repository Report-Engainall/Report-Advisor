import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
const page = readFileSync(resolve(process.cwd(), 'src/pages/ProposalDemoPage.tsx'), 'utf8');

assert.doesNotMatch(app, /isNetlifyPreview|isPrimaryPublicPreview|isGitHubPagesPublicPreview/);
assert.match(app, /const demoQuery = query\.get\('demo'\) === '1';/);
assert.match(app, /const explicitPreviewQuery = query\.get\('preview'\) === '1';/);
assert.match(app, /const authQuery = query\.get\('auth'\) === '1';/);
assert.match(app, /if \(authQuery\) return <AuthGate \/>;/);
assert.match(app, /if \(demoQuery \|\| explicitPreviewQuery \|\| location\.pathname === '\/proposal-demo'\) return <ProposalDemoPage \/>;/);
assert.match(app, /return <AuthGate><AppShell \/><\/AuthGate>;/);

assert.match(page, /function PreviewBusinessSurface\(\{ path \}: \{ path: string \}\)/);
assert.match(page, /function ProposalCommercialDemoPage\(\)/);
assert.match(page, /previewRoute = location\.pathname !== '\/proposal-demo'/);
assert.match(page, /previewRoute\s*\n\s*\? <PreviewBusinessSurface path=\{location\.pathname\}/);
assert.match(page, /function PreviewNavigation\(\{ currentPath \}: \{ currentPath: string \}\)/);
assert.match(page, /اختبار الدخول الحقيقي/);

console.log('PASS preview route truth contract: Netlify previews use the source-backed route-aware surface; /proposal-demo remains the explicit commercial proposal.');
