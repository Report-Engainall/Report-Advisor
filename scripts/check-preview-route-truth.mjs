import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');

assert.match(app, /const isNetlifyPreview = host\.endsWith\('--aghbari-report-advisor\.netlify\.app'\)/);
assert.match(app, /return isNetlifyPreview \? <AppShell \/> : <AuthGate><AppShell \/><\/AuthGate>;/);
assert.match(app, /if \(demoQuery\) return <ProposalDemoPage \/>;/);
assert.doesNotMatch(app, /return \(isNetlifyPreview \|\| demoQuery\)\s*\n\s*\? <ProposalDemoPage \/>/);

console.log('PASS preview route contract: Netlify previews render the real AppShell; proposal demo requires explicit ?demo=1 or /proposal-demo.');
