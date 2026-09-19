import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('src/pages/ExternalFileAnalysisPage.tsx', 'utf8');

assert.match(page, /securityScan\(selected, buffer\)/);
assert.match(page, /computeSHA256\(buffer\)/);
assert.match(page, /parseFile\(buffer, selected\.name, detection\.format\)/);
assert.match(page, /معاينة\/تحليل ملف/);
assert.match(page, /ليست Canonical Data committed إلى قاعدة الأعمال/);
assert.match(page, /حالة البيانات/);
assert.match(page, /معاينة فقط/);
assert.match(page, /<Link to=\"\/import\/analyze\"/);
assert.doesNotMatch(page, /supabase\.from\(/);
assert.doesNotMatch(page, /Math\.random\(|mock|synthetic|dummy/i);

console.log('External file analysis trust contract: PASS');
console.log('  - security scan, format detection, SHA-256 and parsing remain explicit');
console.log('  - UI declares preview-only status and does not impersonate canonical commitment');
console.log('  - canonical import is a separate explicit next step');
