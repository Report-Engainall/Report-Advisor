#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const recommendations = read('src/pages/IntelligencePages.tsx');
const scenario = read('src/pages/CanonicalScenarioPage.tsx');
const files = read('src/pages/ExternalFileAnalysisPage.tsx');

const checks = [
  [recommendations.includes('إشارات مصدرية تنتظر قرارًا بشريًا'), 'Recommendations must state human decision ownership.'],
  [recommendations.includes('مصدر → دليل → قرار'), 'Recommendations must expose evidence flow.'],
  [recommendations.includes("aria-pressed={filter === 'all'}"), 'Recommendation filters need semantic pressed state.'],
  [scenario.includes('محاكاة مرجعية حتمية'), 'Scenario must be explicit deterministic simulation.'],
  [scenario.includes('ليست Forecast ولا إثباتًا لنتيجة تشغيلية'), 'Scenario must not present simulation as forecast/truth.'],
  [files.includes('focus-visible:ring-2 focus-visible:ring-primary-500'), 'File drop zone must be keyboard accessible.'],
  [files.includes('05 · جاهزية التحليل'), 'File analysis must expose staged progression.'],
  [files.includes('بصمة SHA-256'), 'File analysis must preserve source fingerprint visibility.'],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, message] of failed) console.error('FAIL:', message);
  process.exit(1);
}
console.log('PASS: Aghbari command wave 2 UI contract');
