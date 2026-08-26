import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const candidates = [
  {
    target: 'src/pages/ReportsPage.tsx',
    legacySymbol: 'ReceivablesReportPage',
    canonicalFile: 'src/pages/ReceivablesReportPageCanonical.tsx',
    canonicalSymbol: 'ReceivablesReportPageCanonical',
    canonicalImport: '@/pages/ReceivablesReportPageCanonical',
  },
];

const sourceRoots = ['src', 'scripts', 'supabase', '.github'];
const ignored = new Set(['node_modules', '.git', 'dist', 'coverage']);
const sourcePattern = /\.(ts|tsx|js|jsx|mjs|cjs|sql|yml|yaml)$/;
const self = path.normalize('scripts/prune-proven-legacy-pages.mjs');

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (ignored.has(name)) continue;
    const file = path.normalize(path.join(dir, name));
    const stat = statSync(file);
    if (stat.isDirectory()) walk(file, out);
    else if (sourcePattern.test(name)) out.push(file);
  }
  return out;
}

function assert(condition, message) {
  if (!condition) throw new Error(`SAFE_PRUNE_ABORT: ${message}`);
}

function exactIdentifier(symbol) {
  return new RegExp(`\\b${symbol}\\b`);
}

function isCanonicalAliasLine(line, candidate) {
  return line.includes(candidate.canonicalImport) && line.includes(candidate.canonicalSymbol);
}

function collectReferences(files, candidate) {
  const refs = [];
  const legacyRe = exactIdentifier(candidate.legacySymbol);
  const canonicalRe = exactIdentifier(candidate.canonicalSymbol);

  for (const file of files) {
    if (file === path.normalize(candidate.target) || file === self) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      if (!legacyRe.test(line)) return;
      if (canonicalRe.test(line)) return;
      if (isCanonicalAliasLine(line, candidate)) return;
      refs.push(`${file}:${index + 1}:${line.trim()}`);
    });
  }
  return refs;
}

for (const candidate of candidates) {
  const target = path.normalize(candidate.target);
  const canonical = path.normalize(candidate.canonicalFile);
  assert(existsSync(target), `legacy target missing: ${candidate.target}`);
  assert(existsSync(canonical), `canonical implementation missing: ${candidate.canonicalFile}`);

  const body = readFileSync(target, 'utf8');
  const declaration = new RegExp(`export\\s+function\\s+${candidate.legacySymbol}\\s*\\(`);
  const start = body.search(declaration);
  if (start < 0) {
    console.log(`LEGACY_ALREADY_REMOVED ${candidate.legacySymbol}`);
    continue;
  }

  const canonicalBody = readFileSync(canonical, 'utf8');
  assert(new RegExp(`export\\s+function\\s+${candidate.canonicalSymbol}\\s*\\(`).test(canonicalBody), `canonical export not proven: ${candidate.canonicalSymbol}`);

  const files = sourceRoots.flatMap(root => walk(path.normalize(root)));
  const refs = collectReferences(files, candidate);
  assert(refs.length === 0, `active consumers remain for ${candidate.legacySymbol}\n${refs.join('\n')}`);

  const app = readFileSync('src/App.tsx', 'utf8');
  assert(app.includes(candidate.canonicalImport), `active route does not import canonical implementation: ${candidate.canonicalImport}`);
  assert(app.includes(candidate.canonicalSymbol), `active route does not target canonical export: ${candidate.canonicalSymbol}`);

  const open = body.indexOf('{', start);
  assert(open >= 0, `function opening brace not found for ${candidate.legacySymbol}`);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let end = -1;
  for (let i = open; i < body.length; i++) {
    const c = body[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  assert(end >= 0, `unbalanced braces in ${candidate.legacySymbol}`);

  const next = body.slice(0, start) + body.slice(end).replace(/^\n+/, '\n');
  writeFileSync(target, next);
  console.log(`PROVEN_AND_PRUNED ${candidate.legacySymbol}`);
}

console.log('SAFE_PRUNE_GUARD=PASS');
console.log('Invariant: ambiguous or unproven legacy candidates abort deletion.');
