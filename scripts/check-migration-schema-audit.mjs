import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'supabase', 'migrations');
if (!fs.existsSync(dir)) throw new Error(`Missing migrations directory: ${dir}`);

const files = fs.readdirSync(dir)
  .filter((name) => name.endsWith('.sql'))
  .sort((a, b) => a.localeCompare(b));

if (files.length === 0) throw new Error('No SQL migrations found');

const seenObjects = new Map();
const duplicateObjects = [];
const findings = [];

function record(kind, name, file, safeReplacement) {
  const key = `${kind}:${name}`;
  const previous = seenObjects.get(key);
  if (previous && previous.file !== file && !safeReplacement) {
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
