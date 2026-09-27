import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const registry = fs.readFileSync('src/lib/navigation-registry.ts', 'utf8');

const routePaths = [...app.matchAll(/<Route\s+path=["']([^"']+)["']/g)].map((m) => m[1]);
const navPaths = [...sidebar.matchAll(/path:\s*["']([^"']+)["']/g)].map((m) => m[1]);
const registryPaths = [...registry.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);

const normalize = (path) => path.replace(/\/$/, '') || '/';
const routes = new Set(routePaths.map(normalize));
const nav = new Set(navPaths.map(normalize));

const missingRoutes = [...nav].filter((path) => !routes.has(path));
const duplicateNav = navPaths.filter((path, i) => navPaths.indexOf(path) !== i);
const duplicateRoutes = routePaths.filter((path, i) => routePaths.indexOf(path) !== i);
const registryMissingRoutes = [...new Set(registryPaths.map(normalize))].filter((path) => !routes.has(path));
const allowedUnlistedRoutes = new Set(['/proposal-demo']);

if (missingRoutes.length || duplicateNav.length || duplicateRoutes.length || registryMissingRoutes.length) {
  console.error('Navigation/route contract failed.');
  if (missingRoutes.length) console.error(`Navigation targets without routes: ${missingRoutes.join(', ')}`);
  if (duplicateNav.length) console.error(`Duplicate navigation paths: ${[...new Set(duplicateNav)].join(', ')}`);
  if (duplicateRoutes.length) console.error(`Duplicate route paths: ${[...new Set(duplicateRoutes)].join(', ')}`);
  if (registryMissingRoutes.length) console.error(`Canonical navigation registry targets without routes: ${registryMissingRoutes.join(', ')}`);
  process.exit(1);
}

console.log(`PASS: ${nav.size} sidebar paths + ${new Set(registryPaths).size} canonical registry paths resolve to ${routes.size} declared routes; unlisted internal routes=${[...routes].filter((path) => path !== '/' && path !== '*' && !new Set(registryPaths.map(normalize)).has(path)).filter((path) => allowedUnlistedRoutes.has(path)).join(', ') || 'none'}.`);
