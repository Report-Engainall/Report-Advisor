import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
const page = readFileSync(resolve(process.cwd(), 'src/pages/ProposalDemoPage.tsx'), 'utf8');

assert.match(app, /const isNetlifyPreview = host\.endsWith\('--aghbari-report-advisor\.netlify\.app'\)/);
assert.match(app, /if \(demoQuery \|\| isNetlifyPreview\) return <ProposalDemoPage \/>;/);
assert.doesNotMatch(app, /return \(isNetlifyPreview \|\| demoQuery\)\s*\n\s*\? <ProposalDemoPage \/>/);

assert.match(page, /function PreviewBusinessSurface\(\{ path \}: \{ path: string \}\)/);
assert.match(page, /function ProposalCommercialDemoPage\(\)/);
assert.match(page, /previewRoute = location\.pathname !== '\/proposal-demo'/);
assert.match(page, /previewRoute\s*\n\s*\? <PreviewBusinessSurface path=\{location\.pathname\}/);

console.log('PASS preview route truth contract: Netlify previews use the source-backed route-aware surface; /proposal-demo remains the explicit commercial proposal.');
