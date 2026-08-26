import { readFileSync, writeFileSync } from 'node:fs';

const target = 'src/pages/ReportsPage.tsx';
const symbol = 'ReceivablesReportPage';
const body = readFileSync(target, 'utf8');
const declaration = `export function ${symbol}(`;
const start = body.indexOf(declaration);
if (start < 0) {
  console.log(`LEGACY_ALREADY_REMOVED ${symbol}`);
  process.exit(0);
}

const files = ['src', 'scripts', 'supabase'];
const fs = await import('node:fs');
const path = await import('node:path');
const refs = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', 'coverage'].includes(name)) continue;
    const p = path.join(dir, name); const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs|sql)$/.test(name)) {
      const t = fs.readFileSync(p, 'utf8');
      for (const [i, line] of t.split('\n').entries()) {
        if (t !== body && line.includes(symbol)) refs.push(`${p}:${i + 1}:${line.trim()}`);
      }
    }
  }
}
for (const dir of files) walk(dir);
if (refs.length) {
  console.error('LEGACY_CONSUMERS_PRESENT');
  console.error(refs.join('\n'));
  process.exit(2);
}

const open = body.indexOf('{', start);
if (open < 0) throw new Error('function opening brace not found');
let depth = 0; let quote = null; let escaped = false; let end = -1;
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
  else if (c === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
if (end < 0) throw new Error(`unbalanced braces in ${symbol}`);
let next = body.slice(0, start) + body.slice(end);
next = next.replace(/\n{3,}/g, '\n\n');
writeFileSync(target, next);
console.log(`PRUNED ${symbol} from ${target}`);
