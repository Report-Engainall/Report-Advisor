import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
assert.ok(app.includes('<Route path="/import/analyze" element={<Navigate to="/import" replace />} />'), 'document analysis entry must resolve to the unified import surface rather than a duplicate importer');
assert.ok(!app.includes('ExternalFileAnalysisPage'), 'retired external file analysis page must not remain wired into the application shell');

const registry = fs.readFileSync('src/lib/navigation-registry.ts', 'utf8');

assert.ok(sidebar.includes("@/lib/navigation-registry") && sidebar.includes('NAVIGATION_SECTIONS') && sidebar.includes('section.items.map'), 'Sidebar must render the canonical navigation registry rather than maintain a second local route list');

const routePaths = [...app.matchAll(/<Route\s+path=["']([^"']+)["']/g)].map((m) => m[1]);
const registryPaths = [...registry.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);

const normalize = (path) => path.replace(/\/$/, '') || '/';
const routes = new Set(routePaths.map(normalize));
const nav = new Set(registryPaths.map(normalize));

const missingRoutes = [...nav].filter((path) => !routes.has(path));
const duplicateNav = registryPaths.filter((path, i) => registryPaths.indexOf(path) !== i);
const duplicateRoutes = routePaths.filter((path, i) => routePaths.indexOf(path) !== i);
const registryMissingRoutes = [...new Set(registryPaths.map(normalize))].filter((path) => !routes.has(path));
const allowedUnlistedRoutes = new Set(['/proposal-demo', '/import/analyze']);
const registrySet = new Set(registryPaths.map(normalize));
const routesMissingRegistry = [...routes].filter((path) => path !== '/' && path !== '*' && !registrySet.has(path) && !allowedUnlistedRoutes.has(path));

if (missingRoutes.length || duplicateNav.length || duplicateRoutes.length || registryMissingRoutes.length || routesMissingRegistry.length) {
  console.error('Navigation/route contract failed.');
  if (missingRoutes.length) console.error(`Navigation targets without routes: ${missingRoutes.join(', ')}`);
  if (duplicateNav.length) console.error(`Duplicate navigation paths: ${[...new Set(duplicateNav)].join(', ')}`);
  if (duplicateRoutes.length) console.error(`Duplicate route paths: ${[...new Set(duplicateRoutes)].join(', ')}`);
  if (registryMissingRoutes.length) console.error(`Canonical navigation registry targets without routes: ${registryMissingRoutes.join(', ')}`);
  if (routesMissingRegistry.length) console.error(`Declared routes without canonical navigation entries: ${routesMissingRegistry.join(', ')}`);
  process.exit(1);
}

console.log(`PASS: canonical navigation registry ${nav.size} paths resolve to ${routes.size} declared routes; Sidebar is bound directly to NAVIGATION_SECTIONS; unlisted internal routes=${[...routes].filter((path) => path !== '/' && path !== '*' && !new Set(registryPaths.map(normalize)).has(path)).filter((path) => allowedUnlistedRoutes.has(path)).join(', ') || 'none'}.`);