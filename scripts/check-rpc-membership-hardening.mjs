import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationsDir = path.join(root, 'supabase', 'migrations');

if (!fs.existsSync(migrationsDir)) {
  throw new Error('MIGRATIONS_DIRECTORY_MISSING');
}

const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
const source = files.map((f) => fs.readFileSync(path.join(migrationsDir, f), 'utf8')).join('\n');

const requiredFunctions = [
  'complete_decision_work_item',
  'create_decision_work_item',
  'create_runtime_decision',
  'create_runtime_recommendation',
  'decide_approval',
  'link_recommendation_to_decision',
  'notify_decision_work_item',
  'record_decision_outcome',
  'record_recommendation_outcome',
  'request_decision_approval',
];

const missing = requiredFunctions.filter((name) => !new RegExp(`create\\s+(?:or\\s+replace\\s+)?function\\s+public\\.${name}\\b`, 'i').test(source));
if (missing.length) throw new Error(`REQUIRED_RPC_MISSING:${missing.join(',')}`);

// Guard against the common SECURITY DEFINER footgun: every protected runtime RPC
// must bind tenant context and fail closed when no tenant can be resolved.
const statements = source.split(/(?=create\\s+(?:or\\s+replace\\s+)?function)/i);
const violations = [];
for (const name of requiredFunctions) {
  const statement = statements.find((s) => new RegExp(`public\\.${name}\\b`, 'i').test(s));
  if (!statement) continue;
  if (!/security\\s+definer/i.test(statement)) violations.push(`${name}:not_security_definer`);
  if (!/current_company_id\s*\(\s*\)/i.test(statement)) violations.push(`${name}:missing_tenant_resolver`);
  if (!/tenant_context_required|company_id\s*=\s*v_company_id|company_id\s*=\s*public\.current_company_id\s*\(\s*\)/i.test(statement)) {
    violations.push(`${name}:missing_fail_closed_tenant_binding`);
  }
}

if (violations.length) throw new Error(`RPC_MEMBERSHIP_HARDENING_FAILED:${violations.join('|')}`);

console.log(`RPC membership hardening PASS: ${requiredFunctions.length} protected runtime RPC contracts inspected across ${files.length} migrations`);
