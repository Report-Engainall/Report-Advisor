import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
const sidebar = await readFile(new URL('../src/components/Sidebar.tsx', import.meta.url), 'utf8');

const routePaths = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
const sidebarPaths = [...sidebar.matchAll(/path:'([^']+)'/g)].map((m) => m[1]);

const routeSet = new Set(routePaths);
const sidebarSet = new Set(sidebarPaths);
const missingFromApp = sidebarPaths.filter((path) => !routeSet.has(path));
const missingFromSidebar = routePaths.filter((path) => path !== '*' && !sidebarSet.has(path));

const requiredRoutes = ['/import/analyze', '/decision-experience', '/metrics', '/reports/executive'];
const missingRequired = requiredRoutes.filter((path) => !routeSet.has(path) || !sidebarSet.has(path));

if (missingFromApp.length || missingFromSidebar.length || missingRequired.length) {
  console.error(JSON.stringify({ missingFromApp, missingFromSidebar, missingRequired }, null, 2));
  process.exit(1);
}

if (routePaths.length !== new Set(routePaths).size) {
  console.error('FAIL: duplicate route declarations detected');
  process.exit(1);
}
if (sidebarPaths.length !== new Set(sidebarPaths).size) {
  console.error('FAIL: duplicate sidebar paths detected');
  process.exit(1);
}

console.log(`PASS: ${routePaths.length} application routes and ${sidebarPaths.length} sidebar links are in parity.`);
console.log(`PASS: required product routes present: ${requiredRoutes.join(', ')}`);
