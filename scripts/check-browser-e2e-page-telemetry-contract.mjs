import fs from 'node:fs';

const fail = (message) => { throw new Error('BROWSER_E2E_PAGE_TELEMETRY_CONTRACT_FAIL: ' + message); };
const source = fs.readFileSync(new URL('./run-full-product-browser-e2e.mjs', import.meta.url), 'utf8');

for (const marker of [
  'const pageTelemetryByPage = new WeakMap();',
  'function telemetryFor(targetPage)',
  'telemetry.pendingDataRequests.add(request)',
  'telemetry.pendingDataRequests.delete(request)',
  'telemetry.dataRequestsSeen += 1',
  'telemetry.dataRequestsSeen - dataBaseline',
  'const routeTelemetry = telemetryFor(routePage);',
  'routeTelemetry.pendingDataRequests.clear();',
  'const readbackTelemetry = telemetryFor(routePage);',
  'readbackTelemetry.pendingDataRequests.clear();',
  'const readbackBaseline = readbackTelemetry.dataRequestsSeen;',
]) {
  if (!source.includes(marker)) fail('missing page-scoped telemetry invariant: ' + marker);
}
if (source.includes('const pendingDataRequests = new Set()')) fail('pending request state must not be shared between browser pages');
if (source.includes('let dataRequestsSeen = 0')) fail('request counts must not be shared between browser pages');
for (const marker of [
  "route.startsWith('/reports/smart/' + REAL_SMART_REPORT_JOB_ID)",
  "request.method() === 'GET'",
  "url.includes('/rest/v1/business_intelligence_decisions?')",
  "url.includes('decision_key=like.source-intelligence')",
  "if (routeFailed.length) addFinding('E2E-NET-'",
  "if (routeFailedResponses.length) addFinding('E2E-HTTP-'",
]) {
  if (!source.includes(marker)) fail('missing safe noncritical decision-history classification or failure accounting: ' + marker);
}
const clearBeforeReload = source.indexOf('readbackTelemetry.pendingDataRequests.clear();');
const baselineBeforeReload = source.indexOf('const readbackBaseline = readbackTelemetry.dataRequestsSeen;', clearBeforeReload);
const reloadAfterBaseline = source.indexOf("await routePage.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });", baselineBeforeReload);
if (clearBeforeReload < 0 || baselineBeforeReload < clearBeforeReload || reloadAfterBaseline < baselineBeforeReload) {
  fail('refresh readback must clear old page-local background requests, take a new baseline, then reload');
}
console.log('browser-e2e-page-telemetry-contract: PASS');
