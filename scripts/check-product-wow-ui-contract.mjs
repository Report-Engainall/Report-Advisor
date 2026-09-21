import assert from 'node:assert/strict';
import fs from 'node:fs';

const login = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');
const dashboard = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
const entities = fs.readFileSync('src/pages/EntityPages.tsx', 'utf8');
const appShell = fs.readFileSync('src/App.tsx', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

for (const token of [
  'competitiveProofLanes',
  'خمس طرق محددة لمنافسة المشاريع الأكبر',
  'Evidence-First BI',
  'Governed Excel / CSV',
  'Arabic RTL B2B UX',
  'Inventory / Receivables',
  'Supabase Tenant Security',
]) assert.ok(login.includes(token), `login proof theater missing: ${token}`);

for (const token of [
  'ملخص القرار في دقيقة',
  'أهم إشارة',
  'الخطوة التالية',
  'snapshotAsOf',
  'liveRecommendations[0]',
  'decisionAccountability',
  'مالك محدد',
  'نتيجة أثر مسجلة',
  'توصية قابلة للتنفيذ',
]) assert.ok(dashboard.includes(token), `dashboard decision brief missing: ${token}`);

assert.ok(!login.includes('تجريبي') || login.includes('لا يوجد حساب تجريبي افتراضي'), 'login must not imply a fake demo account');
assert.ok(appShell.includes('ag-app-shell flex min-h-screen flex-row bg-transparent'), 'Arabic shell must use the natural RTL row so the sidebar stays on the right');
assert.ok(!appShell.includes('ag-app-shell flex min-h-screen bg-transparent " + (language === "ar" ? "flex-row-reverse"'), 'Arabic shell must not double-reverse flex direction');
assert.ok(sidebar.includes("dir={language==='ar'?'rtl':'ltr'}"), 'sidebar must explicitly carry the active text direction');
assert.ok(sidebar.includes("language==='ar'?'border-l':'border-r'"), 'sidebar divider must follow the navigation edge');
assert.ok(appShell.includes('DeterministicIntelligenceAssistant'), 'global Aghbari Advisor must be mounted in the application shell');
assert.ok(appShell.includes('ag-global-advisor'), 'global Aghbari Advisor must expose a stable drawer target');
assert.ok(appShell.includes('onOpenAdvisor'), 'mobile navigation must expose the Advisor action');
assert.ok(appShell.includes('advisorCounts.recommendations'), 'global Advisor must receive live recommendation context');
assert.ok(sidebar.includes("trust: { hint: 'إثبات، مصدر، وثقة', tag: 'TRUST' }"), 'Trust navigation section must have product metadata');
assert.ok(sidebar.includes("outputs: { hint: 'تقارير ومخرجات القرار', tag: 'OUTPUT' }"), 'Outputs navigation section must have product metadata');
assert.ok(!dashboard.includes('generateSynthetic'), 'decision brief must not invent synthetic business data');
const importSurface = fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');
assert.ok(importSurface.includes('لم يُثبت مصدر سابق لهذا الحساب بعد'), 'canonical import history empty state must distinguish an empty history');
assert.ok(importSurface.includes('اختيار مصدر'), 'canonical import history empty state must expose a real source-selection action');
assert.ok(importSurface.includes('onClick={reset}'), 'canonical import history empty state must use the existing reset/import path');

const entitiesSurface = fs.readFileSync('src/pages/EntityPages.tsx', 'utf8');
assert.ok(entitiesSurface.includes('const inventoryQueueEmpty = snapshot.totalRows === 0'), 'inventory page must use authoritative totalRows for source-empty state');
assert.ok(entitiesSurface.includes('const inventoryFilterEmpty = filter !== \'all\' && snapshot.filteredRows === 0'), 'inventory page must use an explicit filter plus authoritative filteredRows for filtered-empty state');
assert.ok(entitiesSurface.includes('لا توجد بيانات مخزون مثبتة'), 'inventory empty state must explain source absence');
assert.ok(entitiesSurface.includes('إضافة مصدر'), 'inventory source-empty state must expose the unified import action');
assert.ok(entitiesSurface.includes('عرض كل المخزون'), 'inventory filter-empty state must restore the full result set');
assert.ok(entitiesSurface.includes('<Link to="/import"'), 'inventory source-empty state must use the unified import route');

const dashboardSurface = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
assert.ok(dashboardSurface.includes('const emptyAnalysisAction'), 'dashboard empty analysis states must derive a real next action');
assert.ok(dashboardSurface.includes('تبقى الحالة غير مثبتة'), 'dashboard trend empty state must remain fail-closed');
assert.ok(dashboardSurface.includes('لا يتم تصنيع تركيب للفئات'), 'dashboard category empty state must not fabricate composition');
assert.ok(dashboardSurface.includes('مراجعة جودة البيانات'), 'dashboard customer/product empties must route to data quality');
assert.ok(dashboardSurface.includes("to: '/data-quality'"), 'dashboard must use the canonical data-quality route for insufficient truth');

const reports = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
assert.ok(!reports.includes('window.location.reload()'), 'report pages must retry in place without a full browser reload');
assert.ok(reports.includes('export function PurchasesReportPage()'), 'purchase report must remain guarded after retry refactor');
assert.ok(reports.includes('export function InventoryReportPage()'), 'inventory report must remain guarded after retry refactor');
assert.ok(reports.includes('export function ReceivablesReportPage()'), 'receivables report must remain guarded after retry refactor');
assert.ok(reports.includes('export function ProfitabilityReportPage()'), 'profitability report must remain guarded after retry refactor');
assert.ok(reports.includes('لقطة تجارية موثقة'), 'reports center must expose the current canonical snapshot');
assert.ok(reports.includes('NEXT ACTION'), 'reports center must expose a concrete next action');
assert.ok(reports.includes('افحص جودة البيانات'), 'reports center must route insufficient truth to data quality');
assert.ok(reports.includes('تحديث اللقطة'), 'reports center must support in-place refresh of the canonical snapshot');
assert.ok(!reports.includes('generateSynthetic'), 'reports center must not invent business values');
const trustEvidence = fs.readFileSync('src/pages/TrustEvidencePage.tsx', 'utf8');
assert.ok(trustEvidence.includes('const [refreshing, setRefreshing]'), 'trust evidence must refresh in-place instead of reloading the whole page');
assert.ok(!trustEvidence.includes('window.location.reload()'), 'trust evidence refresh must not discard page context with a full reload');
assert.ok(trustEvidence.includes('لا توجد بيانات مثبتة بعد'), 'empty trust state must explain the absence of evidence');
assert.ok(trustEvidence.includes('RECORDS CHECKED'), 'trust evidence must expose the source record count');
assert.ok(trustEvidence.includes('criticalIssueTotal'), 'trust evidence must expose critical issue pressure from the authoritative snapshot');
assert.ok(trustEvidence.includes('أغلق المشكلات الحرجة'), 'trust evidence must route critical data-quality pressure to an actionable next step');
assert.ok(trustEvidence.includes("aria-label={'الخطوة التالية: ' + nextStep.label}"), 'trust evidence next-action link must use valid JSX');
assert.ok(!trustEvidence.includes('aria-label={\\`'), 'trust evidence contract must reject escaped JSX template backticks');
const decisionExperience = fs.readFileSync('src/pages/DecisionExperiencePage.tsx', 'utf8');
assert.ok(decisionExperience.includes('فحص الثقة'), 'decision experience must provide a trust action when no active alerts exist');
assert.ok(decisionExperience.includes('إضافة مصدر'), 'decision experience must provide a canonical import action when no recommendations exist');
assert.ok(decisionExperience.includes('<Link to="/import"'), 'decision experience recommendation-empty state must use the unified import route');
assert.ok(decisionExperience.includes('العودة إلى الإشارات'), 'decision evidence empty-selection state must provide a return action');
assert.ok(decisionExperience.includes('<Link to="/trust"'), 'decision alerts must route source inspection to the trust/evidence surface');

const workCenter = fs.readFileSync('src/pages/WorkCenterPage.tsx', 'utf8');
assert.ok(workCenter.includes('const queueEmptyState = rows.length === 0'), 'work center must distinguish an empty tenant from a filtered empty queue');
assert.ok(workCenter.includes('إدخال مصدر من المسار الموحد'), 'work center empty tenant state must route to the canonical import entry');
assert.ok(workCenter.includes('عرض كل العمليات'), 'work center filtered empty state must restore the full queue without a reload');
assert.ok(workCenter.includes('<Link to="/import"'), 'work center must use the canonical import route for its first-action state');

const executiveCommand = fs.readFileSync('src/pages/ExecutiveCommandCenterPage.tsx', 'utf8');
assert.ok(executiveCommand.includes('فحص مساحة الإشارات'), 'executive command center alert-empty state must provide an intelligence action');
assert.ok(executiveCommand.includes('مراجعة جودة البيانات'), 'executive command center recommendation/trend empty states must expose the data-quality next step');
assert.ok(executiveCommand.includes('<Link to="/data-quality"'), 'executive command center empty states must use the canonical data-quality route');

const dataQuality = fs.readFileSync('src/pages/DataQualitySnapshotPage.tsx', 'utf8');
assert.ok(dataQuality.includes('criticalIssueTotal'), 'data quality must derive critical issue pressure from the current snapshot');
assert.ok(dataQuality.includes('const nextAction = snapshotStatus === \'EMPTY\''), 'data quality must derive the next action from real snapshot state');
assert.ok(dataQuality.includes('استيراد مصدر'), 'empty data quality must route to the canonical import entry');
assert.ok(dataQuality.includes('أغلق المشكلات الحرجة'), 'critical data quality must route to the trust review path');
assert.ok(dataQuality.includes('راجع مشكلات الجودة'), 'non-critical data quality issues must expose a review action');
assert.ok(dataQuality.includes('انتقل للتحليل'), 'clean data quality must expose the analytics next step');
assert.ok(dataQuality.includes('to: \'/analytics\''), 'clean data quality action must use the canonical analytics route');

const analytics = fs.readFileSync('src/pages/AnalyticsPage.tsx', 'utf8');
assert.ok(analytics.includes('function AnalyticsStatusStrip'), 'analytics must expose one shared truth/status strip');
assert.ok(analytics.includes('لا يتم تصنيع قيم بديلة'), 'analytics must state the no-fabrication rule');
assert.ok(analytics.includes('تحليل RFM'), 'RFM must expose analysis status context');
assert.ok(analytics.includes('تحليل ABC'), 'ABC must expose analysis status context');
assert.ok(analytics.includes('تحليل أعمار الذمم'), 'aging analysis must expose analysis status context');
assert.ok(analytics.includes('لا توجد شرائح قابلة للاعتماد'), 'RFM empty state must explain the decision boundary');
assert.ok(analytics.includes('لا توجد ذمم قابلة للحساب'), 'aging empty state must route users to a meaningful next action');



assert.ok(!entities.includes('if (loading && products.length === 0) return <LoadingState />;'), 'product actions must remain visible while the list is loading');
assert.ok(!entities.includes('if (loading && customers.length === 0) return <LoadingState />;'), 'customer actions must remain visible while the list is loading');
assert.ok(entities.includes('data={products} loading={loading}'), 'product table must own its loading state');
assert.ok(entities.includes('data={customers} loading={loading}'), 'customer table must own its loading state');

console.log('Product wow UI contract: PASS (public proof theater + deterministic decision brief)');