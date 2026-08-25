import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const callerPath = path.join(root, 'src/lib/import/canonical-commit.ts');
const migrationDir = path.join(root, 'supabase', 'migrations');

const caller = fs.readFileSync(callerPath, 'utf8');
const migrations = fs.readdirSync(migrationDir)
  .filter((name) => /\.sql$/i.test(name))
  .sort()
  .map((name) => ({ name, text: fs.readFileSync(path.join(migrationDir, name), 'utf8') }));

function latestFunctionSignature(functionName) {
  const signature = new RegExp(
    `CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+public\\.${functionName}\\s*\\(([^)]*)\\)`,
    'gi',
  );
  let match;
  let latest = null;
  for (const migration of migrations) {
    while ((match = signature.exec(migration.text))) {
      latest = { migration: migration.name, args: match[1] };
    }
  }
  return latest;
}

function parseArgs(signatureArgs) {
  return signatureArgs
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const name = part.match(/^(p_[a-z0-9_]+)/i)?.[1]?.toLowerCase();
      return name ? { name, required: !/\bDEFAULT\b/i.test(part) } : null;
    })
    .filter(Boolean);
}

function callerRpcArgs(functionName) {
  const rpc = new RegExp(
    `supabase\\.rpc\\(['"]${functionName}['"],\\s*\\{([\\s\\S]*?)\\}\\)`,
    'm',
  ).exec(caller);
  if (!rpc) return null;
  return [...rpc[1].matchAll(/(p_[a-z0-9_]+)\\s*:/gi)].map((m) => m[1].toLowerCase());
}

const targets = [
  'import_upsert_product',
  'import_upsert_customer',
  'import_upsert_sales_invoice',
];

const findings = [];
for (const fn of targets) {
  const signature = latestFunctionSignature(fn);
  const callerArgs = callerRpcArgs(fn);
  if (!signature) {
    findings.push({ fn, status: 'BLOCKED', reason: 'No authoritative migration signature found' });
    continue;
  }
  if (!callerArgs) {
    findings.push({ fn, status: 'BLOCKED', reason: 'No canonical caller found' });
    continue;
  }

  const defined = parseArgs(signature.args);
  const definedNames = new Set(defined.map((arg) => arg.name));
  const called = new Set(callerArgs);
  const missing = [...called].filter((name) => !definedNames.has(name));
  const omittedRequired = defined.filter((arg) => arg.required && !called.has(arg.name)).map((arg) => arg.name);

  findings.push({
    fn,
    migration: signature.migration,
    defined: defined.map((arg) => arg.name),
    required: defined.filter((arg) => arg.required).map((arg) => arg.name),
    called: [...called],
    missingInSignature: missing,
    omittedRequired,
    status: missing.length || omittedRequired.length ? 'FAIL' : 'PASS',
  });
}

const productSignature = latestFunctionSignature('import_upsert_product');
const productMigrationText = migrations.find((m) => m.name === productSignature?.migration)?.text ?? '';
const tenantGuard = [
  /p_company_id\s+IS\s+DISTINCT\s+FROM\s+(?:public\.)?current_company_id\s*\(\)/i,
  /current_company_id\s*\(\)\s+IS\s+DISTINCT\s+FROM\s+p_company_id/i,
  /p_company_id\s*<>\s*(?:public\.)?current_company_id\s*\(\)/i,
].some((pattern) => pattern.test(productMigrationText));

if (!tenantGuard) {
  findings.push({
    fn: 'import_upsert_product',
    status: 'FAIL',
    reason: 'Authoritative product import RPC is missing an explicit tenant-context equality guard',
  });
}

const directWrite = /supabase\.(?:from|rpc)\(/.test(caller) && /\.(?:insert|upsert|update|delete)\s*\(/.test(caller);
if (directWrite) {
  findings.push({
    fn: 'canonical-commit.ts',
    status: 'FAIL',
    reason: 'Canonical import caller contains a direct write path; governed RPC boundary must remain authoritative',
  });
}

const failures = findings.filter((item) => item.status === 'FAIL');
const blocked = findings.filter((item) => item.status === 'BLOCKED');
const report = {
  contract: 'phase-ab-import-rpc-signature-audit',
  scope: 'Phase A/B static integration closure',
  rule: 'caller arguments must match the latest authoritative import RPC signature; required parameters, tenant guard and governed write boundary are mandatory',
  findings,
  summary: {
    pass: findings.filter((item) => item.status === 'PASS').length,
    fail: failures.length,
    blocked: blocked.length,
  },
  result: failures.length || blocked.length ? 'BLOCKED' : 'PASS',
};

console.log(JSON.stringify(report, null, 2));

if (failures.length || blocked.length) process.exitCode = 2;
