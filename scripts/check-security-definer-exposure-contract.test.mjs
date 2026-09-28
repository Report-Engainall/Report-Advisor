import fs from 'node:fs';
import path from 'node:path';

const scriptPath = path.join(process.cwd(), 'scripts', 'check-security-definer-exposure-contract.mjs');
const source = fs.readFileSync(scriptPath, 'utf8');

const requiredSnippets = [
  "const bodyTag = candidate.match(/\\bAS\\s+(\\$[A-Za-z_][A-Za-z0-9_]*\\$|\\$\\$)/i)?.[1];",
  "const bodyEnd = candidate.indexOf(bodyTag + ';');",
  "if (raw === undefined) return null;",
  "normalized === '' || normalized === 'pg_catalog'",
];

for (const snippet of requiredSnippets) {
  if (!source.includes(snippet)) {
    throw new Error(`SECURITY_DEFINER_PARSER_REGRESSION_MISSING:${snippet}`);
  }
}

const legacyBrokenEscapes = [
  "candidate.match(/\\\\bAS\\\\s+",
  "window.match(/SET\\\\s+search_path",
  "new RegExp(\\`CREATE\\\\s+",
];
for (const broken of legacyBrokenEscapes) {
  if (source.includes(broken)) {
    throw new Error(`SECURITY_DEFINER_PARSER_REGRESSION_BROKEN_ESCAPE:${broken}`);
  }
}

console.log('PASS: security-definer exposure parser regression guards are present');
