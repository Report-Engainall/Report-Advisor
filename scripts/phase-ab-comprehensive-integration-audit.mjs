import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcRoot = path.join(root, 'src');
const migrationDir = path.join(root, 'supabase', 'migrations');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(?:ts|tsx|js|mjs|sql)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const migrations = walk(migrationDir)
  .filter((file) => file.endsWith('.sql'))
  .sort()
  .map((file) => ({ file, name: path.relative(root, file), text: fs.readFileSync(file, 'utf8') }));

const sourceFiles = walk(srcRoot)
  .filter((file) => /\.(?:ts|tsx|js|mjs)$/i.test(file))
  .map((file) => ({ file, name: path.relative(root, file), text: fs.readFileSync(file, 'utf8') }));

function latestSignature(functionName) {
  const re = new RegExp(`CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+(?:public\\.)?${functionName}\\s*\\(([^)]*)\\)`, 'gi');
  let latest = null;
  for (const migration of migrations) {
    let match;
    while ((match = re.exec(migration.text))) latest = { migration: migration.name, args: match[1] };
  }
  return latest;
}

function parseArgNames(args) {
  return args.split(',').map((part) => part.trim()).filter(Boolean)
    .map((part) => ({
      name: part.match(/^(p_[a-z0-9_]+)/i)?.[1]?.toLowerCase(),
      required: !/\bDEFAULT\b/i.test(part),
    }))
    .filter((x) => x.name);
}

const findings = [];
const rpcCalls = new Map();

// Capture every literal RPC call first. This establishes coverage even when
// the second argument is a variable/helper rather than an inline object.
const rpcNamePattern = /supabase\.rpc\(\s*['"]([a-z0-9_]+)['"]\s*,/gi;
for (const file of sourceFiles) {
  let match;
  while ((match = rpcNamePattern.exec(file.text))) {
    const fn = match[1].toLowerCase();
    if (!rpcCalls.has(fn)) rpcCalls.set(fn, []);
    rpcCalls.get(fn).push({ file: file.name, args: null, static_args: false });
  }
}

// Upgrade calls whose second argument is an inline object with statically
// visible p_* keys. Calls using a variable/helper remain explicitly BLOCKED
// rather than silently disappearing from the audit.
const rpcInlinePattern = /supabase\.rpc\(\s*['"]([a-z0-9_]+)['"]\s*,\s*\{([\s\S]*?)\}\s*\)/gi;
for (const file of sourceFiles) {
  let match;
  while ((match = rpcInlinePattern.exec(file.text))) {
    const fn = match[1].toLowerCase();
    const args = [...match[2].matchAll(/\b(p_[a-z0-9_]+)\s*:/gi)].map((m) => m[1].toLowerCase());
    const calls = rpcCalls.get(fn) ?? [];
    const candidate = calls.find((call) => call.file === file.name && !call.static_args);
    if (candidate) {
      candidate.args = [...new Set(args)];
      candidate.static_args = true;
    } else {
      calls.push({ file: file.name, args: [...new Set(args)], static_args: true });
      rpcCalls.set(fn, calls);
    }
  }
}

for (const [fn, calls] of rpcCalls) {
  const signature = latestSignature(fn);
  if (!signature) {
    findings.push({ type: 'RPC_SIGNATURE', fn, status: 'BLOCKED', reason: 'No authoritative public migration signature found', calls });
    continue;
  }
  const defined = parseArgNames(signature.args);
  const definedNames = new Set(defined.map((x) => x.name));
  for (const call of calls) {
    if (!call.static_args) {
      findings.push({
        type: 'RPC_CALLER_COVERAGE',
        fn,
        file: call.file,
        migration: signature.migration,
        status: 'BLOCKED',
        reason: 'RPC parameter object is dynamic/helper-derived and cannot be proven statically; runtime/typed evidence required',
      });
      continue;
    }
    const called = new Set(call.args ?? []);
    const unknown = [...called].filter((x) => !definedNames.has(x));
    const missingRequired = defined.filter((x) => x.required && !called.has(x.name)).map((x) => x.name);
    findings.push({
      type: 'RPC_SIGNATURE',
      fn,
      file: call.file,
      migration: signature.migration,
      called: call.args,
      defined: [...definedNames],
      unknown,
      missingRequired,
      status: unknown.length || missingRequired.length ? 'FAIL' : 'PASS',
    });
  }
}

for (const file of sourceFiles) {
  if (!/src[\\/]lib[\\/]import[\\/]/.test(file.name)) continue;
  if (/\.(?:insert|upsert|update|delete)\s*\(/.test(file.text) && /supabase\.(?:from|rpc)\(/.test(file.text)) {
    findings.push({ type: 'IMPORT_WRITE_BOUNDARY', file: file.name, status: 'FAIL', reason: 'Import layer contains direct mutation syntax; canonical import must remain behind governed RPC/import engine boundary' });
  }
}

const product = latestSignature('import_upsert_product');
if (product) {
  const text = migrations.find((m) => m.name === product.migration)?.text ?? '';
  const guarded = /p_company_id\s+IS\s+DISTINCT\s+FROM\s+(?:public\.)?current_company_id\s*\(\)/i.test(text)
    || /p_company_id\s*<>\s*(?:public\.)?current_company_id\s*\(\)/i.test(text);
  findings.push({ type: 'TENANT_GUARD', fn: 'import_upsert_product', migration: product.migration, status: guarded ? 'PASS' : 'FAIL', reason: guarded ? undefined : 'Explicit tenant-context equality guard not found' });
}

const failures = findings.filter((x) => x.status === 'FAIL');
const blocked = findings.filter((x) => x.status === 'BLOCKED');
const report = {
  contract: 'phase-ab-comprehensive-integration-audit',
  scope: 'A/B static integration closure across source RPC callers, authoritative migration signatures and import write boundaries',
  findings,
  summary: {
    checks: findings.length,
    pass: findings.filter((x) => x.status === 'PASS').length,
    fail: failures.length,
    blocked: blocked.length,
    rpc_functions_seen: rpcCalls.size,
  },
  result: failures.length ? 'FAIL' : blocked.length ? 'BLOCKED' : 'PASS',
};
console.log(JSON.stringify(report, null, 2));
if (failures.length || blocked.length) process.exitCode = 2;
