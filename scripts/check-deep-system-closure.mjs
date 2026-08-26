import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOTS = ['src', 'scripts', 'supabase', '.github'];
const EXT = /\.(?:ts|tsx|js|jsx|mjs|cjs|sql|yml|yaml|json)$/;
const IGNORE = new Set(['node_modules', '.git', 'dist', 'coverage']);
const files = [];
function walk(dir) {
  if (!statSync(dir, { throwIfNoEntry: false })) return;
  for (const name of readdirSync(dir)) {
    if (IGNORE.has(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (EXT.test(name)) files.push(p);
  }
}
for (const root of ROOTS) walk(root);

const text = new Map(files.map(f => [f, readFileSync(f, 'utf8')]));
const all = [...text.entries()];
const hits = (re) => all.flatMap(([file, body]) => [...body.matchAll(re)].map(m => ({ file: relative('.', file), line: body.slice(0, m.index).split('\n').length, match: m[0].slice(0, 220) })));

const legacy = ['InventoryPage', 'ReceivablesReportPage'].map(symbol => {
  const declarations = hits(new RegExp(`(?:export\\s+)?(?:function|const|class)\\s+${symbol}\\b`, 'g'));
  const references = hits(new RegExp(`\\b${symbol}\\b`, 'g')).filter(h => !declarations.some(d => d.file === h.file && d.line === h.line));
  const imports = hits(new RegExp(`(?:import|export)[^\\n]*\\b${symbol}\\b`, 'g'));
  return { symbol, declarations, references, imports, consumerStatus: references.length === 0 ? 'ZERO-CONSUMER CANDIDATE' : 'CONSUMERS PRESENT' };
});

const patterns = {
  paginatedToAggregate: /(?:page|offset|limit|pageSize|pagination)[^\n]{0,180}(?:reduce|\.sum\(|\.count\(|aggregate)/gi,
  paginatedToExport: /(?:export|download|csv|xlsx|json|pdf)[^\n]{0,220}(?:page|offset|limit|pageSize|pagination)/gi,
  numericNullCoercion: /(?:Number|parseFloat|parseInt)\s*\(\s*(?:[^)]*\?\?\s*0|[^)]*\|\|\s*0)|(?:\?\?|\|\|)\s*0/g,
  semanticZero: /(?:unknown|missing|null|insufficient|empty)[^\n]{0,100}(?:=|=>|\?\?)\s*0/gi,
  tenantCallerAuthority: /(?:tenant[_-]?id|company[_-]?id|organization[_-]?id)[^\n]{0,120}(?:req\.|request\.|params|query|body|searchParams|localStorage|sessionStorage|URL)/gi,
  sideEffectRetry: /(?:retry|backoff|requeue)[^\n]{0,220}(?:insert|update|delete|send|publish|webhook|email|writeFile|upload)/gi,
};
const patternHits = Object.fromEntries(Object.entries(patterns).map(([name, re]) => [name, hits(re)]));

const report = {
  generatedAt: new Date().toISOString(),
  filesScanned: files.length,
  legacy,
  patternHits,
  interpretation: {
    consumerProof: 'Search evidence is not runtime proof. ZERO-CONSUMER is only certified after direct/indirect/runtime/test/build checks and successful regression.',
    semanticRule: 'NULL/UNKNOWN/MISSING/INSUFFICIENT_DATA must not silently become ZERO.',
    exportRule: 'A full export must not consume a paginated response unless explicitly classified CURRENT_VIEW.',
    tenantRule: 'Caller-controlled tenant identifiers are untrusted until server authority is established.',
  },
};
mkdirSync('artifacts', { recursive: true });
writeFileSync('artifacts/deep-system-closure.json', JSON.stringify(report, null, 2));
const md = [
  '# Deep System Closure Evidence',
  `Generated: ${report.generatedAt}`,
  `Files scanned: ${files.length}`,
  '',
  '## Legacy candidates',
  ...legacy.map(x => `- ${x.symbol}: **${x.consumerStatus}**; declarations=${x.declarations.length}; references=${x.references.length}; imports=${x.imports.length}`),
  '',
  '## Pattern findings',
  ...Object.entries(patternHits).map(([k, v]) => `- ${k}: ${v.length} hit(s)`),
  '',
  '## Certification rule',
  '- Search results are evidence inputs, not certification.',
  '- NOT PROVEN remains the state until regression/runtime evidence exists.',
  '- LIVE REQUIRED is used where production/runtime infrastructure is necessary.',
  '- NOT PRODUCTION CERTIFIED remains until production evidence is available.',
].join('\n');
writeFileSync('artifacts/deep-system-closure.md', md);
console.log(md);
