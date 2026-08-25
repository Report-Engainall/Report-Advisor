#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOTS = ['src'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const ALLOWED = [
  /user_metadata/i,
  /current_company_id/i,
  /company_id/i,
  /companyProfile/i,
  /companySettings/i,
  /companyName/i,
  /company_name/i,
];

// This guard is intentionally conservative: it flags likely hard-coded
// company identity/configuration while allowing canonical tenant plumbing.
const FORBIDDEN = [
  /شركة\s*العامري/i,
  /Alamri\s*(Trading|Company)/i,
  /admin@alamri\.com/i,
  /رقم\s*(السجل|التسجيل)\s*الضريبي\s*[:=]\s*["'`]/i,
  /(?:currency|العملة)\s*[:=]\s*["'`]ر\.س/i,
];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (EXTENSIONS.has(entry.name.slice(entry.name.lastIndexOf('.')))) out.push(full);
  }
  return out;
}

const findings = [];
for (const root of ROOTS) {
  for (const file of await walk(root)) {
    const text = await readFile(file, 'utf8');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      if (FORBIDDEN.some((pattern) => pattern.test(line)) && !ALLOWED.some((pattern) => pattern.test(line))) {
        findings.push(`${file}:${i + 1}: ${line.trim()}`);
      }
    });
  }
}

if (findings.length) {
  console.error('Company configuration truth guard: FAIL');
  console.error('Likely hard-coded company identity/configuration found:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log('Company configuration truth guard: PASS');
console.log('No prohibited hard-coded company identity/configuration was detected in source.');
