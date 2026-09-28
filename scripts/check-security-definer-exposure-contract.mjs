import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('supabase/migrations');
const files = fs.readdirSync(root).filter(name => name.endsWith('.sql')).sort().map(name => path.join(root, name));
const sql = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');

const intendedAuthenticatedSecurityDefiners = [
  'accept_customer_invitation',
  'autonomy_runtime_gate',
  'can_enter_phase_l_autonomy',
  'can_run_phase_l_autonomy',
  'clear_cart',
  'complete_decision_work_item',
  'compute_control_plane_health',
  'convert_operational_task_proposal',
  'create_cash_account',
  'create_customer_invitation',
  'create_decision_action_receipt',
  'create_decision_work_item',
  'create_invoice_from_order',
  'create_order',
  'create_runtime_decision',
  'create_runtime_recommendation',
  'current_company_id',
  'current_customer_company_id',
  'current_customer_id',
  'decide_approval',
  'finalize_runtime_decision',
  'get_cart',
  'import_commit_batch',
  'link_recommendation_to_decision',
  'mark_alert_read',
  'notify_decision_work_item',
  'phase_l_production_autonomy_health',
  'record_decision_outcome',
  'record_payment',
  'record_recommendation_outcome',
  'record_sales_payment',
  'remove_cart_item',
  'request_decision_approval',
  'revoke_customer_invitation',
  'set_cart_item',
  'start_decision_work_item',
  'transition_order',
  'update_recommendation_status',
];

// Live-only functions are not asserted as repository definitions here. Their
// existence in Staging is a migration-parity concern, not a reason to make a
// static repository contract invent a source definition.
const liveOnlyExpectedSecurityDefiners = ['capture_kpi_evidence_snapshot'];

const canonicalInvokerFunctions = [
  {
    name: 'import_create_job',
    requiredTokens: [/current_company_id\s*\(\)/i, /auth\.uid\s*\(\)/i, /INSERT\s+INTO\s+public\.file_records/i, /INSERT\s+INTO\s+public\.import_jobs/i],
  },
  {
    name: 'import_update_job_progress',
    requiredTokens: [/current_company_id\s*\(\)/i, /IMPORT_PROGRESS_COUNTER_OUT_OF_RANGE/i, /IMPORT_PROGRESS_COUNTER_INCONSISTENT/i, /UPDATE\s+public\.import_jobs/i],
  },
  {
    name: 'import_finish_job',
    requiredTokens: [/current_company_id\s*\(\)/i, /IMPORT_COMPLETION_SUMMARY_MISMATCH/i, /IMPORT_COMPLETION_REQUIRES_ALL_ROWS_PROCESSED/i, /UPDATE\s+public\.import_jobs/i],
  },
  {
    name: 'get_receivables_report_page',
    requiredTokens: [/current_company_id\s*\(\)/i, /FROM\s+public\.sales_invoices/i, /public\.customers/i, /total_outstanding/i],
  },
  {
    name: 'get_cash_account_balances',
    requiredTokens: [/current_company_id\s*\(\)/i, /auth\.uid\s*\(\)/i, /company_memberships/i, /cash_accounts/i],
  },
  {
    name: 'get_staff_receivables',
    requiredTokens: [/current_company_id\s*\(\)/i, /auth\.uid\s*\(\)/i, /company_memberships/i, /sales/i],
  },
];

const criticalOperationalSecurityDefiners = [
  { name: 'current_company_id', requiredTokens: [/auth\.uid\s*\(\)/i, /company_memberships/i, /is_active\s*=\s*true/i, /is_default\s*=\s*true/i], searchPath: 'EMPTY_OR_SAFE' },
  { name: 'fail_report_execution_job', requiredTokens: [/auth\.uid\s*\(\)/i, /current_company_id\s*\(\)/i, /lease_token/i, /company_id\s*=\s*p_company_id/i, /UPDATE\s+public\.report_execution_jobs/i], searchPath: 'PUBLIC' },
  { name: 'retry_report_execution_job', requiredTokens: [/auth\.uid\s*\(\)/i, /current_company_id\s*\(\)/i, /report_execution_jobs/i, /company_id\s*=\s*p_company_id/i, /status\s*=\s*\x27failed\x27/i], searchPath: 'EMPTY_OR_SAFE' },
];

const failures = [];

function getFunctionWindow(name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const definitionPattern = new RegExp('CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+(?:public\\.)?' + escapedName + '\\s*\\(', 'gi');
  let lastWindow = null;
  let match;
  while ((match = definitionPattern.exec(sql)) !== null) {
    const candidate = sql.slice(match.index);
    const bodyTag = candidate.match(/\bAS\s+(\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$)/i)?.[1];
    if (!bodyTag) continue;
    const bodyEnd = candidate.indexOf(bodyTag + ';');
    if (bodyEnd < 0) continue;
    lastWindow = candidate.slice(0, bodyEnd + bodyTag.length + 1);
  }
  return lastWindow;
}

function normalizeSearchPath(window) {
  const raw = window.match(/SET\s+search_path\s+(?:TO|=)\s*([^\n;]+)/i)?.[1];
  if (raw === undefined) return null;
  return raw.trim().toLowerCase().replaceAll('"', '').replaceAll("'", '').replace(/\s+/g, '');
}

function hasSafeSearchPath(window, mode) {
  const normalized = normalizeSearchPath(window);
  if (normalized === null) return false;
  if (mode === 'EMPTY_OR_SAFE') return normalized === '' || normalized === 'pg_catalog' || normalized === 'public' || normalized === 'public,pg_catalog' || normalized === 'pg_catalog,public';
  return normalized === 'public' || normalized === 'public,pg_catalog' || normalized === 'pg_catalog,public';
}
function assertAuthenticatedOnly(name) {
  const grantPattern = new RegExp(`GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+(?:public\\.)?${name}\\s*\\([^;]*?\\)\\s+TO\\s+([^;]+);`, 'ig');
  let authenticated = false;
  let anon = false;
  let match;
  while ((match = grantPattern.exec(sql)) !== null) {
    const roles = match[1].split(',').map(role => role.trim().toLowerCase()).filter(Boolean);
    authenticated ||= roles.includes('authenticated');
    anon ||= roles.includes('anon');
  }
  if (!authenticated) failures.push(`${name}: authenticated EXECUTE grant not found`);
  if (anon) failures.push(`${name}: SECURITY DEFINER function must not be executable by anon`);
}

for (const name of intendedAuthenticatedSecurityDefiners) {
  const window = getFunctionWindow(name);
  if (!window) { failures.push(`${name}: latest repository definition not found`); continue; }
  if (!/SECURITY\s+DEFINER/i.test(window)) failures.push(`${name}: SECURITY DEFINER missing in latest repository definition`);
  if (!hasSafeSearchPath(window, 'EMPTY_OR_SAFE')) failures.push(`${name}: explicit safe search_path missing in latest repository definition`);
  if (name !== 'current_company_id' && !/(auth\.uid\s*\(\)|current_company_id\s*\(\))/i.test(window)) failures.push(`${name}: caller/tenant binding missing in latest repository definition`);
  if (name === 'current_company_id' && !/auth\.uid\s*\(\)/i.test(window)) failures.push('current_company_id: auth.uid() binding missing in latest repository definition');
  assertAuthenticatedOnly(name);
}

for (const check of canonicalInvokerFunctions) {
  const window = getFunctionWindow(check.name);
  if (!window) { failures.push(`${check.name}: canonical invoker definition not found`); continue; }
  if (/SECURITY\s+DEFINER/i.test(window)) failures.push(`${check.name}: canonical terminalizer must remain SECURITY INVOKER`);
  if (!hasSafeSearchPath(window, 'EMPTY_OR_SAFE')) failures.push(`${check.name}: explicit safe search_path missing in canonical invoker`);
  for (const token of check.requiredTokens) if (!token.test(window)) failures.push(`${check.name}: required canonical invoker invariant missing: ${token}`);
  assertAuthenticatedOnly(check.name);
}

for (const check of criticalOperationalSecurityDefiners) {
  const window = getFunctionWindow(check.name);
  if (!window) { failures.push(`${check.name}: critical operational definition not found`); continue; }
  if (!/SECURITY\s+DEFINER/i.test(window)) failures.push(`${check.name}: SECURITY DEFINER missing`);
  if (!hasSafeSearchPath(window, check.searchPath)) failures.push(`${check.name}: safe explicit search_path missing`);
  for (const token of check.requiredTokens) if (!token.test(window)) failures.push(`${check.name}: required security/runtime invariant missing: ${token}`);
  assertAuthenticatedOnly(check.name);
}

if (failures.length) {
  console.error('Security-definer exposure contract: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Security-definer exposure contract: PASS (${intendedAuthenticatedSecurityDefiners.length} classified authenticated SECURITY DEFINER function names + ${criticalOperationalSecurityDefiners.length} critical operational repository functions)`);
console.log(`LIVE_ONLY_SECURITY_DEFINER_NOT_ASSERTED=${liveOnlyExpectedSecurityDefiners.join(',')}`);
console.log('Migration parity for any live-only function remains a separate fail-closed gate.');
