import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const source = fs.readFileSync('src/pages/IntelligenceActionPages.tsx', 'utf8');
const findings = [];

if (!app.includes("import('@/pages/IntelligenceActionPages')")) findings.push('App does not route intelligence actions through the hardened module');
if (!/fetchRecommendations\(\)/.test(source) || !/catch \(e: unknown\)/.test(source)) findings.push('recommendation loading lacks explicit rejection handling');
if (!/updateRecommendationStatus\(id, status\)/.test(source) || !/setActionError\(/.test(source)) findings.push('recommendation mutation lacks visible failure handling');
if (!/disabled=\{actionId !== null\}/.test(source)) findings.push('recommendation mutation controls lack duplicate-action fencing');
if (!/fetchForecasts\(\)/.test(source) || !/تعذر تحميل التنبؤات/.test(source) || !/onRetry=\{load\}/.test(source)) findings.push('forecast loading lacks explicit retryable failure state');

if (findings.length) {
  console.error('Intelligence action page contract: FAIL');
  findings.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}
console.log('Intelligence action page contract: PASS');
