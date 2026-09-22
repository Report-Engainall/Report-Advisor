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
assert.ok(importSurface.includes('const IMPORT_EVIDENCE_STAGES = ['), 'canonical import must expose the proven import evidence stages');
assert.ok(importSurface.includes('مراحل الاستيراد المثبتة'), 'canonical import save state must expose the actual evidence lifecycle');
assert.ok(importSurface.includes('النتيجة authoritative وصلت'), 'canonical import lifecycle must distinguish authoritative runner completion');
assert.ok(importSurface.includes('الاعتماد النهائي مسجل'), 'canonical import lifecycle must distinguish final import-job recording');
assert.ok(importSurface.includes('لا نعلن «اعتمادًا» من الواجهة وحدها'), 'canonical import must remain fail-closed in its final user-facing lifecycle explanation');
assert.ok(importSurface.includes('لم يُثبت مصدر سابق لهذا الحساب بعد'), 'canonical import history empty state must distinguish an empty history');
assert.ok(importSurface.includes('اختيار مصدر'), 'canonical import history empty state must expose a real source-selection action');
assert.ok(importSurface.includes('onClick={reset}'), 'canonical import history empty state must use the existing reset/import path');
assert.ok(importSurface.includes('const [historyError, setHistoryError]'), 'canonical import history must preserve fetch failures instead of mapping them to an empty list');
assert.ok(importSurface.includes('historyError?<ErrorState'), 'canonical import history must distinguish backend errors from an empty history');
assert.ok(importSurface.includes('onRetry={() => void loadHistory()}'), 'canonical import history errors must retry in place');

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
assert.ok(dashboardSurface.includes('const dashboardNextAction = useMemo'), 'dashboard must derive one next action from current truth and decision state');
const dashboardActionIndex = dashboardSurface.indexOf('const dashboardNextAction = useMemo');
const dashboardLoadingReturnIndex = dashboardSurface.indexOf('if (loading) return <LoadingState');
assert.ok(dashboardActionIndex >= 0 && dashboardActionIndex < dashboardLoadingReturnIndex, 'dashboard next-action hook must remain unconditional before early returns');
assert.ok(dashboardSurface.includes('dashboardNextAction.to'), 'dashboard next action must use its derived canonical route');
assert.ok(dashboardSurface.includes('dashboardNextAction.description'), 'dashboard next action must explain why the action is recommended');

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
assert.ok(reports.includes('const reportReadiness = ['), 'reports center must derive a live readiness map for core report domains');
assert.ok(reports.includes('REPORT READINESS'), 'reports center must expose the live report readiness surface');
assert.ok(reports.includes('أي تقرير يمكن استخدامه الآن؟'), 'reports center readiness must answer the user\'s immediate report-availability question');
assert.ok(reports.includes("kpis.grossProfit !== null && kpis.grossMargin !== null"), 'profitability readiness must require both gross profit and gross margin');
assert.ok(reports.includes("aging.status === 'CALCULATED'"), 'receivables readiness must follow the authoritative aging status');

assert.ok(!reports.includes('generateSynthetic'), 'reports center must not invent business values');
const trustEvidence = fs.readFileSync('src/pages/TrustEvidencePage.tsx', 'utf8');
assert.ok(trustEvidence.includes('const [refreshing, setRefreshing]'), 'trust evidence must refresh in-place instead of reloading the whole page');
assert.ok(trustEvidence.includes("const trustState = snapshot?.status === 'EMPTY'"), 'trust evidence must derive a current decision-eligibility state from the authoritative snapshot');
assert.ok(trustEvidence.includes("label: 'BLOCKED'"), 'critical trust pressure must block decision use instead of showing a generic OK state');
assert.ok(trustEvidence.includes("label: 'REVIEW'"), 'non-critical quality pressure must surface a review state');
assert.ok(trustEvidence.includes("label: 'VERIFIED'"), 'clean quality state must surface an explicit verified state');
assert.ok(trustEvidence.includes('trustState.detail'), 'trust evidence must explain the current decision-eligibility state');
assert.ok(trustEvidence.includes('const qualityScore = Math.max(0, Math.min(100, Number(entity.score) || 0));'), 'trust evidence must normalize each authoritative entity quality score before rendering');
assert.ok(trustEvidence.includes('role="progressbar"'), 'trust evidence must visualize each authoritative quality score as an accessible progress indicator');
assert.ok(trustEvidence.includes('aria-valuenow={qualityScore}'), 'trust evidence quality progress must expose the normalized authoritative score to assistive technology');
assert.ok(trustEvidence.includes('style={{ width: `${qualityScore}%` }}'), 'trust evidence quality visualization must use the same normalized score as its accessible value');
assert.ok(trustEvidence.includes("to={(entity.issues ?? 0) > 0 ? '/data-quality' : '/import/analyze'}"), 'trust evidence must expose a real entity-level next action from authoritative issue pressure');
assert.ok(trustEvidence.includes("'راجع الجودة'"), 'entities with issues must expose the canonical data-quality review action');
assert.ok(trustEvidence.includes("'افحص المصدر'"), 'clean entities must expose the canonical evidence-source inspection action');
assert.ok(!trustEvidence.includes('window.location.reload()'), 'trust evidence refresh must not discard page context with a full reload');
assert.ok(trustEvidence.includes('لا توجد بيانات مثبتة بعد'), 'empty trust state must explain the absence of evidence');
assert.ok(trustEvidence.includes('RECORDS CHECKED'), 'trust evidence must expose the source record count');
assert.ok(trustEvidence.includes('criticalIssueTotal'), 'trust evidence must expose critical issue pressure from the authoritative snapshot');
assert.ok(trustEvidence.includes('const weightedQualityScore = useMemo(() =>'), 'trust evidence must derive an aggregate entity-quality summary from the authoritative snapshot');
assert.ok(trustEvidence.includes('متوسط موزون بعدد السجلات'), 'trust evidence aggregate quality must disclose its record-weighted basis');
assert.ok(trustEvidence.includes('ليس درجة ثقة مستقلة'), 'trust evidence aggregate quality must not be presented as an invented trust score');
const commandCenterSurface = fs.readFileSync('src/pages/ExecutiveCommandCenterPage.tsx', 'utf8');
assert.ok(commandCenterSurface.includes('const decisionCoverage = useMemo(() =>'), 'command center must derive decision coverage from current recommendations');
assert.ok(commandCenterSurface.includes('setAlerts(openAlerts)'), 'command center summary counts must retain the full fetched open-alert set');
assert.ok(commandCenterSurface.includes('setRecommendations(actionableRecommendations)'), 'command center decision coverage must retain the full fetched actionable recommendation set');
assert.ok(commandCenterSurface.includes('alerts.slice(0, 5).map'), 'command center must cap only the rendered alert list, not its summary count');
assert.ok(commandCenterSurface.includes('recommendations.slice(0, 5).map'), 'command center must cap only the rendered recommendation list, not decision coverage');
assert.ok(commandCenterSurface.includes("coverageScope: 'كل التوصيات القابلة للمتابعة المسترجعة (حتى 100)'"), 'command center decision coverage must disclose its fetched scope');
assert.ok(commandCenterSurface.includes('ownerCoverage'), 'decision coverage must expose owner coverage from actual recommendation ownership');
assert.ok(commandCenterSurface.includes('outcomeCoverage'), 'decision coverage must expose recorded outcome coverage from actual recommendation results');
assert.ok(commandCenterSurface.includes("kpis.status === 'CONFIRMED' ? 'الحقيقة مؤكدة' : 'محسوبة من البيانات'"), 'command center must distinguish confirmed truth from calculated truth');
assert.ok(commandCenterSurface.includes('Decision Coverage'), 'command center must expose decision coverage as a product surface');
assert.ok(commandCenterSurface.includes('Business Replay'), 'command center must retain the replay capability surface');
assert.ok(commandCenterSurface.includes('فحص مسار الدليل'), 'unavailable replay must expose an evidence-first next action');
assert.ok(commandCenterSurface.includes('إعادة التشغيل تحتاج snapshots وoutcomes تاريخية مثبتة'), 'replay gap must disclose its real evidence prerequisite');

assert.ok(!commandCenterSurface.includes('Decision ROI'), 'command center must not imply ROI when no ROI ledger is available');

const workCenterSurface = fs.readFileSync('src/pages/WorkCenterPage.tsx', 'utf8');
assert.ok(workCenterSurface.includes("key: 'reason'"), 'work center rows must expose the persisted operational reason/limit');
assert.ok(workCenterSurface.includes('r.error_message?.trim()'), 'work center must prefer the authoritative stored error message');
assert.ok(workCenterSurface.includes('العملية اكتملت جزئيًا'), 'partial operations must disclose their bounded result state');

const importHistoryQueries = fs.readFileSync('src/lib/queries.ts', 'utf8');
assert.ok(importHistoryQueries.includes('semantic_understanding_confidence: understandingConfidence'), 'import history query must map persisted source-understanding confidence');
assert.ok(importHistoryQueries.includes('snapshot_id: snapshotId'), 'import history query must map persisted evidence snapshot identity');
const canonicalImportSurface = fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');
assert.ok(canonicalImportSurface.includes('sourceHash: durableSourceHash'), 'canonical import result must retain the authoritative server source hash');
assert.ok(canonicalImportSurface.includes('total: authoritativeRowCount'), 'canonical import completion must use the authoritative server row count');
assert.ok(canonicalImportSurface.includes('تم الاعتماد من المسار السلطوي'), 'canonical import completion must explicitly identify authoritative completion');
assert.ok(canonicalImportSurface.includes('SERVER SOURCE HASH'), 'canonical import completion must expose the authoritative source fingerprint');
assert.ok(canonicalImportSurface.includes('لا تعتمد النتيجة على صفوف أرسلها المتصفح كحقيقة'), 'canonical import completion must disclose the server-authoritative boundary');
assert.ok(canonicalImportSurface.includes('ثقة الفهم'), 'canonical import history must expose persisted source-understanding confidence');
assert.ok(canonicalImportSurface.includes('لقطة الدليل'), 'canonical import history must expose whether an evidence snapshot was persisted');
assert.ok(canonicalImportSurface.includes('غير مثبتة'), 'canonical import history must fail closed when no evidence snapshot exists');
assert.ok(trustEvidence.includes('const evidencePressure = useMemo(() =>'), 'trust evidence must derive evidence pressure from the authoritative issue snapshot');
assert.ok(trustEvidence.includes('ضغط الأدلة الحالي'), 'trust evidence must expose the current evidence-pressure surface');
assert.ok(trustEvidence.includes('فتح مراجعة الجودة'), 'evidence pressure items must route to the canonical data-quality review path');
assert.ok(trustEvidence.includes('لا توجد مشكلات مسجلة في لقطة الجودة الحالية'), 'clean evidence pressure must remain explicitly evidence-derived and fail-closed');
assert.ok(trustEvidence.includes('QUALITY COVERAGE'), 'trust evidence must expose aggregate quality coverage in the decision surface');
assert.ok(trustEvidence.includes('role="progressbar"'), 'trust evidence aggregate quality visualization must remain accessible');
assert.ok(trustEvidence.includes('أغلق المشكلات الحرجة'), 'trust evidence must route critical data-quality pressure to an actionable next step');
assert.ok(trustEvidence.includes("aria-label={'الخطوة التالية: ' + nextStep.label}"), 'trust evidence next-action link must use valid JSX');
assert.ok(!trustEvidence.includes('aria-label={\\`'), 'trust evidence contract must reject escaped JSX template backticks');
const decisionExperience = fs.readFileSync('src/pages/DecisionExperiencePage.tsx', 'utf8');
assert.ok(decisionExperience.includes('recommendation.expected_impact == null'), 'decision readiness must treat zero expected impact as a valid value');
assert.ok(!decisionExperience.includes('if (!recommendation.expected_impact)'), 'decision readiness must not classify zero expected impact as missing');
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
assert.ok(workCenter.includes('const nextAction = (workerHealth?.expiredActive ?? 0) > 0'), 'work center must derive one next action from the live worker/queue state');
assert.ok(workCenter.includes('إعادة فحص العامل الآن'), 'expired worker leases must surface an explicit recheck action');
assert.ok(workCenter.includes('عرض المراجعة'), 'review pressure must surface a direct filter action');
assert.ok(workCenter.includes('عرض الفشل'), 'failed operations must surface a direct filter action');
assert.ok(workCenter.includes('إدخال مصدر جديد'), 'stable queue state must expose the canonical import action');
assert.ok(workCenter.includes('historyWindowNotice'), 'work center must disclose when the import history is bounded to the current window');
assert.ok(workCenter.includes('أحدث 500'), 'work center must not label a bounded 500-row window as a full historical total');
assert.ok(workCenter.includes('aria-pressed={filter === k}'), 'work center filters must expose selected state to assistive technology');
assert.ok(workCenter.includes('aria-live="polite"'), 'work center next-action messaging must be announced without interrupting the user');

const executiveCommand = fs.readFileSync('src/pages/ExecutiveCommandCenterPage.tsx', 'utf8');
assert.ok(executiveCommand.includes('بيانات الذمم متاحة'), 'money recovery must describe receivables availability without claiming recoverable money');
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

assert.ok(dataQuality.includes('const weightedRows = snapshot.entities.reduce'), 'data quality overall score must use record-weighted authoritative entity scores');
assert.ok(dataQuality.includes('const weightedScore = weightedRows > 0 ?'), 'data quality overall score must derive from the same weighted score basis as trust evidence');
assert.ok(dataQuality.includes('setOverallScore(weightedScore == null ? 0 : Math.round(weightedScore))'), 'data quality must fail closed to zero when no weighted rows exist');

assert.ok(connections.includes("id === 'documents' ? '/import' : '/trust'"), 'document connector must route into the unified import path rather than a disconnected connector workflow');
assert.ok(connections.includes("id === 'documents' ? (ar ? 'ابدأ الاستيراد الموحد' : 'Start unified import')"), 'document connector CTA must explicitly expose the unified import path');

const connections = fs.readFileSync('src/pages/ConnectionsPage.tsx', 'utf8');
assert.ok(connections.includes('const availableCount = connectors.filter(connector => connector.state === \'available\').length'), 'connections summary must derive proven-path count from connector state');
assert.ok(connections.includes('const boundedCount = connectors.filter(connector => connector.state === \'bounded\').length'), 'connections summary must derive bounded-path count from connector state');
assert.ok(connections.includes('const adapterCount = connectors.filter(connector => connector.state === \'adapter\').length'), 'connections summary must derive adapter-path count from connector state');
assert.ok(connections.includes('{availableCount}'), 'connections summary must render the live proven-path count');
assert.ok(connections.includes('{boundedCount}'), 'connections summary must render the live bounded-path count');
assert.ok(connections.includes('{adapterCount}'), 'connections summary must render the live adapter-path count');
assert.ok(connections.includes('{nextLabel}'), 'connections summary must derive the next action from the available connector state');

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

const onboarding = fs.readFileSync('src/pages/OnboardingPage.tsx', 'utf8');
for (const token of [
  'من المصدر إلى الحقيقة',
  'من الحقيقة إلى القرار',
  'من القرار إلى المخرج',
  'الدليل قبل الثقة',
  'ابدأ الاستيراد',
  'افتح مسار القرار',
  'استكشف التقارير',
  'افحص الدليل',
]) assert.ok(onboarding.includes(token), `onboarding value journey missing: ${token}`);
assert.ok(onboarding.includes("href: '/import'"), 'onboarding value journey must use the canonical unified import route');
assert.ok(onboarding.includes("href: '/decision-experience'"), 'onboarding value journey must use the canonical decision route');
assert.ok(onboarding.includes("href: '/reports'"), 'onboarding value journey must use the canonical reports route');
assert.ok(onboarding.includes("href: '/trust'"), 'onboarding value journey must use the canonical trust/evidence route');

const decision = fs.readFileSync('src/pages/DecisionExperiencePage.tsx', 'utf8');
for (const token of ['قيمة القرار الحالية', 'الإشارات', 'مرشحات القرار', 'الأثر المتوقع المتاح', 'مجموع الآثار المتوقعة المسجلة؛ ليس نتيجة فعلية.']) {
  assert.ok(decision.includes(token), `decision value surface missing: ${token}`);
}
const executiveReport = fs.readFileSync('src/pages/ExecutiveReportPage.tsx', 'utf8');
assert.ok(executiveReport.includes('المصدر: اللقطة المعتمدة'), 'executive report must use an unambiguous source label');
assert.ok(!executiveReport.includes('المصدر: بيانات قانونية'), 'executive report must not expose the ambiguous legal-data label');
const trustEvidence = fs.readFileSync('src/pages/TrustEvidencePage.tsx', 'utf8');
assert.ok(trustEvidence.includes('مسارات الإثبات المتاحة'), 'trust surface must expose available evidence-path coverage');
assert.ok(trustEvidence.includes('غير المثبتة'), 'trust surface must expose unverified evidence-path count');
const dashboard = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
assert.ok(dashboard.includes('مؤشرات مثبتة'), 'dashboard must expose confirmed evidence basis');
assert.ok(dashboard.includes('مؤشرات محسوبة'), 'dashboard must expose calculated evidence basis');
assert.ok(dashboard.includes('غير متاحة'), 'dashboard must expose unavailable evidence basis');
const executiveReport = fs.readFileSync('src/pages/ExecutiveReportPage.tsx', 'utf8');
assert.ok(executiveReport.includes('مساءلة القرار'), 'executive report must expose decision accountability');
assert.ok(executiveReport.includes('تغطية المسؤولية'), 'executive report must expose owner coverage');
assert.ok(executiveReport.includes('نتائج مسجلة'), 'executive report must distinguish recorded outcomes');
assert.ok(executiveReport.includes("const activeRecommendations = recommendations.filter"), 'executive report accountability must scope metrics to active decisions');

console.log('Product wow UI contract: PASS (public proof theater + deterministic decision brief)');