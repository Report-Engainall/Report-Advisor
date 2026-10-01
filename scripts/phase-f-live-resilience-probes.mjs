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
  const runnerSource = await preferIpv4Host(source);
  const maxRpoSeconds = Number(process.env.RESILIENCE_MAX_RPO_SECONDS);
  if (!Number.isFinite(maxRpoSeconds) || maxRpoSeconds < 0) {
    throw new Error('invalid_max_rpo_seconds');
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phase-f-logical-'));
  const backupPath = path.join(workDir, 'public-data.sql');
  const exactSnapshotSql = 'select clock_timestamp()::text';
  const countSql = `select coalesce(string_agg(format('select %L as table_name, count(*) as row_count from %I.%I', table_schema || '.' || table_name, table_schema, table_name), ' union all ' order by table_name), 'select null::text as table_name, 0::bigint as row_count where false') from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE'`;

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

    const snapshotText = runDockerPsql(runnerSource, exactSnapshotSql);
    const snapshotAt = Date.parse(snapshotText);
    if (!Number.isFinite(snapshotAt)) throw new Error('source_snapshot_timestamp_invalid');

    const generatedCountSql = runDockerPsql(runnerSource, countSql);
    const sourceCounts = parseTableCounts(runDockerPsql(runnerSource, generatedCountSql));

    const backupStartedAt = Date.now();
    runCommand('supabase', [
      'db', 'dump',
      '--db-url', runnerSource,
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

    const mismatchTables = [...new Set([...Object.keys(sourceCounts), ...Object.keys(targetCounts)])]
      .sort()
      .map((tableName) => ({
        tableName,
        sourceCount: sourceCounts[tableName] ?? 0,
        targetCount: targetCounts[tableName] ?? 0,
      }))
      .filter((item) => item.sourceCount !== item.targetCount);

    if (mismatchTables.length > 0) {
      fs.writeFileSync(
        path.join(reportDir, 'logical-restore-count-mismatch.json'),
        JSON.stringify({ exactHead, sourceCounts, targetCounts, mismatchTables }, null, 2) + '\\n',
        'utf8',
      );
      throw new Error(
        `logical_restore_table_count_mismatch:${JSON.stringify(mismatchTables)}`,
      );
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
