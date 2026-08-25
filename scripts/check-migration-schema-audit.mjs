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

function record(kind, name, file) {
  const key = `${kind}:${name}`;
  const previous = seenObjects.get(key);
  if (previous && previous !== file) duplicateObjects.push({ kind, name, previous, file });
  seenObjects.set(key, file);
}

for (const file of files) {
  const text = fs.readFileSync(path.join(dir, file), 'utf8');
  if (/\\bDROP\\s+TABLE\\b/i.test(text) && !/\\bIF\\s+EXISTS\\b/i.test(text)) {
    findings.push(`${file}: DROP TABLE without IF EXISTS guard`);
  }
  if (/\\bDROP\\s+FUNCTION\\b/i.test(text) && !/\\bIF\\s+EXISTS\\b/i.test(text)) {
    findings.push(`${file}: DROP FUNCTION without IF EXISTS guard`);
  }

  for (const m of text.matchAll(/CREATE\\s+(?:OR\\s+REPLACE\\s+)?TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?([\\w.\"]+)/gi)) record('table', m[1], file);
  for (const m of text.matchAll(/CREATE\\s+(?:OR\\s+REPLACE\\s+)?FUNCTION\\s+([\\w.\"]+)/gi)) record('function', m[1], file);
  for (const m of text.matchAll(/CREATE\\s+(?:UNIQUE\\s+)?INDEX(?:\\s+IF\\s+NOT\\s+EXISTS)?\\s+([\\w.\"]+)/gi)) record('index', m[1], file);
  for (const m of text.matchAll(/CREATE\\s+POLICY\\s+([\\w.\"]+)/gi)) record('policy', m[1], file);
  for (const m of text.matchAll(/CREATE\\s+TRIGGER\\s+([\\w.\"]+)/gi)) record('trigger', m[1], file);
}

if (duplicateObjects.length) {
  for (const d of duplicateObjects) findings.push(`duplicate ${d.kind} ${d.name}: ${d.previous} -> ${d.file}`);
}

// Migration names must sort monotonically; this catches accidental non-timestamped files.
for (const file of files) {
  if (!/^\\d{14}_[a-z0-9_ -]+\\.sql$/i.test(file)) {
    findings.push(`non-canonical migration filename: ${file}`);
  }
}

const summary = {
  migrationCount: files.length,
  tables: [...seenObjects.entries()].filter(([k]) => k.startsWith('table:')).length,
  functions: [...seenObjects.entries()].filter(([k]) => k.startsWith('function:')).length,
  indexes: [...seenObjects.entries()].filter(([k]) => k.startsWith('index:')).length,
  policies: [...seenObjects.entries()].filter(([k]) => k.startsWith('policy:')).length,
  triggers: [...seenObjects.entries()].filter(([k]) => k.startsWith('trigger:')).length,
  findings,
};

console.log(JSON.stringify(summary, null, 2));
if (findings.length) process.exit(1);
console.log(`Migration schema audit passed: ${files.length} migration(s)`);
