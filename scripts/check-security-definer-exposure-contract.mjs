import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('supabase/migrations');
const files = fs.readdirSync(root).filter((name) => name.endsWith('.sql')).sort().map((name) => path.join(root, name));
const sql = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

const intendedAuthenticatedSecurityDefiners = [
  'complete_decision_work_item', 'create_decision_work_item', 'create_runtime_decision',
  'create_runtime_recommendation', 'current_company_id', 'decide_approval',
  'link_recommendation_to_decision', 'mark_alert_read', 'notify_decision_work_item',
  'record_decision_outcome', 'record_recommendation_outcome', 'request_decision_approval',
];

const criticalOperationalSecurityDefiners = [
  {
    name: 'current_company_id',
    requiredTokens: [/auth\.uid\s*\(\)/i, /company_memberships/i, /is_active\s*=\s*true/i, /is_default\s*=\s*true/i],
    requiredSearchPath: /SET\s+search_path\s*(?:=|TO)\s*(?:''|\x27?public\x27?)/i,
  },
  {
    name: 'fail_report_execution_job',
    requiredTokens: [/auth\.uid\s*\(\)/i, /current_company_id\s*\(\)/i, /lease_token/i, /company_id\s*=\s*p_company_id/i, /UPDATE\s+public\.report_execution_jobs/i],
    requiredSearchPath: /SET\s+search_path\s*(?:=|TO)\s*\x27?public\x27?/i,
  },
  {
    name: 'capture_kpi_evidence_snapshot',
    requiredTokens: [/auth\.uid\s*\(\)/i, /current_company_id\s*\(\)/i, /kpi_evidence_snapshots/i, /source_evidence/i, /as_of/i],
    requiredSearchPath: /SET\s+search_path\s*(?:=|TO)\s*\x27?public\x27?/i,
  },
  {
    name: 'retry_report_execution_job',
    requiredTokens: [/auth\.uid\s*\(\)/i, /current_company_id\s*\(\)/i, /report_execution_jobs/i, /company_id\s*=\s*p_company_id/i, /status\s*=\s*\x27failed\x27/i],
    requiredSearchPath: /SET\s+search_path\s*(?:=|TO)\s*(?:''|\x27?public\x27?)/i,
  },
];

const failures = [];

function getFunctionWindow(name) {
  const definition = new RegExp(`CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+public\\.${name}\\b`, 'i').exec(sql);
  if (!definition) return null;
  const nextFunction = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\./gi;
  nextFunction.lastIndex = definition.index + definition[0].length;
  const next = nextFunction.exec(sql);
  return sql.slice(definition.index, next ? next.index : sql.length);
}

function assertAuthenticatedOnly(name) {
  const authenticatedGrant = new RegExp(`GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+public\\.${name}\\s*\\([^;]*?\\)\\s+TO\\s+authenticated\\s*;`, 'i');
  if (!authenticatedGrant.test(sql)) failures.push(`${name}: authenticated EXECUTE grant not found`);
  const anonGrant = new RegExp(`GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+public\\.${name}\\s*\\([^;]*?\\)\\s+TO\\s+anon\\s*;`, 'i');
  if (anonGrant.test(sql)) failures.push(`${name}: SECURITY DEFINER function must not be executable by anon`);
}

for (const name of intendedAuthenticatedSecurityDefiners) {
  const window = getFunctionWindow(name);
  if (!window) { failures.push(`${name}: repository definition not found`); continue; }
  if (!/SECURITY\s+DEFINER/i.test(window)) failures.push(`${name}: SECURITY DEFINER not found in function definition window`);
  if (!/SET\s+search_path\s*(?:=|TO)\s*'?public'?\b/i.test(window)) failures.push(`${name}: explicit search_path=public not found in function definition window`);
  if (name !== 'current_company_id' && !/(auth\.uid\s*\(\)|current_company_id\s*\(\))/i.test(window)) failures.push(`${name}: explicit caller/tenant context reference not found in function definition window`);
  if (name === 'current_company_id' && !/auth\.uid\s*\(\)/i.test(window)) failures.push('current_company_id: auth.uid() binding not found in function definition window');
  assertAuthenticatedOnly(name);
}

for (const check of criticalOperationalSecurityDefiners) {
  const window = getFunctionWindow(check.name);
  if (!window) { failures.push(`${check.name}: critical operational SECURITY DEFINER definition not found`); continue; }
  if (!/SECURITY\s+DEFINER/i.test(window)) failures.push(`${check.name}: SECURITY DEFINER missing`);
  if (!check.requiredSearchPath.test(window)) failures.push(`${check.name}: safe explicit search_path missing`);
  for (const token of check.requiredTokens) if (!token.test(window)) failures.push(`${check.name}: required security/runtime invariant missing: ${token}`);
  assertAuthenticatedOnly(check.name);
}

if (failures.length) {
  console.error('Security-definer exposure contract: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Security-definer exposure contract: PASS (${intendedAuthenticatedSecurityDefiners.length} intentional authenticated functions + ${criticalOperationalSecurityDefiners.length} critical operational functions checked)`);
