#!/usr/bin/env node
/**
 * Static migration dependency analyzer.
 *
 * Purpose: turn the migration inventory into machine-checkable evidence without
 * claiming that the live database has applied the same objects.
 *
 * It intentionally reports candidates rather than pretending SQL parsing is a
 * full PostgreSQL parser. CREATE OR REPLACE is treated as an intentional
 * evolution signal; same-name CREATE TABLE/INDEX/POLICY/TRIGGER conflicts are
 * surfaced for review.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'supabase', 'migrations');
if (!fs.existsSync(root)) {
  console.error('Migration directory not found:', root);
  process.exit(1);
}

const files = fs.readdirSync(root)
  .filter((f) => f.endsWith('.sql'))
  .sort((a, b) => a.localeCompare(b));

const patterns = [
  ['table', /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z_][\w$]*)/gi],
  ['table_alter', /ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:public\.)?([a-zA-Z_][\w$]*)/gi],
  ['function', /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?([a-zA-Z_][\w$]*)\s*\(/gi],
  ['index', /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z_][\w$]*)/gi],
  ['policy', /CREATE\s+POLICY\s+([a-zA-Z_][\w$]*)/gi],
  ['trigger', /CREATE\s+TRIGGER\s+([a-zA-Z_][\w$]*)/gi],
];

const objects = [];
for (const file of files) {
  const sql = fs.readFileSync(path.join(root, file), 'utf8');
  for (const [kind, re] of patterns) {
    for (const match of sql.matchAll(re)) {
      objects.push({ file, kind, name: match[1], replace: /CREATE\s+OR\s+REPLACE\s+/i.test(match[0]) });
    }
  }
}

const groups = new Map();
for (const obj of objects) {
  const key = `${obj.kind}:${obj.name.toLowerCase()}`;
  const list = groups.get(key) ?? [];
  list.push(obj);
  groups.set(key, list);
}

const repeated = [...groups.entries()]
  .filter(([, list]) => list.length > 1)
  .map(([key, list]) => ({ key, objects: list }));

const report = {
  generatedAt: new Date().toISOString(),
  migrationCount: files.length,
  objectReferenceCount: objects.length,
  repeatedObjectDefinitions: repeated.length,
  repeated,
  note: 'Static repository evidence only; live database application/drift is not inferred.'
};

const outDir = path.resolve(process.cwd(), 'artifacts');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'migration-dependency-report.json'), JSON.stringify(report, null, 2));

console.log(`Migration files: ${files.length}`);
console.log(`Object references: ${objects.length}`);
console.log(`Repeated object definitions: ${repeated.length}`);
for (const item of repeated) {
  console.log(`REVIEW ${item.key}: ${item.objects.map((x) => `${x.file}${x.replace ? ' [OR REPLACE]' : ''}`).join(', ')}`);
}

// Do not fail merely because an object evolves across migrations. Fail only
// on repeated non-replace CREATE TABLE definitions, which are high-confidence
// conflicts worth blocking until reviewed.
const hardConflicts = repeated.filter(({ key, objects: list }) =>
  key.startsWith('table:') && list.some((x) => !x.replace)
);
if (hardConflicts.length) {
  console.error(`Hard migration conflicts detected: ${hardConflicts.length}`);
  process.exit(2);
}
