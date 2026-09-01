import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('supabase/migrations');
const files = fs.readdirSync(root)
  .filter((name) => name.endsWith('.sql'))
  .sort()
  .map((name) => path.join(root, name));

function stripSqlComments(input) {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, '\n')
    .replace(/(^|\n)\s*--[^\n]*/g, '$1');
}

const sql = stripSqlComments(files.map((file) => fs.readFileSync(file, 'utf8')).join('\n'));

const intendedAuthenticatedSecurityDefiners = [
  'complete_decision_work_item',
  'create_decision_work_item',
  'create_runtime_decision',
  'create_runtime_recommendation',
  'current_company_id',
  'decide_approval',
  'link_recommendation_to_decision',
  'mark_alert_read',
  'notify_decision_work_item',
  'record_decision_outcome',
  'record_recommendation_outcome',
  'request_decision_approval',
];

const failures = [];
for (const name of intendedAuthenticatedSecurityDefiners) {
  const definition = new RegExp(
    `CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+public\\.${name}\\b`,
    'i',
  ).exec(sql);
  if (!definition) {
    failures.push(`${name}: repository definition not found`);
    continue;
  }

  const nextFunction = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\./gi;
  nextFunction.lastIndex = definition.index + definition[0].length;
  const next = nextFunction.exec(sql);
  const windowEnd = next ? next.index : sql.length;
  const window = sql.slice(definition.index, windowEnd);

  if (!/SECURITY\s+DEFINER/i.test(window)) {
    failures.push(`${name}: SECURITY DEFINER not found in function definition window`);
  }
  if (!/SET\s+search_path\s*(?:=|TO)\s*'?public'?\b/i.test(window)) {
    failures.push(`${name}: explicit search_path=public not found in function definition window`);
  }
  if (name !== 'current_company_id' && !/(auth\.uid\s*\(\)|current_company_id\s*\(\))/i.test(window)) {
    failures.push(`${name}: explicit caller/tenant context reference not found in function definition window`);
  }
  if (name === 'current_company_id' && !/auth\.uid\s*\(\)/i.test(window)) {
    failures.push('current_company_id: auth.uid() binding not found in function definition window');
  }

  const authenticatedGrant = new RegExp(
    `GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+public\\.${name}\\s*\\([^;]*?\\)\\s+TO\\s+authenticated\\s*;`,
    'i',
  );
  if (!authenticatedGrant.test(sql)) {
    failures.push(`${name}: authenticated EXECUTE grant not found`);
  }

  const anonGrant = new RegExp(
    `GRANT\\s+EXECUTE\\s+ON\\s+FUNCTION\\s+public\\.${name}\\s*\\([^;]*?\\)\\s+TO\\s+anon\\s*;`,
    'i',
  );
  if (anonGrant.test(sql)) {
    failures.push(`${name}: SECURITY DEFINER function must not be executable by anon`);
  }
}

if (failures.length) {
  console.error('Security-definer exposure contract: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Security-definer exposure contract: PASS (${intendedAuthenticatedSecurityDefiners.length} intentional authenticated SECURITY DEFINER functions checked)`,
);