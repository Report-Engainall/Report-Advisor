import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('supabase/migrations');
const files = fs.readdirSync(root).filter(name => name.endsWith('.sql')).sort().map(name => path.join(root, name));
const sql = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const workerMigration = fs.readFileSync(path.join(root, '20260908210000_reconcile_report_execution_worker_contract_current_main.sql'), 'utf8');

const intendedAuthenticatedSecurityDefiners = [
  'complete_decision_work_item', 'create_decision_work_item', 'create_runtime_decision',
  'create_runtime_recommendation', 'current_company_id', 'decide_approval',
  'link_recommendation_to_decision', 'mark_alert_read', 'notify_decision_work_item',
  'record_decision_outcome', 'record_recommendation_outcome', 'request_decision_approval',
];

const liveOnlyExpectedSecurityDefiners = ['capture_kpi_evidence_snapshot'];

const serviceOnlyReportWorkerSecurityDefiners = [
  { name: 'enqueue_report_execution_job', args: 'uuid,text,text,text,text[],integer' },
  { name: 'claim_report_execution_job', args: 'uuid,uuid,text,integer' },
  { name: 'heartbeat_report_execution_job', args: 'uuid,uuid,text,uuid,integer' },
  { name: 'advance_report_execution_checkpoint', args: 'uuid,uuid,text,uuid,jsonb' },
  { name: 'complete_report_execution_job', args: 'uuid,uuid,text,uuid,jsonb' },
  { name: 'fail_report_execution_job', args: 'uuid,uuid,text,uuid,jsonb' },
  { name: 'recover_expired_report_execution_jobs', args: 'uuid,integer' },
  { name: 'retry_report_execution_job', args: 'uuid,uuid' },
];

const criticalOperationalSecurityDefiners = [
  { name: 'current_company_id', requiredTokens: [/auth\.uid\s*\(\)/i, /company_memberships/i, /is_active\s*=\s*true/i, /is_default\s*=\s*true/i], searchPath: 'EMPTY_OR_SAFE' },
];

const failures = [];

function getFunctionWindow(name) {
  const definitionPattern = new RegExp('CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+(?:public\\.)?' + name + '\\s*\\(', 'gi');
  let lastIndex = -1;
  let match;
  while ((match = definitionPattern.exec(sql)) !== null) lastIndex = match.index;
  if (lastIndex < 0) return null;
  const nextFunction = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?/gi;
  nextFunction.lastIndex = lastIndex + 1;
  const next = nextFunction.exec(sql);
  let window = sql.slice(lastIndex, next ? next.index : sql.length);
  const alterPattern = new RegExp('ALTER\\s+FUNCTION\\s+(?:public\\.)?' + name + '\\s*\\(', 'gi');
  let lastAlterIndex = -1;
  let alterMatch;
  while ((alterMatch = alterPattern.exec(sql)) !== null) {
    if (alterMatch.index > lastIndex) lastAlterIndex = alterMatch.index;
  }
  if (lastAlterIndex > lastIndex) {
    const semicolon = sql.indexOf(';', lastAlterIndex);
    window += '\\n' + sql.slice(lastAlterIndex, semicolon >= 0 ? semicolon + 1 : sql.length);
  }
  return window;
}

function normalizeSearchPath(window) {
  const matches = [...window.matchAll(/SET\s+search_path\s+(?:TO|=)\s*([\s\S]*?)(?=\r?\n\s*AS\b|;)/gi)];
  const raw = matches.at(-1)?.[1];
  if (!raw) return null;
  return raw.trim().toLowerCase().replaceAll('"', '').replaceAll("'", '').replace(/\s+/g, '');
}

function hasSafeSearchPath(window, mode) {
  const normalized = normalizeSearchPath(window);
  if (!normalized) return false;
  if (mode === 'EMPTY_OR_SAFE') return normalized === '' || normalized === 'public' || normalized === 'public,pg_catalog';
  return normalized === 'public' || normalized === 'public,pg_catalog' || normalized === 'pg_catalog';
}

function assertAuthenticatedOnly(name) {
  const authenticatedGrant = new RegExp('GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+(?:public\\.)?' + name + '\\s*\\([^;]*?\\)\\s+TO\\s+authenticated\\s*;', 'i');
  if (!authenticatedGrant.test(sql)) failures.push(name + ': authenticated EXECUTE grant not found');
  const anonGrant = new RegExp('GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+(?:public\\.)?' + name + '\\s*\\([^;]*?\\)\\s+TO\\s+anon\\s*;', 'i');
  if (anonGrant.test(sql)) failures.push(name + ': SECURITY DEFINER function must not be executable by anon');
}

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function assertServiceOnly(name, args) {
  const signature = 'public.' + name + '(' + args + ')';
  const escaped = escapeRegex(signature);
  if (!new RegExp('REVOKE\\s+ALL\\s+ON\\s+FUNCTION\\s+' + escaped + '\\s+FROM\\s+PUBLIC,\\s*anon,\\s*authenticated\\s*;', 'i').test(workerMigration)) failures.push(name + ': API-role EXECUTE revoke missing from authoritative worker migration');
  if (!new RegExp('GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+' + escaped + '\\s+TO\\s+service_role\\s*;', 'i').test(workerMigration)) failures.push(name + ': service_role EXECUTE grant missing from authoritative worker migration');
  if (new RegExp('GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+' + escaped + '\\s+TO\\s+authenticated\\s*;', 'i').test(workerMigration)) failures.push(name + ': authenticated EXECUTE re-opened in authoritative worker migration');
  if (new RegExp('GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+' + escaped + '\\s+TO\\s+anon\\s*;', 'i').test(workerMigration)) failures.push(name + ': anon EXECUTE re-opened in authoritative worker migration');
}

for (const name of intendedAuthenticatedSecurityDefiners) {
  const window = getFunctionWindow(name);
  if (!window) { failures.push(name + ': latest repository definition not found'); continue; }
  if (!/SECURITY\s+DEFINER/i.test(window)) failures.push(name + ': SECURITY DEFINER missing in latest repository definition');
  if (!hasSafeSearchPath(window, 'EMPTY_OR_SAFE')) failures.push(name + ': explicit safe search_path missing in latest repository definition');
  if (name !== 'current_company_id' && !/(auth\.uid\s*\(\)|current_company_id\s*\(\))/i.test(window)) failures.push(name + ': caller/tenant binding missing in latest repository definition');
  if (name === 'current_company_id' && !/auth\.uid\s*\(\)/i.test(window)) failures.push('current_company_id: auth.uid() binding missing in latest repository definition');
  assertAuthenticatedOnly(name);
}

for (const worker of serviceOnlyReportWorkerSecurityDefiners) {
  const window = getFunctionWindow(worker.name);
  if (!window) { failures.push(worker.name + ': latest repository definition not found'); continue; }
  if (!/SECURITY\s+DEFINER/i.test(window)) failures.push(worker.name + ': SECURITY DEFINER missing in latest repository definition');
  if (!hasSafeSearchPath(window, 'PUBLIC')) failures.push(worker.name + ': explicit safe search_path missing in latest repository definition');
  assertServiceOnly(worker.name, worker.args);
}

for (const check of criticalOperationalSecurityDefiners) {
  const window = getFunctionWindow(check.name);
  if (!window) { failures.push(check.name + ': critical operational definition not found'); continue; }
  if (!/SECURITY\s+DEFINER/i.test(window)) failures.push(check.name + ': SECURITY DEFINER missing');
  if (!hasSafeSearchPath(window, check.searchPath)) failures.push(check.name + ': safe explicit search_path missing');
  for (const token of check.requiredTokens) if (!token.test(window)) failures.push(check.name + ': required security/runtime invariant missing: ' + token);
}

if (failures.length) {
  console.error('Security-definer exposure contract: FAIL');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('Security-definer exposure contract: PASS (' + intendedAuthenticatedSecurityDefiners.length + ' intentional authenticated repository functions + ' + serviceOnlyReportWorkerSecurityDefiners.length + ' service-only report worker functions)');
console.log('LIVE_ONLY_SECURITY_DEFINER_NOT_ASSERTED=' + liveOnlyExpectedSecurityDefiners.join(','));
console.log('Migration parity for any live-only function remains a separate fail-closed gate.');