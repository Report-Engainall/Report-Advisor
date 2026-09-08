import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'src/pages');
const files = fs.readdirSync(root).filter((name) => name.endsWith('.tsx'));
const findings = [];

for (const name of files) {
  const filePath = path.join(root, name);
  const source = fs.readFileSync(filePath, 'utf8');

  // A promise created directly inside an effect must have an explicit rejection path.
  // This intentionally targets the compact patterns used by the application today.
  const effectBlocks = source.match(/useEffect\(\(\)\s*=>\s*\{([\s\S]*?)\}\s*,/g) ?? [];
  for (const block of effectBlocks) {
    if (/\bfetch[A-Z]\w*\([^;]*\)\.then\(/.test(block) && !/\.catch\(/.test(block) && !/try\s*\{/.test(block)) {
      findings.push(`${name}: async useEffect fetch has no explicit catch/rejection path`);
    }
  }

  // Async click handlers used for user-facing mutations/exports need an explicit
  // failure path. Calls deliberately fire-and-forget only when the callee itself
  // owns the error surface; direct async arrow handlers are therefore reviewed.
  const asyncHandlers = source.match(/onClick=\{\s*async\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)\}\s*\}/g) ?? [];
  for (const handler of asyncHandlers) {
    if (/\bawait\b/.test(handler) && !/\bcatch\b/.test(handler) && !/\btry\s*\{/.test(handler)) {
      findings.push(`${name}: async onClick handler has no explicit catch/rejection path`);
    }
  }

  // Promise-returning action functions invoked by onClick with void are allowed only
  // when the function itself is known to surface errors. This guard records direct
  // export/action functions whose body awaits without a catch for manual review.
  const functions = source.match(/(?:const|function)\s+(?:export\w*|handle\w*|export\w*)[^=]*?(?:=\s*async\s*\([^)]*\)|async\s+\w+\([^)]*\))\s*=>?\s*\{([\s\S]*?)\n\s*\};?/g) ?? [];
  for (const fn of functions) {
    if (/\bawait\b/.test(fn) && !/\bcatch\b/.test(fn) && !/\btry\s*\{/.test(fn)) {
      const nameMatch = fn.match(/(?:const|function)\s+(\w+)/);
      findings.push(`${name}: async action ${nameMatch?.[1] ?? 'anonymous'} has no explicit catch/rejection path`);
    }
  }
}

const unique = [...new Set(findings)];
if (unique.length) {
  console.error('UI async state contract: FAIL');
  for (const finding of unique) console.error(`- ${finding}`);
  process.exit(1);
}

console.log('UI async state contract: PASS');
