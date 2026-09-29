import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const corpusRoot = path.resolve(process.env.REAL_REPORT_CORPUS_ROOT || 'tests/fixtures/realistic-reports');
const baseURL = (process.env.REAL_REPORT_CORPUS_BASE_URL || 'https://deploy-preview-672--aghbari-report-advisor.netlify.app').replace(/\/$/, '');
const reportDir = path.resolve(process.env.E2E_REPORT_DIR || 'artifacts/real-report-corpus');
const supported = new Set(['.xlsx','.xls','.xlsm','.csv','.tsv','.ods','.pdf','.docx','.json','.jsonl','.txt','.md','.xml','.png','.jpg','.jpeg','.tiff','.webp','.bmp']);

if (exactHead === 'UNKNOWN') throw new Error('REAL_REPORT_CORPUS_EXACT_HEAD_MISSING');
await fs.mkdir(reportDir, { recursive: true });

async function discoverFiles(root) {
  const result = [];
  async function visit(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) { await visit(absolute); continue; }
      const ext = path.extname(entry.name).toLowerCase();
      if (entry.name.toLowerCase() !== 'readme.md' && supported.has(ext)) result.push(absolute);
    }
  }
  await visit(root);
  return result;
}

function relativePath(file) { return path.relative(process.cwd(), file).split(path.sep).join('/'); }
async function fingerprint(file) {
  const bytes = await fs.readFile(file);
  return { bytes: bytes.byteLength, hash: 'sha256:' + crypto.createHash('sha256').update(bytes).digest('hex') };
}

async function oidcToken() {
  const requestURL = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!requestURL || !requestToken) throw new Error('REAL_REPORT_CORPUS_OIDC_UNAVAILABLE');
  const separator = requestURL.includes('?') ? '&' : '?';
  const response = await fetch(requestURL + separator + 'audience=report-advisor-corpus', { headers: { Authorization: 'bearer ' + requestToken } });
  if (!response.ok) throw new Error('REAL_REPORT_CORPUS_OIDC_REQUEST_FAILED:' + response.status);
  const body = await response.json();
  if (!body?.value) throw new Error('REAL_REPORT_CORPUS_OIDC_TOKEN_MISSING');
  return String(body.value);
}

async function executeOne(file, ordinal, total, token) {
  const rel = relativePath(file);
  const fingerprinted = await fingerprint(file);
  const response = await fetch(baseURL + '/api/real-report-corpus-execute', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'X-GitHub-Token': process.env.GITHUB_TOKEN || '', 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: rel, expectedSha: exactHead, sourceHash: fingerprinted.hash }),
  });

  const bodyText = await response.text();
  let payload = null;
  try { payload = bodyText ? JSON.parse(bodyText) : null; } catch {}
  const record = { ordinal, total, path: rel, filename: path.basename(file), fingerprint: fingerprinted.hash, bytes: fingerprinted.bytes, exact_sha: exactHead, httpStatus: response.status, status: payload?.status || (response.ok ? 'UNKNOWN' : 'BLOCKED'), result: payload ?? { raw: bodyText.slice(0, 1200) }, completed_at: new Date().toISOString() };

  if (!response.ok) {
    const error = String(payload?.error ?? ('HTTP_' + response.status));
    record.status = error.includes('REVIEW_APPROVAL_REQUIRED') || error.includes('QUALITY_REJECTED') ? 'REVIEW' : 'BLOCKED';
    record.blocker = error;
  } else if (payload?.status === 'CLOSED') {
    const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
    if (tasks.length !== 9 || tasks.some(task => task.status !== 'completed')) { record.status = 'BLOCKED'; record.blocker = 'EXECUTION_TASK_LEDGER_NOT_CLOSED'; }
    else if (!payload.executionJobId || payload.durableJob?.status !== 'completed') { record.status = 'BLOCKED'; record.blocker = 'DURABLE_EXECUTION_NOT_COMPLETED'; }
    else if (!payload.renderedOutput || payload.renderedOutput.sourceBound !== true || payload.renderedOutput.sourceHash !== fingerprinted.hash || payload.renderedOutput.importId !== payload.importId) { record.status = 'BLOCKED'; record.blocker = 'RENDERED_MANIFEST_NOT_SOURCE_BOUND'; }
    else {
      record.proof = { exact_sha: exactHead, source_file: rel, source_fingerprint: fingerprinted.hash, import_job_id: payload.importId, snapshot_id: payload.snapshotId, durable_job_id: payload.executionJobId, durable_stage: payload.durableJob.checkpoint?.stage ?? null, authoritative_row_count: payload.authoritativeRowCount, authoritative_quality_score: payload.authoritativeQualityScore, specialty: payload.sourceSpecialty, entity_type: payload.authoritativeEntityType, evidence_status: payload.evidenceStatus, rendered_output_keys: payload.renderedOutput.outputs?.map(output => output.key) ?? [], task_count: tasks.length };
    }
  }

  await fs.writeFile(path.join(reportDir, String(ordinal).padStart(3, '0') + '-checkpoint.json'), JSON.stringify(record, null, 2) + '\n');
  return record;
}

const files = (await discoverFiles(corpusRoot)).sort((a, b) => relativePath(a).localeCompare(relativePath(b), 'en', { numeric: false, sensitivity: 'base' }));
if (!files.length) throw new Error('REAL_REPORT_CORPUS_EMPTY');
const ledger = { exact_sha: exactHead, corpus_root: relativePath(corpusRoot), corpus_count: files.length, discovered: files.length, registered: 0, processed: 0, closed: 0, review: 0, blocked: 0, remaining: files.length, status: 'RUNNING', started_at: new Date().toISOString(), base_url: baseURL, reports: [] };
const saveLedger = async () => { ledger.remaining = files.length - ledger.closed - ledger.review - ledger.blocked; await fs.writeFile(path.join(reportDir, 'ledger.json'), JSON.stringify(ledger, null, 2) + '\n'); };
console.log('REAL_REPORT_CORPUS_COUNT=' + files.length);
const token = await oidcToken();
for (let index = 0; index < files.length; index += 1) {
  ledger.registered += 1;
  const record = await executeOne(files[index], index + 1, files.length, token);
  ledger.reports.push(record);
  if (record.status === 'CLOSED') { ledger.closed += 1; ledger.processed += 1; } else if (record.status === 'REVIEW') ledger.review += 1; else ledger.blocked += 1;
  await saveLedger();
  console.log('REPORT_RESULT', JSON.stringify({ ordinal: record.ordinal, total: files.length, path: record.path, status: record.status, importId: record.result?.importId ?? null, executionJobId: record.result?.executionJobId ?? null, blocker: record.blocker ?? null }));
  if (record.status !== 'CLOSED') { ledger.status = record.status; ledger.finished_at = new Date().toISOString(); await saveLedger(); throw new Error('REPORT_STOPPED_AT_' + record.ordinal + ':' + record.status + ':' + (record.blocker || 'unknown')); }
}
ledger.status = 'PASS';
ledger.finished_at = new Date().toISOString();
await saveLedger();
console.log('REAL_REPORT_CORPUS_PASS', JSON.stringify({ exact_sha: exactHead, count: files.length, discovered: ledger.discovered, registered: ledger.registered, processed: ledger.processed, closed: ledger.closed, review: ledger.review, blocked: ledger.blocked, remaining: ledger.remaining }, null, 2));