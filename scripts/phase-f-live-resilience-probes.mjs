#!/usr/bin/env node
/** Phase F live resilience probes. Fail-closed; never synthesize PASS. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const backupMode = (process.env.RESILIENCE_BACKUP_MODE || 'logical').trim().toLowerCase() || 'logical';
if (!['managed', 'logical'].includes(backupMode)) throw new Error(`invalid_resilience_backup_mode:${backupMode}`);

const baseRequired = [
  'EXACT_HEAD',
  'RESILIENCE_TARGET_ENV',
  'RESILIENCE_OPERATIONAL_TOKEN',
  'RESILIENCE_CANARY_AUTH_TOKEN',
  'RESILIENCE_HEALTH_URL',
  'RESILIENCE_CANARY_URL',
  'RESILIENCE_ROLLBACK_DRILL_URL',
];
const required = [
  ...baseRequired,
  ...(backupMode === 'managed'
    ? ['RESILIENCE_BACKUP_VERIFY_URL']
    : ['RESILIENCE_LOGICAL_SOURCE_DB_URL', 'RESILIENCE_MAX_RPO_SECONDS']),
];

const reportDir = path.join(process.cwd(), 'artifacts', 'phase-f');
const reportPath = path.join(reportDir, 'phase-f-readiness.json');
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const target = process.env.RESILIENCE_TARGET_ENV?.trim() || null;
const missing = required.filter(name => !process.env[name]?.trim());

fs.mkdirSync(reportDir, { recursive: true });

function writeReport(status, reason, extra = {}) {
  const report = {
    exactHead,
    targetEnv: target,
    status,
    reason,
    required,
    missing,
    checkedAt: new Date().toISOString(),
    ...extra,
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`PHASE_F_STATUS=${status}`);
  console.log(`PHASE_F_REPORT=${reportPath}`);
  console.log(`PHASE_F_REASON=${reason}`);
}

if (missing.length) {
  writeReport(
    'BLOCKED EXTERNAL',
    'Required live resilience secrets/targets are not provisioned in the execution environment.',
    { blockedDependency: missing },
  );
  console.error('FAIL-CLOSED: missing Phase F live configuration:');
  for (const name of missing) console.error(`- ${name}`);
  process.exit(2);
}

if (/^(prod|production)$/i.test(target) && process.env.RESILIENCE_ALLOW_PRODUCTION !== 'true') {
  writeReport(
    'NOT READY',
    'Production target requires explicit RESILIENCE_ALLOW_PRODUCTION=true.',
    { policyViolation: 'RESILIENCE_ALLOW_PRODUCTION' },
  );
  console.error('FAIL-CLOSED: production requires explicit RESILIENCE_ALLOW_PRODUCTION=true');
  process.exit(3);
}

const checks = [];

function runCommand(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
      ...options,
    }).trim();
  } catch (error) {
    const stderr = typeof error?.stderr === 'string' ? error.stderr.trim() : '';
    const stdout = typeof error?.stdout === 'string' ? error.stdout.trim() : '';
    const diagnostics = [stderr, stdout].filter(Boolean).join('\n');
    const boundedDiagnostics = diagnostics.length > 12000
      ? `HEAD:\n${diagnostics.slice(0, 3000)}\n...TRUNCATED...\nTAIL:\n${diagnostics.slice(-9000)}`
      : diagnostics;
    const exitCode = Number.isInteger(error?.status) ? error.status : null;
    const signal = typeof error?.signal === 'string' ? error.signal : null;
    const code = typeof error?.code === 'string' ? error.code : null;
    throw new Error(`${command}_failed:exit_code=${exitCode ?? 'unknown'}:signal=${signal ?? 'none'}:code=${code ?? 'none'}:${boundedDiagnostics || error?.message || String(error)}`);
  }
}

function runDockerPsql(databaseUrl, sql) {
  return runCommand('docker', [
    'run', '--rm', '--network', 'host',
    '-e', `PGURI=${databaseUrl}`,
    '-e', `QUERY=${sql}`,
    'postgres:17',
    'sh', '-lc',
    'psql "$PGURI" -v ON_ERROR_STOP=1 -At -c "$QUERY"',
  ]);
}

function runDockerPsqlFile(databaseUrl, filePath) {
  return runCommand('docker', [
    'run', '--rm', '--network', 'host',
    '-v', `${path.resolve(filePath)}:/tmp/phase-f-backup.sql:ro`,
    '-e', `PGURI=${databaseUrl}`,
    'postgres:17',
    'sh', '-lc',
    'psql "$PGURI" -v ON_ERROR_STOP=1 -f /tmp/phase-f-backup.sql',
  ]);
}

function parseTableCounts(raw) {
  const result = {};
  for (const line of raw.split(/\r?\n/).map(value => value.trim()).filter(Boolean)) {
    const [tableName, rowCount] = line.split('|');
    if (!tableName) continue;
    result[tableName] = Number(rowCount);
  }
  return result;
}

function stableJson(value) {
  return JSON.stringify(value, Object.keys(value).sort());
}

async function logicalBackupRestore() {
  const projectRef = process.env.SUPABASE_PROJECT_REF?.trim() || '';
  const explicitSource = process.env.RESILIENCE_LOGICAL_SOURCE_DB_URL?.trim() || '';
  const dbPassword = process.env.SUPABASE_DB_PASSWORD?.trim() || '';
  const temporaryAccessToken = process.env.SUPABASE_TEMPORARY_ACCESS_TOKEN?.trim()
    || process.env.SUPABASE_MANAGEMENT_TOKEN?.trim()
    || '';
  if ((dbPassword || temporaryAccessToken) && !projectRef) {
    throw new Error('logical_backup_project_ref_not_configured');
  }
  const jitEnabled = !dbPassword && Boolean(temporaryAccessToken);
  const password = dbPassword || temporaryAccessToken;
  const querySuffix = jitEnabled ? '?options=-c%20jit%3Don' : '';
  const source = explicitSource
    || (password
      ? `postgresql://postgres.${encodeURIComponent(projectRef)}:${encodeURIComponent(password)}@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres${querySuffix}`
      : '');
  if (!source) throw new Error('logical_backup_source_db_url_not_configured');
  const maxRpoSeconds = Number(process.env.RESILIENCE_MAX_RPO_SECONDS);
  if (!Number.isFinite(maxRpoSeconds) || maxRpoSeconds < 0) {
    throw new Error('invalid_max_rpo_seconds');
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phase-f-logical-'));
  const backupPath = path.join(workDir, 'public-data.sql');
  const exactSnapshotSql = 'select clock_timestamp()::text';
  const countSql = `select coalesce(string_agg(format('select %L as table_name, count(*) as row_count from %I.%I', table_schema, table_name), ' union all ' order by table_name), 'select null::text as table_name, 0::bigint as row_count where false') from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE'`;

  let localDbUrl = null;
  let localStarted = false;
  const startedAt = Date.now();

  try {
    runCommand('supabase', ['init'], { cwd: workDir });
    fs.cpSync(
      path.join(process.cwd(), 'supabase', 'migrations'),
      path.join(workDir, 'supabase', 'migrations'),
      { recursive: true },
    );
    runCommand('supabase', ['start'], { cwd: workDir });
    localStarted = true;

    const statusEnv = runCommand('supabase', ['status', '-o', 'env'], { cwd: workDir });
    const dbLine = statusEnv.split(/\r?\n/).find(line => line.startsWith('DB_URL='));
    if (!dbLine) throw new Error('local_restore_db_url_missing');
    localDbUrl = dbLine.slice('DB_URL='.length).trim().replace(/^['"]|['"]$/g, '');

    runCommand('supabase', ['db', 'reset', '--debug', '--no-seed'], { cwd: workDir });

    const snapshotText = runDockerPsql(source, exactSnapshotSql);
    const snapshotAt = Date.parse(snapshotText);
    if (!Number.isFinite(snapshotAt)) throw new Error('source_snapshot_timestamp_invalid');

    const generatedCountSql = runDockerPsql(source, countSql);
    const sourceCounts = parseTableCounts(runDockerPsql(source, generatedCountSql));

    const backupStartedAt = Date.now();
    runCommand('supabase', [
      'db', 'dump',
      '--db-url', source,
      '--schema', 'public',
      '--data-only',
      '--use-copy',
      '-f', backupPath,
    ]);
    const backupCompletedAt = Date.now();

    const bytes = fs.statSync(backupPath).size;
    const sha256 = crypto.createHash('sha256').update(fs.readFileSync(backupPath)).digest('hex');
    const rpoSeconds = Math.max(0, (backupCompletedAt - snapshotAt) / 1000);
    if (rpoSeconds > maxRpoSeconds) throw new Error(`rpo_budget_exceeded:${rpoSeconds}`);

    const restoreStartedAt = Date.now();
    runDockerPsqlFile(localDbUrl, backupPath);
    const restoreCompletedAt = Date.now();
    const targetCounts = parseTableCounts(runDockerPsql(localDbUrl, generatedCountSql));
    const rtoSeconds = (restoreCompletedAt - restoreStartedAt) / 1000;

    if (stableJson(sourceCounts) !== stableJson(targetCounts)) {
      throw new Error('logical_restore_table_count_mismatch');
    }

    const report = {
      mode: 'logical',
      backup_ref: `logical-${exactHead}`,
      artifact_sha256: sha256,
      bytes,
      rpo_seconds: rpoSeconds,
      rto_seconds: rtoSeconds,
      table_count: Object.keys(sourceCounts).length,
      source_snapshot_at: snapshotText,
      restore_verified: true,
      restore_target: 'ephemeral-local-supabase-postgres',
      backup_started_at: new Date(backupStartedAt).toISOString(),
      backup_completed_at: new Date(backupCompletedAt).toISOString(),
      restore_started_at: new Date(restoreStartedAt).toISOString(),
      restore_completed_at: new Date(restoreCompletedAt).toISOString(),
      elapsed_seconds: (restoreCompletedAt - startedAt) / 1000,
    };
    fs.writeFileSync(path.join(reportDir, 'logical-backup-restore.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    return { name: 'backup-restore-verification', pass: true, status: 200, ...report };
  } finally {
    if (localStarted) {
      try { runCommand('supabase', ['stop'], { cwd: workDir }); } catch {}
    }
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

async function probe(name, url, options = {}, validation = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'x-resilience-token': process.env.RESILIENCE_OPERATIONAL_TOKEN.trim(),
        ...(options.headers || {}),
      },
    });
    const body = await response.text();
    let parsedBody = null;
    try { parsedBody = JSON.parse(body); } catch {}
    let pass = response.ok;
    const result = { name, pass, status: response.status };
    if (validation.expectDeploymentSha) {
      const expectedSha = exactHead;
      const deploymentSha = typeof parsedBody?.deployment_sha === 'string' ? parsedBody.deployment_sha.trim() : null;
      const deploymentId = typeof parsedBody?.deployment_id === 'string' ? parsedBody.deployment_id.trim() : null;
      result.expected_deployment_sha = expectedSha;
      result.deployment_sha = deploymentSha;
      result.deployment_id = deploymentId;
      if (pass && (!expectedSha || expectedSha === 'UNKNOWN')) {
        pass = false;
        result.failure = 'EXACT_HEAD_REQUIRED';
      } else if (pass && !deploymentSha) {
        pass = false;
        result.failure = 'DEPLOYMENT_SHA_MISSING';
      } else if (pass && deploymentSha !== expectedSha) {
        pass = false;
        result.failure = 'DEPLOYMENT_SHA_MISMATCH';
      } else if (pass && !deploymentId) {
        pass = false;
        result.failure = 'DEPLOYMENT_ID_MISSING';
      }
      result.pass = pass;
    }
    checks.push(result);
    console.log(`${pass ? 'PASS' : 'FAIL'} ${name}: HTTP ${response.status}${result.failure ? ` — ${result.failure}` : ''}`);
    if (!pass) console.error(body.slice(0, 800));
  } catch (error) {
    checks.push({ name, pass: false, error: String(error) });
    console.error(`FAIL ${name}: ${error}`);
  }
}

await probe('operational-health', process.env.RESILIENCE_HEALTH_URL, {}, { expectDeploymentSha: true });
await probe('tenant-canary', process.env.RESILIENCE_CANARY_URL, {
  headers: { Authorization: `Bearer ${process.env.RESILIENCE_CANARY_AUTH_TOKEN.trim()}` },
});
if (backupMode === 'logical') {
  try {
    const result = await logicalBackupRestore();
    checks.push(result);
    console.log(`PASS backup-restore-verification: logical dump/restore; SHA-256=${result.artifact_sha256}; RPO=${result.rpo_seconds.toFixed(2)}s; RTO=${result.rto_seconds.toFixed(2)}s`);
  } catch (error) {
    checks.push({ name: 'backup-restore-verification', pass: false, mode: 'logical', error: String(error) });
    console.error(`FAIL backup-restore-verification: ${error}`);
  }
} else {
  await probe('backup-restore-verification', process.env.RESILIENCE_BACKUP_VERIFY_URL, { method: 'POST' });
}
await probe('rollback-forward-fix-drill', process.env.RESILIENCE_ROLLBACK_DRILL_URL, { method: 'POST' });

const failed = checks.filter(check => !check.pass);
const status = failed.length ? 'NOT READY' : 'READY';
writeReport(
  status,
  failed.length ? 'One or more live resilience probes failed.' : 'All configured live resilience probes passed.',
  { backupMode, checks, passed: checks.length - failed.length, failed: failed.length },
);

console.log(`Phase F live result: ${checks.length - failed.length}/${checks.length} passed.`);
if (failed.length) {
  console.error('FAIL-CLOSED: Phase F live resilience is not certified.');
  process.exit(10);
}
console.log('PASS: Phase F live resilience probes completed.');
