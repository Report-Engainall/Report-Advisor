import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'supabase', 'migrations');
if (!fs.existsSync(dir)) throw new Error(`Missing migrations directory: ${dir}`);

const files = fs.readdirSync(dir)
  .filter((name) => name.endsWith('.sql'))
  .sort((a, b) => a.localeCompare(b));

if (files.length === 0) throw new Error('No SQL migrations found');

const migrationVersions = new Map();
for (const file of files) {
  const version = /^([0-9]{14})_/.exec(file)?.[1];
  if (!version) continue;
  const previous = migrationVersions.get(version);
  if (previous) throw new Error(`duplicate migration version ${version}: ${previous} and ${file}`);
  migrationVersions.set(version, file);
}

const seenObjects = new Map();
const duplicateObjects = [];
const findings = [];

function record(kind, name, file, safeReplacement) {
  const key = `${kind}:${name}`;
  const previous = seenObjects.get(key);
  if (previous && previous.file !== file && !(previous.safeReplacement || safeReplacement)) {
    duplicateObjects.push({ kind, name, previous: previous.file, file });
  }
  seenObjects.set(key, { file, safeReplacement });
}

function policyIsReplacement(text, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`DROP\\s+POLICY\\s+IF\\s+EXISTS\\s+[\\\"]?${escaped}[\\\"]?`, 'i').test(text);
}

function triggerIsReplacement(text, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`DROP\\s+TRIGGER\\s+IF\\s+EXISTS\\s+[\\\"]?${escaped}[\\\"]?`, 'i').test(text);
}

for (const file of files) {
  const text = fs.readFileSync(path.join(dir, file), 'utf8');
  const statements = text.split(';').map((statement) => statement.trim()).filter(Boolean);

  for (const statement of statements) {
    if (/^DROP\s+TABLE\b/i.test(statement) && !/^DROP\s+TABLE\s+IF\s+EXISTS\b/i.test(statement)) {
      findings.push(`${file}: DROP TABLE without IF EXISTS guard`);
    }
    if (/^DROP\s+FUNCTION\b/i.test(statement) && !/^DROP\s+FUNCTION\s+IF\s+EXISTS\b/i.test(statement)) {
      findings.push(`${file}: DROP FUNCTION without IF EXISTS guard`);
    }
  }

  for (const m of text.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([\w.\"]+)/gi)) {
    const statement = m[0];
    record('table', m[1], file, /IF\s+NOT\s+EXISTS/i.test(statement) || /CREATE\s+OR\s+REPLACE\s+TABLE/i.test(statement));
  }
  for (const m of text.matchAll(/CREATE\s+(?:UNIQUE\s+)?INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+([\w.\"]+)/gi)) {
    const statement = m[0];
    record('index', m[1], file, /IF\s+NOT\s+EXISTS/i.test(statement));
  }
  for (const m of text.matchAll(/CREATE\s+POLICY\s+([\w.\"]+)/gi)) {
    record('policy', m[1], file, policyIsReplacement(text, m[1]));
  }
  for (const m of text.matchAll(/CREATE\s+TRIGGER\s+([\w.\"]+)/gi)) {
    record('trigger', m[1], file, triggerIsReplacement(text, m[1]));
  }

  // Functions are commonly intentionally replaced as migrations evolve and may be overloaded.
  // Keep them inventoried, but do not treat repeated function names as duplicates by themselves.
}

// A live staging restore proved that this table exists in the governed schema but
// the originating historical migration is absent from this repository. Keep the
// relation, tenant gate, privileges, and priority index in the tracked schema chain.
const voiParityFile = files.find((file) => file.includes('restore_intelligence_voi_requests_schema_parity'));
if (!voiParityFile) {
  findings.push('missing restore parity migration: intelligence_voi_requests');
} else {
  const voiSql = fs.readFileSync(path.join(dir, voiParityFile), 'utf8');
  const voiRequirements = [
    ['table definition', /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+public\.intelligence_voi_requests/i],
    ['priority index', /CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+idx_voi_requests_priority/i],
    ['RLS enabled', /ALTER\s+TABLE\s+public\.intelligence_voi_requests\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i],
    ['tenant policy', /CREATE\s+POLICY\s+voi_requests_tenant/i],
    ['tenant policy check', /USING\s*\(company_id\s*=\s*public\.current_company_id\(\)\)\s*WITH\s+CHECK\s*\(company_id\s*=\s*public\.current_company_id\(\)\)/i],
    ['anon/public revoke', /REVOKE\s+ALL\s+ON\s+TABLE\s+public\.intelligence_voi_requests\s+FROM\s+PUBLIC\s*,\s*anon/i],
    ['authenticated privileges', /GRANT\s+SELECT\s*,\s*INSERT\s*,\s*UPDATE\s*,\s*DELETE\s+ON\s+TABLE\s+public\.intelligence_voi_requests\s+TO\s+authenticated/i],
    ['service-role privileges', /GRANT\s+SELECT\s*,\s*INSERT\s*,\s*UPDATE\s*,\s*DELETE\s+ON\s+TABLE\s+public\.intelligence_voi_requests\s+TO\s+service_role/i],
    ['sensitivity nonnegative guard', /intelligence_voi_requests_sensitivity_check[\s\S]*?CHECK\s*\(sensitivity\s*>=\s*0\)/i],
    ['value nonnegative guard', /intelligence_voi_requests_estimated_value_check[\s\S]*?CHECK\s*\(estimated_value\s*>=\s*0\)/i],
    ['priority nonnegative guard', /intelligence_voi_requests_priority_score_check[\s\S]*?CHECK\s*\(priority_score\s*>=\s*0\)/i],
    ['explicit state guard', /intelligence_voi_requests_state_check[\s\S]*?CHECK\s*\(state\s*=\s*ANY\s*\(ARRAY\[/i],
  ];
  for (const [label, pattern] of voiRequirements) {
    if (!pattern.test(voiSql)) findings.push(voiParityFile + ': VOI restore parity missing ' + label);
  }
}

if (duplicateObjects.length) {
  for (const d of duplicateObjects) findings.push(`unsafe duplicate ${d.kind} ${d.name}: ${d.previous} -> ${d.file}`);
}

for (const file of files) {
  if (!/^\d{14}_[a-z0-9_ -]+\.sql$/i.test(file)) {
    findings.push(`non-canonical migration filename: ${file}`);
  }
}

const summary = {
  migrationCount: files.length,
  tables: [...seenObjects.entries()].filter(([k]) => k.startsWith('table:')).length,
  indexes: [...seenObjects.entries()].filter(([k]) => k.startsWith('index:')).length,
  policies: [...seenObjects.entries()].filter(([k]) => k.startsWith('policy:')).length,
  triggers: [...seenObjects.entries()].filter(([k]) => k.startsWith('trigger:')).length,
  findings,
};

console.log(JSON.stringify(summary, null, 2));
if (findings.length) process.exit(1);
console.log(`Migration schema audit passed: ${files.length} migration(s)`);
