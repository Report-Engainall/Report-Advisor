import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'src');
const exts = new Set(['.ts','.tsx','.js','.jsx']);
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(path.extname(entry.name))) files.push(full);
  }
}
walk(root);

const findings = [];
const fakePatterns = [
  { code: 'EMPTY_ONCLICK', re: /onClick\s*=\s*\{\s*\(?(?:[^)]*)\)?\s*=>\s*\{\s*\}\s*\}/g },
  { code: 'EMPTY_ONSUBMIT', re: /onSubmit\s*=\s*\{\s*\(?(?:[^)]*)\)?\s*=>\s*\{\s*\}\s*\}/g },
  { code: 'UNIMPLEMENTED_MARKER', re: /(?:TODO|FIXME|coming\s+soon|not\s+implemented)/gi },
  { code: 'MOCK_MARKER', re: /(?:mock|sample\s+data|fake\s+data)/gi },
];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(process.cwd(), file);
  for (const pattern of fakePatterns) {
    let match;
    while ((match = pattern.re.exec(text))) {
      const line = text.slice(0, match.index).split('\n').length;
      findings.push({ file: rel, line, code: pattern.code, excerpt: text.slice(Math.max(0, match.index - 70), Math.min(text.length, match.index + 150)).replace(/\s+/g, ' ').trim() });
    }
  }

  const buttonRe = /<button\b([\s\S]*?)(?:>|\/>)/g;
  let button;
  while ((button = buttonRe.exec(text))) {
    const attrs = button[1];
    const full = button[0];
    const isSubmit = /\btype\s*=\s*["']submit["']/.test(attrs);
    const hasClick = /\bonClick\s*=/.test(attrs);
    const hasFormAssociation = /\bform\s*=/.test(attrs);
    if (!hasClick && !isSubmit && !hasFormAssociation) {
      const line = text.slice(0, button.index).split('\n').length;
      findings.push({ file: rel, line, code: 'UNWIRED_BUTTON', excerpt: full.replace(/\s+/g, ' ').trim().slice(0, 220) });
    }
  }
}

const blockingCodes = new Set(['EMPTY_ONCLICK','EMPTY_ONSUBMIT','UNIMPLEMENTED_MARKER','MOCK_MARKER','UNWIRED_BUTTON']);
const blockers = findings.filter(x => blockingCodes.has(x.code));
console.log(JSON.stringify({ files_scanned: files.length, findings: findings.length, blocking_findings: blockers.length, findings }, null, 2));

if (blockers.length) {
  const counts = blockers.reduce((map, finding) => map.set(finding.code, (map.get(finding.code) ?? 0) + 1), new Map());
  console.error(`FRONTEND ACTION COMPLETENESS FAILED: ${blockers.length} blocking findings found.`);
  console.error(JSON.stringify(Object.fromEntries(counts), null, 2));
  console.error('Every blocking finding must be implemented or removed; intentional exceptions require an explicit allowlist with justification before this gate can pass.');
  process.exitCode = 1;
} else {
  console.log('PASS no blocking frontend action completeness findings detected.');
}
