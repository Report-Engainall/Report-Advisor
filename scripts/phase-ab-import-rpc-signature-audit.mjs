import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const callerPath = path.join(root, 'src/lib/import/canonical-commit.ts');
const migrationDir = path.join(root, 'supabase', 'migrations');

const caller = fs.readFileSync(callerPath, 'utf8');
const migrations = fs.readdirSync(migrationDir)
  .filter((name) => /\\.sql$/i.test(name))
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

function argNames(signatureArgs) {
  return signatureArgs
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.match(/^(p_[a-z0-9_]+)/i)?.[1])
    .filter(Boolean)
    .map((name) => name.toLowerCase());
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

  const defined = new Set(argNames(signature.args));
  const called = new Set(callerArgs);
  const missing = [...called].filter((name) => !defined.has(name));
  const omittedRequired = [...defined].filter((name) => !called.has(name));

  findings.push({
    fn,
    migration: signature.migration,
    defined: [...defined],
    called: [...called],
    missingInSignature: missing,
    omittedFromCaller: omittedRequired,
    status: missing.length ? 'FAIL' : 'PASS',
  });
}

const productSignature = latestFunctionSignature('import_upsert_product');
const productSignatureText = productSignature?.args ?? '';
const tenantGuard = /p_company_id\\s+IS\\s+DISTINCT\\s+FROM\\s+v_company_id/.test(
  migrations.find((m) => m.name === productSignature?.migration)?.text ?? '',
);
const directWrite = /supabase\\.(?:from|rpc)\\(/.test(caller) && /\\.(?:insert|upsert|update|delete)\\s*\\(/.test(caller);

if (!tenantGuard) {
  findings.push({
    fn: 'import_upsert_product',
    status: 'FAIL',
    reason: 'Authoritative product import RPC is missing an explicit tenant-context equality guard',
  });
}

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
  rule: 'caller arguments must match the latest authoritative import RPC signature; tenant guard and governed write boundary are required',
  findings,
  summary: {
    pass: findings.filter((item) => item.status === 'PASS').length,
    fail: failures.length,
    blocked: blocked.length,
  },
  result: failures.length || blocked.length ? 'BLOCKED' : 'PASS',
};

console.log(JSON.stringify(report, null, 2));

// A BLOCKED result is intentionally non-zero: this is a release-preventing contract,
// not a warning. It prevents A/B closure from being declared while drift is present.
if (failures.length || blocked.length) process.exitCode = 2;
