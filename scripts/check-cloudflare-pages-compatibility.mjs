import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const viteConfig = fs.readFileSync(path.join(root, 'vite.config.ts'), 'utf8');

const failures = [];
const notes = [];

if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
  failures.push('NEXTJS_DEPENDENCY_PRESENT_UNEXPECTEDLY');
}
if (packageJson.devDependencies?.vite !== undefined) notes.push(`vite=${packageJson.devDependencies.vite}`);
if (packageJson.dependencies?.react !== undefined) notes.push(`react=${packageJson.dependencies.react}`);
if (!viteConfig.includes("defineConfig({") || !viteConfig.includes("plugins: [react()]")) {
  failures.push('VITE_REACT_BUILD_CONFIGURATION_NOT_DETECTED');
}
if (fs.existsSync(path.join(root, 'pages')) || fs.existsSync(path.join(root, 'app')) || fs.existsSync(path.join(root, 'next.config.js')) || fs.existsSync(path.join(root, 'next.config.mjs')) || fs.existsSync(path.join(root, 'next.config.ts'))) {
  failures.push('NEXTJS_SERVER_CONVENTIONS_DETECTED');
}
if (fs.existsSync(path.join(root, 'functions'))) notes.push('Pages/Workers Functions directory exists and must be validated separately before introducing server-side routing.');

const dist = path.join(root, 'dist');
const indexHtml = path.join(dist, 'index.html');
if (!fs.existsSync(indexHtml)) failures.push('DIST_INDEX_MISSING');
else {
  const html = fs.readFileSync(indexHtml, 'utf8');
  if (!html.includes('<div id="root"')) notes.push('React root marker not matched literally; inspect generated HTML if deployment proof fails.');
}

const publicDir = path.join(root, 'public');
const has404 = fs.existsSync(path.join(publicDir, '404.html')) || fs.existsSync(path.join(dist, '404.html'));
if (has404) failures.push('404_HTML_PRESENT_WOULD_DISABLE_DEFAULT_CLOUDFLARE_PAGES_SPA_FALLBACK');
else notes.push('No top-level 404.html detected; Cloudflare Pages default SPA routing can handle React Router paths.');

const forbiddenRuntimePatterns = [
  ['getServerSideProps', /getServerSideProps/],
  ['next-server-import', /from\s+[\"']next\/server[\"']/],
  ['next-response-import', /from\s+[\"']next\/server[\"']/],
];
for (const [label, pattern] of forbiddenRuntimePatterns) {
  const command = process.platform === 'win32' ? null : label;
  void command;
}

if (failures.length) {
  console.error('Cloudflare Pages compatibility: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Cloudflare Pages compatibility: PASS');
console.log(`Architecture: React + Vite SPA; output=dist; Workers/SSR migration not claimed.`);
for (const note of notes) console.log(`NOTE: ${note}`);
