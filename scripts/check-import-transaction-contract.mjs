import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationDir = path.join(root, 'supabase', 'migrations');
const files = fs.existsSync(migrationDir) ? fs.readdirSync(migrationDir).filter((f) => f.endsWith('.sql')) : [];
const text = files.map((f) => fs.readFileSync(path.join(migrationDir, f), 'utf8')).join('\n');

const required = [
  /import_jobs/i,
  /import_job_rows/i,
  /(?:finalize|finish[_ ]?job|terminal|completed)/i,
  /(?:rollback|failed|cancel(?:led|lled)?)/i,
  /FOR\s+UPDATE|advisory|lock/i,
  /import_commit_batch/i,
  /any row failure rolls back the whole chunk/i,
];
for (const pattern of required) {
  if (!pattern.test(text)) throw new Error(`Import transaction contract missing: ${pattern}`);
}

const lifecycleMigration = files
  .filter((f) => /import.*(?:job|engine|finish|lifecycle)|security.*import/i.test(f))
  .map((f) => fs.readFileSync(path.join(migrationDir, f), 'utf8'))
  .join('\n');
if (!/(?:status\s*=\s*p_status|p_status)/i.test(lifecycleMigration)) {
  throw new Error('Import transaction lifecycle does not persist terminal status');
}
if (!/failed/i.test(lifecycleMigration) || !/cancelled/i.test(lifecycleMigration)) {
  throw new Error('Import transaction lifecycle must support failed and cancelled states');
}
if (!/IMPORT_TERMINAL_STATUS_REQUIRED/i.test(lifecycleMigration)) {
  throw new Error('Import finalization must reject non-terminal statuses');
}
if (!/p_status\s+NOT\s+IN\s+\(\s*['\"]completed['\"]\s*,\s*['\"]partial['\"]\s*,\s*['\"]failed['\"]\s*,\s*['\"]cancelled['\"]\s*\)/i.test(lifecycleMigration)) {
  throw new Error('Import finalization must enumerate the allowed terminal states');
}
if (!/v_existing_summary/i.test(lifecycleMigration) || !/result_summary\s*=\s*coalesce\(v_existing_summary/i.test(lifecycleMigration)) {
  throw new Error('Import finalization must preserve existing result-summary lineage');
}
if (!/IMPORT_COMPLETED_WITH_ERROR/i.test(lifecycleMigration)) {
  throw new Error('Completed imports must not carry an error state');
}

const canonicalCommitPath = path.join(root, 'src', 'lib', 'import', 'canonical-commit.ts');
if (fs.existsSync(canonicalCommitPath)) {
  const canonical = fs.readFileSync(canonicalCommitPath, 'utf8');
  if (!/resolveCurrentCompanyId\(\)/.test(canonical) || !/import_commit_batch/.test(canonical)) {
    throw new Error('Canonical import must resolve authoritative tenant and commit through the atomic RPC wrapper');
  }
  if (!/p_source_hash\s*:\s*sourceHash/.test(canonical)) {
    throw new Error('Canonical import commit must bind the atomic RPC to the exact source hash');
  }
  if (!/CANONICAL_SOURCE_HASH_MISMATCH/.test(canonical)) {
    throw new Error('Canonical import must reject provenance rows whose source hash differs from the durable source hash');
  }
  if (!/IMPORT_COMMIT_RESULT_MISMATCH/.test(canonical)) {
    throw new Error('Canonical import must verify the durable batch result count and IDs');
  }
}

const adapterPath = path.join(root, 'src', 'lib', 'import', 'canonical-production-adapter.ts');
if (!fs.existsSync(adapterPath)) throw new Error('Canonical durable import adapter is missing');
const adapter = fs.readFileSync(adapterPath, 'utf8');
if (!/runServerBoundary\(/.test(adapter) || !/\/api\/canonical-import-run/.test(adapter)) {
  throw new Error('Canonical import adapter must cross the authenticated server boundary for durable lifecycle execution');
}
if (/runDurableProductionLifecycle/.test(adapter) || /SupabaseReportExecutionStore/.test(adapter) || /import_commit_batch/.test(adapter)) {
  throw new Error('Canonical browser adapter must not own the durable runner or atomic commit RPC');
}
if (/batchSize|for \(let i = 0; i < input\.rows\.length/.test(adapter)) {
  throw new Error('Canonical durable adapter must not reintroduce UI-level batch splitting');
}
const serverPath = path.join(root, 'api', 'canonical-import-run.ts');
if (!fs.existsSync(serverPath)) throw new Error('Canonical server lifecycle boundary is missing');
const server = fs.readFileSync(serverPath, 'utf8');
if (!/runDurableProductionLifecycle/.test(server) || !/SupabaseReportExecutionStore/.test(server)) {
  throw new Error('Canonical server boundary must use the existing durable production runner/store');
}
if (!/stage === 'committed'/.test(server) || !/commitImportBatchWithClient/.test(server)) {
  throw new Error('Canonical server boundary must execute the atomic commit only at the durable committed stage');
}
if (!/enqueueOrLoad/.test(server) || !/p_source_hash:\s*sourceHash/.test(server)) {
  throw new Error('Canonical server boundary must enqueue a source-bound durable job');
}
if (!/IMPORT_DURABLE_JOB_ALREADY_RUNNING|REPORT_EXECUTION_JOB_NOT_EXECUTABLE|REPORT_EXECUTION_JOB_DEAD_LETTER/.test(server)) {
  throw new Error('Canonical server boundary must fail closed on invalid durable-job state');
}

const pagePath = path.join(root, 'src', 'pages', 'CanonicalImportPage.tsx');
if (fs.existsSync(pagePath)) {
  const page = fs.readFileSync(pagePath, 'utf8');
  if (!/runCanonicalImportThroughDurableRunner/.test(page) || /import \{[^}]*commitImportBatch/.test(page)) {
    throw new Error('Canonical import UI must route through the durable adapter and not invoke the batch RPC wrapper directly');
  }
  if (!/const durableSourceHash = `sha256:\$\{fileHash\}`/.test(page)) {
    throw new Error('Canonical import UI must bind the computed file hash to the durable SHA-256 source identity');
  }
  if (!/quality < 50/.test(page) || !/quality < 75 && !qualityApproved/.test(page)) {
    throw new Error('Canonical import UI must enforce the 50% rejection and 50–74% explicit approval gates');
  }
}

const runnerPath = path.join(root, 'src', 'lib', 'report-execution', 'durable-production-runner.ts');
if (fs.existsSync(runnerPath)) {
  const runner = fs.readFileSync(runnerPath, 'utf8');
  const executeIndex = runner.indexOf('await input.executeStage(following');
  const checkpointIndex = runner.indexOf('await store.saveCheckpoint(input.jobId, checkpoint');
  if (executeIndex < 0 || checkpointIndex < 0 || executeIndex > checkpointIndex) {
    throw new Error('Durable runner must persist a checkpoint only after the stage executor succeeds');
  }
}

const batchFolderPath = path.join(root, 'src', 'lib', 'import', 'batch-folder.ts');
if (fs.existsSync(batchFolderPath)) {
  const batch = fs.readFileSync(batchFolderPath, 'utf8');
  if (!/offset\+=500/.test(batch)) throw new Error('Folder import must use bounded atomic chunks');
  if (!/status:'failed'|status\s*:\s*'failed'/.test(batch) || !/updateImportRecord\(importRecordId,\{status:'failed'/.test(batch)) {
    throw new Error('Failed folder imports must persist a terminal failed state');
  }
  if (!/committed\s*,\s*error:message/.test(batch) || !/committed\s*,\s*error\??:message/.test(batch)) {
    throw new Error('Failed folder imports must preserve committed progress and error detail');
  }
}

const forbiddenDirectBulk = /supabase\.from\([^)]*(products|import_job_rows|orders)[^)]*\)\.(insert|upsert|update)\s*\(/is;
const sourceDirs = ['src/lib', 'src/services'];
for (const dir of sourceDirs) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) continue;
  const stack = [abs];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
        const body = fs.readFileSync(full, 'utf8');
        if (forbiddenDirectBulk.test(body) && !/import-upsert|unified-import/i.test(full)) {
          throw new Error(`Direct bulk write outside governed import path: ${full}`);
        }
      }
    }
  }
}

console.log('Import transaction contract: PASS');
