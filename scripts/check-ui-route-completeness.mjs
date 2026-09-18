import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const pages = fs.readdirSync('src/pages').filter((name) => name.endsWith('Page.tsx'));

const routePaths = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
const sidebarPaths = [...sidebar.matchAll(/path\s*:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
const pageSourceFiles = [
  { file: 'src/App.tsx', source: app },
  ...pages.map((file) => ({ file: 'src/pages/' + file, source: fs.readFileSync('src/pages/' + file, 'utf8') })),
];
const pageImports = pageSourceFiles.flatMap(({ source }) => [
  ...source.matchAll(/from\s+['"]@\/pages\/([^'"]+)['"]/g),
  ...source.matchAll(/import\([^)]*['"]@\/pages\/([^'"]+)['"]/g),
].map((m) => m[1]));

const unique = (items) => [...new Set(items)];
const missingFromSidebar = routePaths.filter((path) => path !== '*' && !sidebarPaths.includes(path));
const missingRoutesForSidebar = sidebarPaths.filter((path) => !routePaths.includes(path));
const importedPageFiles = unique(pageImports.map((file) => file.endsWith('.tsx') ? file : `${file}.tsx`));
const unreferencedPageFiles = pages.filter((file) => !importedPageFiles.includes(file));

const fail = (label, values) => {
  if (!values.length) return;
  console.error(`FAIL ${label}:\n${values.map((v) => `  - ${v}`).join('\n')}`);
  process.exitCode = 1;
};

console.log(`UI route count: ${routePaths.length}`);
console.log(`Sidebar navigation count: ${unique(sidebarPaths).length}`);
console.log(`Page component files: ${pages.length}`);

fail('routes missing from sidebar navigation', missingFromSidebar);
fail('sidebar links missing a registered route', missingRoutesForSidebar);

const knownEntryOrLegacyFiles = new Set([
  'LoginPage.tsx',
  'CanonicalImportPage.tsx',
  'CanonicalScenarioPage.tsx',
  'ReceivablesReportPageCanonical.tsx',
  'ReceivablesReportCanonicalPage.tsx',
  'IntelligencePages.tsx',
]);
const unexpectedOrphans = unreferencedPageFiles.filter((file) => !knownEntryOrLegacyFiles.has(file));
fail('page components neither imported nor explicitly allowlisted as entry/legacy', unexpectedOrphans);

if (process.exitCode) {
  console.error('UI route/navigation completeness: FAIL');
  process.exit();
}

console.log('UI route/navigation completeness: PASS');
console.log('Note: route registration does not certify runtime rendering or every interactive control.');
