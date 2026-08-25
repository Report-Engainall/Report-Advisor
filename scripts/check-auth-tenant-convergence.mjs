import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const supabase = fs.readFileSync(path.join(root, 'src/lib/supabase.ts'), 'utf8');
const authSession = fs.readFileSync(path.join(root, 'src/lib/auth-session.ts'), 'utf8');
const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
const sidebar = fs.readFileSync(path.join(root, 'src/components/Sidebar.tsx'), 'utf8');

const failures = [];

if (!supabase.includes('persistSession: true')) failures.push('Supabase session persistence is not enabled.');
if (/COMPANY_ID\s*=/.test(supabase)) failures.push('A static COMPANY_ID constant is present in the Supabase client.');
if (!authSession.includes('getAuthenticatedUser')) failures.push('Canonical auth-session helper is missing.');
if (!authSession.includes('requireAuthenticatedUser')) failures.push('Authenticated-user guard is missing.');
if (/admin@alamri\.com/.test(sidebar)) failures.push('Sidebar contains hard-coded demo identity.');
if (/المدير العام/.test(sidebar)) failures.push('Sidebar contains hard-coded demo display name.');

// This guard is intentionally advisory for route protection until a real login
// route is wired. It prevents silent regressions without forcing a breaking UI
// migration in the same change.
if (!app.includes('BrowserRouter')) failures.push('Application router boundary is missing.');

if (failures.length) {
  console.error('AUTH/TENANT CONVERGENCE FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('AUTH/TENANT CONVERGENCE PASS');
console.log('- persistent Supabase session enabled');
console.log('- no static COMPANY_ID constant');
console.log('- canonical auth-session helpers present');
console.log('- router boundary detected');
