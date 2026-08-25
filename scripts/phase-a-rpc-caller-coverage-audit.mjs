import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcRoot = path.join(root, 'src');
const migrationDir = path.join(root, 'supabase', 'migrations');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(file);
    return /\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name) ? [file] : [];
  });
}

const sourceFiles = walk(srcRoot);
const migrations = fs.readdirSync(migrationDir)
  .filter((name) => /\.sql$/i.test(name))
  .sort()
  .map((name) => ({ name, text: fs.readFileSync(path.join(migrationDir, name), 'utf8') }));

function latestSignature(functionName) {
  const re = new RegExp(`CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+public\\.${functionName}\\s*\\(([^)]*)\\)`, 'gi');
  let latest = null;
  for (const migration of migrations) {
    let match;
    while ((match = re.exec(migration.text))) latest = { migration: migration.name, args: match[1] };
  }
  return latest;
}

function parseSignatureArgs(text) {
  return text.split(',').map((part) => part.trim()).filter(Boolean).map((part) => {
    const name = part.match(/^(p_[a-z0-9_]+)/i)?.[1]?.toLowerCase();
    return name ? { name, required: !/\bDEFAULT\b/i.test(part) } : null;
  }).filter(Boolean);
}

const calls = [];
const rpcRe = /supabase\.rpc\(\s*['"]([a-z0-9_]+)['"]\s*,\s*\{([\s\S]*?)\}\s*\)/gi;
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = rpcRe.exec(text))) {
    const args = [...match[2].matchAll(/(p_[a-z0-9_]+)\s*:/gi)].map((m) => m[1].toLowerCase());
    calls.push({ functionName: match[1], file: path.relative(root, file), args: [...new Set(args)] });
  }
}

const findings = calls.map((call) => {
  const signature = latestSignature(call.functionName);
  if (!signature) return { ...call, status: 'BLOCKED', reason: 'No authoritative SQL function signature found' };
  const defined = parseSignatureArgs(signature.args);
  const names = new Set(defined.map((arg) => arg.name));
  const missingInSignature = call.args.filter((arg) => !names.has(arg));
  const omittedRequired = defined.filter((arg) => arg.required && !call.args.includes(arg.name)).map((arg) => arg.name);
  return {
    ...call,
    migration: signature.migration,
    defined: defined.map((arg) => arg.name),
    missingInSignature,
    omittedRequired,
    status: missingInSignature.length || omittedRequired.length ? 'FAIL' : 'PASS',
  };
});

const uniqueFunctions = [...new Set(calls.map((call) => call.functionName))];
const failures = findings.filter((item) => item.status === 'FAIL');
const blocked = findings.filter((item) => item.status === 'BLOCKED');
const report = {
  contract: 'phase-a-rpc-caller-coverage-audit',
  scope: 'Phase A static RPC integration coverage across src',
  rule: 'Every discovered Supabase RPC caller must map to the latest authoritative SQL signature with no unknown or omitted required parameters',
  summary: {
    sourceFilesScanned: sourceFiles.length,
    rpcCallSites: calls.length,
    uniqueRpcFunctions: uniqueFunctions.length,
    pass: findings.filter((item) => item.status === 'PASS').length,
    fail: failures.length,
    blocked: blocked.length,
  },
  findings,
  result: failures.length || blocked.length ? 'BLOCKED' : 'PASS',
};

console.log(JSON.stringify(report, null, 2));
if (failures.length || blocked.length) process.exitCode = 2;
