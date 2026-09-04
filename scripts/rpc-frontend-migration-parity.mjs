import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoots = ['src'];
const sqlRoot = path.join(root, 'supabase', 'migrations');

function files(dir, extensions) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...files(full, extensions));
    else if (extensions.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const callers = new Map();
for (const file of sourceRoots.flatMap(r => files(path.join(root, r), new Set(['.ts', '.tsx', '.js', '.jsx'])))) {
  const text = fs.readFileSync(file, 'utf8');
  const re = /\.rpc\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = re.exec(text))) {
    const name = match[1];
    if (!callers.has(name)) callers.set(name, []);
    callers.get(name).push(path.relative(root, file));
  }
}

const definitions = new Set();
for (const file of files(sqlRoot, new Set(['.sql']))) {
  const text = fs.readFileSync(file, 'utf8');
  const re = /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gi;
  let match;
  while ((match = re.exec(text))) definitions.add(match[1]);
}

const missing = [...callers.keys()].filter(name => !definitions.has(name)).sort();
const dynamic = [];
for (const file of sourceRoots.flatMap(r => files(path.join(root, r), new Set(['.ts', '.tsx', '.js', '.jsx'])))) {
  const text = fs.readFileSync(file, 'utf8');
  if (/\.rpc\(\s*\$\{|\.rpc\(\s*[A-Za-z_][A-Za-z0-9_]*\s*[,)]/.test(text)) dynamic.push(path.relative(root, file));
}

console.log(JSON.stringify({
  frontendRpcNames: callers.size,
  migrationFunctionNames: definitions.size,
  missingMigrationDefinitions: missing,
  dynamicRpcCallSites: [...new Set(dynamic)].sort(),
}, null, 2));

if (missing.length) {
  console.error(`RPC MIGRATION PARITY FAILED: ${missing.join(', ')}`);
  process.exitCode = 1;
} else if (dynamic.length) {
  console.error(`RPC DYNAMIC CALL SITES REQUIRE MANUAL CONTRACT REVIEW: ${[...new Set(dynamic)].join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('PASS frontend RPC callers have source migration definitions');
  console.log('PASS no dynamic RPC call sites escaped static contract inventory');
}
