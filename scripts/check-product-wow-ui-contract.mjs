import assert from 'node:assert/strict';
import fs from 'node:fs';

const login = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');
const dashboard = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
const entities = fs.readFileSync('src/pages/EntityPages.tsx', 'utf8');
const dataTable = fs.readFileSync('src/components/ui/DataTable.tsx', 'utf8');
assert.ok(dataTable.includes('role="status" aria-live="polite" aria-busy="true"'), 'shared table loading state must expose assistive status semantics');
assert.ok(dataTable.includes('role="status" aria-live="polite"'), 'shared table empty state must expose assistive status semantics');
assert.ok(dataTable.includes('scope="col"'), 'shared table headers must declare column scope');
assert.ok(dataTable.includes('aria-rowcount={visibleRows.length + 1}') && dataTable.includes('aria-colcount={columns.length}'), 'shared table must expose row and column counts');
assert.ok(dataTable.includes('role="navigation" aria-label="تنقّل الجدول"'), 'shared table pagination must expose navigation semantics');

const queries = fs.readFileSync('src/lib/queries.ts', 'utf8');
assert.ok(queries.includes('function validateReceivablesRows(rows: unknown[]): ReceivablesReportRow[]'), 'receivables rows must be validated before presentation');
assert.ok(queries.includes('RECEIVABLES_DATA_INVALID: total_rows is invalid'), 'receivables totals must fail closed');
assert.ok(!queries.includes('total_rows:Number(p.total_rows??0)'), 'receivables must not coerce missing totals to zero');

assert.ok(queries.includes('function validateForecastRows(rows: unknown[]): Forecast[]'), 'forecast reads must validate row semantics');
assert.ok(queries.includes('FORECAST_DATA_INVALID: row[' + index + '] bounds are inverted'), 'forecast bounds must fail closed when inverted');

assert.ok(queries.includes('WORKER_HEALTH_COUNT_UNAVAILABLE'), 'worker health must fail closed when exact counts are unavailable');
const workCenter = fs.readFileSync('src/pages/WorkCenterPage.tsx', 'utf8');
assert.ok(workCenter.includes('const zeroProgressActive = useMemo'), 'work center must expose an explicit zero-progress active signal');
assert.ok(workCenter.includes('تحقق من العمليات دون تقدم'), 'work center must route zero-progress work to a visible next action');
assert.ok(workCenter.includes('نشطة بلا تقدم'), 'work center must expose zero-progress active count in the decision summary');
assert.ok(workCenter.includes('بدون تقدم'), 'work center active rows must distinguish zero-progress processing from ordinary active work');
assert.ok(workCenter.includes('role="progressbar"'), 'work center progress must expose a semantic progressbar');
assert.ok(workCenter.includes('aria-valuenow={Math.max(0, Math.min(100, r.progress))}'), 'work center progress must expose the numeric progress value');

const assistant = fs.readFileSync('src/components/DeterministicIntelligenceAssistant.tsx', 'utf8');
assert.ok(assistant.includes("type AssistantMode = 'LOADING' | 'READY' | 'INSUFFICIENT_DATA' | 'ERROR'"), 'assistant must distinguish loading from ready state');
assert.ok(assistant.includes("mode === 'LOADING'"), 'assistant must expose loading semantics while context is fetched');
assert.ok(assistant.includes('إعادة تحميل سياق المؤشرات'), 'assistant must expose explicit recovery when the canonical snapshot is unavailable');

const header = fs.readFileSync('src/components/Header.tsx', 'utf8');
assert.ok(header.includes("type HealthState = 'checking' | 'healthy' | 'degraded' | 'tenant-missing' | 'offline'"), 'header health must distinguish missing tenant context');
assert.ok(header.includes("health === 'tenant-missing' ? 'سياق الشركة غير مثبت'"), 'header must explain missing tenant context explicitly');
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
const dashboardCanonical = fs.readFileSync('src/lib/dashboard-canonical.ts', 'utf8');
for (const token of [
  'function validateDashboardIntelligence(row: Record<string, unknown>)',
  "REPORT_DATA_INVALID: intelligence.recommendations[' + index + '] shape is invalid",
  "REPORT_DATA_INVALID: intelligence.alerts[' + index + '] shape is invalid",
]) assert.ok(dashboardCanonical.includes(token), `dashboard intelligence contract missing: ${token}`);
const demandTruth = fs.readFileSync('src/lib/free-toolbox/sales-demand-series.ts', 'utf8');
assert.ok(demandTruth.includes("if (!Number.isInteger(days) || days < 1 || days > 3650)"), 'demand analysis must use a bounded integer day window');
const groupedInventory = fs.readFileSync('src/lib/free-toolbox/grouped-report.ts', 'utf8');
assert.ok(groupedInventory.includes('const missing=new Map<string,{stock:boolean;requested:boolean;sales:boolean;demand:boolean}>()'), 'grouped inventory must preserve missing stock state');
assert.ok(groupedInventory.includes('x.stockUnits+=r.stockUnits'), 'grouped inventory must not clamp signed stock quantities to zero');
const inventoryTruth = fs.readFileSync('src/lib/free-toolbox/inventory-intelligence-canonical.ts', 'utf8');
assert.ok(inventoryTruth.includes('INVENTORY_DATA_INVALID: inventory balance quantity is invalid'), 'inventory intelligence must fail closed on invalid balances');
assert.ok(inventoryTruth.includes('INVENTORY_DATA_INVALID: inventory balance references a missing product'), 'inventory intelligence must surface orphaned balance rows');
const importSurface = fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');
assert.ok(importSurface.includes('لم يُثبت مصدر سابق لهذا الحساب بعد'), 'canonical import history empty state must distinguish an empty history');
assert.ok(importSurface.includes('اختيار مصدر'), 'canonical import history empty state must expose a real source-selection action');
assert.ok(importSurface.includes('SOURCE PASSPORT'), 'canonical import must expose the source passport before approval');
assert.ok(importSurface.includes('SHA-256 للمصدر'), 'source passport must expose source fingerprint context');
assert.ok(importSurface.includes('جودة الخادم') && importSurface.includes('العملية'), 'canonical import success state must expose authoritative commit context');


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

const truthStrip = fs.readFileSync('src/components/TruthContextStrip.tsx', 'utf8');
assert.ok(truthStrip.includes('الاستخدام: صالح للقرار') && truthStrip.includes('الاستخدام: راجع الدليل أولًا'), 'shared truth strip must disclose decision-use state');
const analytics = fs.readFileSync('src/pages/AnalyticsPage.tsx', 'utf8');
assert.ok(analytics.includes('افحص الدليل ثم القرار'), 'analytics must gate calculated results behind evidence review');
assert.ok(!analytics.includes('انقل النتيجة إلى القرار'), 'analytics must not route calculated results directly to decision without evidence review');
const receivablesReport = fs.readFileSync('src/pages/ReceivablesReportCanonicalPage.tsx', 'utf8');
assert.ok(receivablesReport.includes("const truthStatus = snapshot.status === 'CALCULATED' ? 'CALCULATED' : 'INSUFFICIENT DATA';"), 'receivables report must not elevate calculated truth to verified');
const profitabilityReport = fs.readFileSync('src/pages/ProfitabilityReportCanonicalPage.tsx', 'utf8');
assert.ok(profitabilityReport.includes("snapshot.currency_status === 'CONSISTENT'"), 'profitability display must require consistent currency');
const executiveReport = fs.readFileSync('src/pages/ExecutiveReportPage.tsx', 'utf8');
assert.ok(executiveReport.includes('qualityIssues={qualityIssueTotal}'), 'executive report must bind quality truth into shared context');
assert.ok(executiveReport.includes("kpis?.status === 'CALCULATED'"), 'executive report must route calculated truth through evidence review');
assert.ok(executiveReport.includes('qualityIssueTotal === null || qualityIssueTotal > 0'), 'executive report next action must prioritize unresolved quality pressure');

assert.ok(!executiveReport.includes("kpis?.status !== 'CALCULATED' || kpis?.status === 'INSUFFICIENT_DATA'"), 'executive report must not misroute confirmed truth to data quality');
const commandCenter = fs.readFileSync('src/pages/ExecutiveCommandCenterPage.tsx', 'utf8');
assert.ok(commandCenter.includes('qualityIssues={qualityIssueTotal}'), 'command center must bind quality truth into shared context');
assert.ok(commandCenter.includes('مؤكد ويمكن استخدامه') && commandCenter.includes('محسوب — راجع الدليل'), 'command center must distinguish confirmed from calculated decision-use state');
const dashboardSurface = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
assert.ok(dashboardSurface.includes('const emptyAnalysisAction'), 'dashboard empty analysis states must derive a real next action');
assert.ok(dashboardSurface.includes('الصورة مؤكدة المصدر') && dashboardSurface.includes('الصورة محسوبة من المصدر'), 'dashboard must distinguish confirmed from calculated source truth');

assert.ok(dashboardSurface.includes('تبقى الحالة غير مثبتة'), 'dashboard trend empty state must remain fail-closed');
assert.ok(dashboardSurface.includes('لا يتم تصنيع تركيب للفئات'), 'dashboard category empty state must not fabricate composition');
assert.ok(dashboardSurface.includes('مراجعة جودة البيانات'), 'dashboard customer/product empties must route to data quality');
assert.ok(dashboardSurface.includes("to: '/data-quality'"), 'dashboard must use the canonical data-quality route for insufficient truth');
assert.ok(dashboardSurface.includes('const dashboardNextAction = useMemo'), 'dashboard must derive one next action from current truth and decision state');
assert.ok(dashboardSurface.includes('qualityIssueTotal === null || qualityIssueTotal > 0'), 'dashboard next action must prioritize unresolved source-quality pressure');

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
assert.ok(reports.includes("const reportEvidenceState = kpis.status === 'CONFIRMED' && qualityIssueTotal === 0 ? 'VERIFIED' : 'REVIEW';"), 'reports center must not elevate CALCULATED truth to VERIFIED');
assert.ok(reports.includes("aging.every((bucket)=>bucket.amount!==null)"), 'receivables report totals must remain unavailable when an aging component is unknown');
assert.ok(reports.includes("const salesBlocked=kpis.status==='INSUFFICIENT_DATA'"), 'sales report must expose an explicit blocked export state');
assert.ok(reports.includes('disabled={salesBlocked}'), 'sales export must be disabled when source truth is incomplete');
assert.ok(reports.includes('لا توجد صورة مبيعات مكتملة'), 'sales report must expose the next quality action when blocked');

assert.ok(!reports.includes("(b.amount??0)"), 'receivables report must not coerce missing aging amounts to zero');


assert.ok(!reports.includes('generateSynthetic'), 'reports center must not invent business values');
assert.ok(!reports.slice(reports.indexOf('if (loading)'), reports.indexOf('if (error)')).includes('reportEvidenceState'), 'reports loading state must not reference loaded snapshot evidence state');
assert.ok(!reports.slice(reports.indexOf('if (loading)'), reports.indexOf('if (error)')).includes('qualityIssueTotal'), 'reports loading state must not reference loaded snapshot quality counters');
assert.ok(reports.includes('ag-report-truth-bar'), 'reports center must expose a shared evidence hierarchy surface');

const trustEvidence = fs.readFileSync('src/pages/TrustEvidencePage.tsx', 'utf8');
assert.ok(trustEvidence.includes('EVIDENCE PASSPORT'), 'trust evidence must expose the evidence passport');
assert.ok(trustEvidence.includes('جواز الدليل للحالة الحالية'), 'trust evidence passport must explain its purpose');
assert.ok(trustEvidence.includes('معرّف شركة موجود دون عرضه للمستخدم'), 'trust evidence passport must preserve tenant context without exposing the raw tenant id');

assert.ok(trustEvidence.includes('const [refreshing, setRefreshing]'), 'trust evidence must refresh in-place instead of reloading the whole page');
assert.ok(!trustEvidence.includes('window.location.reload()'), 'trust evidence refresh must not discard page context with a full reload');
assert.ok(trustEvidence.includes('لا توجد بيانات مثبتة بعد'), 'empty trust state must explain the absence of evidence');
assert.ok(trustEvidence.includes('RECORDS CHECKED'), 'trust evidence must expose the source record count');
assert.ok(trustEvidence.includes('criticalIssueTotal'), 'trust evidence must expose critical issue pressure from the authoritative snapshot');
assert.ok(trustEvidence.includes('أغلق المشكلات الحرجة'), 'trust evidence must route critical data-quality pressure to an actionable next step');
assert.ok(trustEvidence.includes("aria-label={'الخطوة التالية: ' + nextStep.label}"), 'trust evidence next-action link must use valid JSX');
assert.ok(!trustEvidence.includes('aria-label={\\`'), 'trust evidence contract must reject escaped JSX template backticks');
const decisionExperience = fs.readFileSync('src/pages/DecisionExperiencePage.tsx', 'utf8');
assert.ok(decisionExperience.includes("['rejected', 'cancelled', 'completed'].includes(recommendation.status)"), 'decision readiness must block terminal recommendation states');
assert.ok(decisionExperience.includes("if (!recommendation.confidence?.trim())"), 'decision readiness must require explicit confidence');
assert.ok(decisionExperience.includes('data-state={readiness.status.toLowerCase()}'), 'decision evidence card state must mirror the typed readiness status');

assert.ok(decisionExperience.includes('recommendation.expected_impact == null'), 'decision readiness must treat zero expected impact as a valid value');
assert.ok(!decisionExperience.includes('if (!recommendation.expected_impact)'), 'decision readiness must not classify zero expected impact as missing');
assert.ok(decisionExperience.includes('فحص الثقة'), 'decision experience must provide a trust action when no active alerts exist');
assert.ok(decisionExperience.includes('إضافة مصدر'), 'decision experience must provide a canonical import action when no recommendations exist');
assert.ok(decisionExperience.includes('<Link to="/import"'), 'decision experience recommendation-empty state must use the unified import route');
assert.ok(decisionExperience.includes('العودة إلى الإشارات'), 'decision evidence empty-selection state must provide a return action');
assert.ok(decisionExperience.includes('<Link to="/trust"'), 'decision alerts must route source inspection to the trust/evidence surface');

const reportsSurface = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
assert.ok(reportsSurface.includes('setSnapshot(snap)'), 'purchases report must read the canonical dashboard snapshot alongside purchase rows');
assert.ok(reportsSurface.includes("status={snapshot?.kpis.status ?? (summary.total == null ? 'INSUFFICIENT_DATA' : 'CALCULATED')}"), 'purchases report must preserve fail-closed truth status');
assert.ok(reportsSurface.includes('المشتريات تعرض أرقامها من سجلات الشراء'), 'purchases report must expose its evidence context to the user');

assert.ok(reportsSurface.includes('function ReportTruthBar'), 'reports must expose one shared truth-context bar across decision-report surfaces');
assert.ok(reportsSurface.includes('سياق حقيقة التقرير'), 'report truth context must be accessible and explicit');
assert.ok(reportsSurface.includes('القيم غير المتاحة تبقى غير متاحة'), 'report truth context must preserve fail-closed numeric semantics');

const canonicalImport = fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');
assert.ok(canonicalImport.includes('role="list" aria-label="مراحل الاستيراد"'), 'canonical import stepper must expose a semantic list boundary');
assert.ok(canonicalImport.includes('aria-current={active ? \'step\' : undefined}'), 'canonical import must expose the active step to assistive technology');

const commandPalette = fs.readFileSync('src/components/CommandPalette.tsx', 'utf8');
assert.ok(appShell.includes('mobileSidebarRef'), 'mobile navigation drawer must expose a focus boundary');
assert.ok(appShell.includes('aria-modal="true" aria-label="القائمة الرئيسية"'), 'mobile navigation drawer must declare modal semantics');
assert.ok(appShell.includes("event.key === 'Tab'"), 'mobile navigation drawer must trap keyboard focus');
assert.ok(appShell.includes('document.body.style.overflow = \'hidden\''), 'mobile navigation drawer must lock background scroll');

const header = fs.readFileSync('src/components/Header.tsx', 'utf8');
assert.ok(header.includes('alertPanelRef'), 'alert drawer must expose a dialog focus boundary');
assert.ok(header.includes("event.key === 'Tab'"), 'alert drawer must trap keyboard focus while open');
assert.ok(header.includes('aria-label="إغلاق التنبيهات"'), 'alert drawer must expose an accessible close control');
assert.ok(header.includes('document.body.style.overflow = \'hidden\''), 'alert drawer must lock background scroll while open');

const advisorSurface = fs.readFileSync('src/App.tsx', 'utf8');
assert.ok(advisorSurface.includes('advisorPanelRef'), 'global Advisor must expose a focus boundary');
assert.ok(advisorSurface.includes('advisorRestoreFocusRef'), 'global Advisor must restore focus to its trigger');
assert.ok(advisorSurface.includes('role="dialog" aria-modal="true"'), 'global Advisor must declare modal dialog semantics');
assert.ok(advisorSurface.includes('aria-labelledby="ag-global-advisor-title"'), 'global Advisor must have an accessible title binding');
assert.ok(advisorSurface.includes('aria-label="إغلاق المستشار"'), 'global Advisor must expose an accessible close control');
assert.ok(advisorSurface.includes("event.key === 'Escape'"), 'global Advisor must close on Escape');
assert.ok(advisorSurface.includes("event.key === 'Tab'"), 'global Advisor must trap keyboard focus');
assert.ok(advisorSurface.includes('document.body.style.overflow = \'hidden\''), 'global Advisor must lock background scroll while open');

assert.ok(commandPalette.includes('restoreFocusRef'), 'command palette must restore focus to its opener');
assert.ok(commandPalette.includes('document.body.style.overflow = \'hidden\''), 'command palette must lock background scroll while open');
assert.ok(commandPalette.includes("event.key === 'Tab'"), 'command palette must trap keyboard focus inside the dialog');
assert.ok(commandPalette.includes('aria-label="إغلاق لوحة الأوامر"'), 'command palette must expose a keyboard-accessible close control');

const inventoryIntelligence = fs.readFileSync('src/pages/InventoryIntelligencePage.tsx', 'utf8');
assert.ok(inventoryIntelligence.includes('سياق حقيقة ذكاء المخزون'), 'inventory intelligence must expose truth context');
assert.ok(inventoryIntelligence.includes('آخر 180 يومًا'), 'inventory intelligence truth context must disclose its fixed demand window');
assert.ok(inventoryIntelligence.includes('to="/trust"'), 'inventory intelligence must expose a direct evidence action');
assert.ok(inventoryIntelligence.includes('const nextAction='), 'inventory intelligence must derive a next action from current truth');
assert.ok(inventoryIntelligence.includes('to={nextAction.to}'), 'inventory intelligence empty state must use the derived next action');
assert.ok(inventoryIntelligence.includes('لا تُصنع قيم بديلة'), 'inventory intelligence must preserve fail-closed semantics');

const demandVelocity = fs.readFileSync('src/pages/DemandVelocityPage.tsx', 'utf8');
assert.ok(demandVelocity.includes('سياق حقيقة حركة الطلب'), 'demand velocity must expose truth context');
assert.ok(demandVelocity.includes('فواتير المبيعات وبنودها'), 'demand velocity must disclose its source tables');
assert.ok(demandVelocity.includes('to="/trust"'), 'demand velocity must expose a direct evidence action');
assert.ok(demandVelocity.includes('const nextAction='), 'demand velocity must derive a next action from current signal state');
assert.ok(demandVelocity.includes('to={nextAction.to}'), 'demand velocity empty state must use the derived next action');
assert.ok(demandVelocity.includes('لا تُستبدل القيم الناقصة'), 'demand velocity must preserve fail-closed semantics');

const companySettings = fs.readFileSync('src/pages/CompanySettingsPage.tsx', 'utf8');
assert.ok(companySettings.includes('aria-pressed={preferences.preset === option.id}'), 'company presets must expose selected state');
assert.ok(companySettings.includes('aria-pressed={preferences.mode === mode}'), 'workspace modes must expose selected state');
assert.ok(companySettings.includes('aria-label="الصفحة الافتراضية بعد تسجيل الدخول"'), 'default landing select must have an explicit accessible label');
assert.ok(companySettings.includes('min-h-11 min-w-11'), 'settings reorder controls must meet touch-target sizing');
assert.ok(companySettings.includes("aria-label={'تحريك '"), 'settings reorder controls must identify the affected section');

const profileSettings = fs.readFileSync('src/pages/ProfileSettingsPage.tsx', 'utf8');
assert.ok(profileSettings.includes('<LoadingState message="جارٍ تحميل بيانات الحساب..." />'), 'profile settings must use the shared loading state');
assert.ok(profileSettings.includes('aria-busy={saving}'), 'profile save action must expose busy state');
assert.ok(profileSettings.includes('role="status" aria-live="polite"'), 'profile success state must be announced');
assert.ok(profileSettings.includes('role="alert" aria-live="assertive"'), 'profile error state must be announced');
assert.ok(profileSettings.includes('min-h-11 w-full max-w-xl'), 'profile input must meet touch sizing');

const masterDataHub = fs.readFileSync('src/pages/MasterDataHubPage.tsx', 'utf8');
assert.ok(masterDataHub.includes('to="/trust"'), 'master data hub must expose a direct evidence path');
assert.ok(masterDataHub.includes('to="/import"'), 'master data hub must expose the unified import path');
assert.ok(masterDataHub.includes('لا تُعرض كيانات غير مثبتة'), 'master data hub must preserve fail-closed reference semantics');
assert.ok(masterDataHub.includes('min-h-11'), 'master data actions must meet touch-target sizing');

const executiveReport = fs.readFileSync('src/pages/ExecutiveReportPage.tsx', 'utf8');
assert.ok(executiveReport.includes('<LoadingState message="جارٍ بناء التقرير التنفيذي من المصادر المعتمدة..." />'), 'executive report must use the shared loading state');
assert.ok(executiveReport.includes('<ErrorState message={error} onRetry={() => void load()} />'), 'executive report must use the shared error state with retry');
assert.ok(executiveReport.includes('const nextAction ='), 'executive report must derive a governed next action');
assert.ok(executiveReport.includes('NEXT ACTION'), 'executive report must expose the next action visibly');
assert.ok(executiveReport.includes('to={nextAction.to}'), 'executive report next action must use a canonical route');
assert.ok(executiveReport.includes('لا تُنتج توصية بديلة'), 'executive report recommendation empty state must remain fail-closed');
assert.ok(executiveReport.includes('لا يتم تصنيع تنبيه'), 'executive report alert empty state must remain fail-closed');

const scenarioGuard = fs.readFileSync('src/pages/ScenarioTruthGuardPage.tsx', 'utf8');
assert.ok(scenarioGuard.includes('const load = useCallback(async () =>'), 'scenario truth gate must expose a reusable refresh path');
assert.ok(scenarioGuard.includes('إعادة فحص الحقيقة المالية'), 'scenario truth gate must expose an explicit retry action');
assert.ok(scenarioGuard.includes('min-h-11'), 'scenario truth retry/action controls must meet touch-target sizing');
assert.ok(scenarioGuard.includes('setState(\'blocked\')'), 'scenario truth gate must remain fail-closed after unavailable truth');

const onboarding = fs.readFileSync('src/pages/OnboardingPage.tsx', 'utf8');
assert.ok(onboarding.includes('role="list" aria-label="خطوات التجهيز"'), 'onboarding steps must expose a semantic list');
assert.ok(onboarding.includes('role="listitem"'), 'onboarding steps must expose list-item semantics');
assert.ok(onboarding.includes('role="status" aria-label={badge.text}'), 'onboarding states must be announced');
assert.ok(onboarding.includes('min-h-11 items-center'), 'onboarding route actions must meet touch-target sizing');

const proposalDemo = fs.readFileSync('src/pages/ProposalDemoPage.tsx', 'utf8');
assert.ok(proposalDemo.includes('proposal-demo-title'), 'proposal demo title field must remain addressable');
assert.ok(proposalDemo.includes('proposal-demo-client'), 'proposal demo client field must remain addressable');
assert.ok(proposalDemo.includes('proposal-demo-requirements'), 'proposal demo requirements field must remain addressable');
assert.ok(proposalDemo.includes('min-h-11'), 'proposal demo primary controls must meet touch-target sizing');

const metricInspector = fs.readFileSync('src/pages/MetricInspectorPage.tsx', 'utf8');
assert.ok(metricInspector.includes('const filteredItems = useMemo'), 'metric inspector must derive a filtered semantic list without mutating the source contract');
assert.ok(metricInspector.includes('aria-label="البحث في المؤشرات"'), 'metric inspector search must be accessible');
assert.ok(metricInspector.includes('statusFilter') && metricInspector.includes('freshnessFilter'), 'metric inspector must expose governance and freshness filters');
assert.ok(metricInspector.includes('إعادة ضبط التصفية'), 'metric inspector filtering must expose a reset action');

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

const connections = fs.readFileSync('src/pages/ConnectionsPage.tsx', 'utf8');
assert.ok(connections.includes('const availableCount = connectors.filter(connector => connector.state === \'available\').length'), 'connections summary must derive proven-path count from connector state');
assert.ok(connections.includes('const boundedCount = connectors.filter(connector => connector.state === \'bounded\').length'), 'connections summary must derive bounded-path count from connector state');
assert.ok(connections.includes('const adapterCount = connectors.filter(connector => connector.state === \'adapter\').length'), 'connections summary must derive adapter-path count from connector state');
assert.ok(connections.includes('{availableCount}'), 'connections summary must render the live proven-path count');
assert.ok(connections.includes('{boundedCount}'), 'connections summary must render the live bounded-path count');
assert.ok(connections.includes('{adapterCount}'), 'connections summary must render the live adapter-path count');
assert.ok(connections.includes('{nextLabel}'), 'connections summary must derive the next action from the available connector state');
assert.ok(connections.includes("id === 'documents' ? '/import' : '/trust'"), 'document connector must route into the unified import path rather than a disconnected connector workflow');
assert.ok(connections.includes("id === 'documents' ? (ar ? 'ابدأ الاستيراد الموحد' : 'Start unified import')"), 'document connector CTA must explicitly expose the unified import path');

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

const receivablesTruth = fs.readFileSync('src/pages/ReceivablesReportCanonicalPage.tsx', 'utf8');
assert.ok(receivablesTruth.includes("const truthStatus = snapshot.status === 'CALCULATED' ? 'VERIFIED' : 'INSUFFICIENT DATA'"), 'receivables must keep truth status fail-closed');
assert.ok(receivablesTruth.includes('القيم غير المتاحة تبقى غير متاحة ولا تتحول إلى صفر'), 'receivables must not render missing financial truth as zero');
assert.ok(receivablesTruth.includes("if (snapshot.status === 'NO_DATA')"), 'receivables must separate source-empty state from calculated zero values');
assert.ok(receivablesTruth.includes('حالة التقرير: {truthStatus}'), 'receivables must expose a visible truth context');

const liquidity = fs.readFileSync('src/pages/LiquidityPage.tsx', 'utf8');
assert.ok(liquidity.includes('const nextAction = useMemo'), 'liquidity must derive one next action from canonical KPI state');
assert.ok(liquidity.includes("to: '/import'") && liquidity.includes('INSUFFICIENT_DATA'), 'liquidity insufficient truth must route to the unified import surface');
assert.ok(liquidity.includes("to: '/reports/receivables'") && liquidity.includes('overdueReceivables'), 'liquidity receivables pressure must have a canonical workbench action');
assert.ok(liquidity.includes("to: '/reports/purchases'") && liquidity.includes('totalPayables'), 'liquidity payable pressure must have a canonical purchases action');
assert.ok(liquidity.includes("to: '/trust'"), 'liquidity fallback must retain a trust action');
assert.ok(liquidity.includes('aria-label={\'الخطوة التالية: \' + nextAction.title}'), 'liquidity next action must expose an accessible reason');

const stateSurface = fs.readFileSync('src/components/ui/States.tsx', 'utf8');
assert.ok(stateSurface.includes('export function DataUnavailableState'), 'shared UI states must expose an explicit data-unavailable state');
const dashboardUnavailable = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
assert.ok(dashboardUnavailable.includes('DataUnavailableState'), 'dashboard must never fall through to a blank state when its canonical snapshot is incomplete');
const commandUnavailable = fs.readFileSync('src/pages/ExecutiveCommandCenterPage.tsx', 'utf8');
assert.ok(commandUnavailable.includes('DataUnavailableState'), 'executive command center must never fall through to a blank state when KPI truth is absent');
const liquidityUnavailable = fs.readFileSync('src/pages/LiquidityPage.tsx', 'utf8');
assert.ok(liquidityUnavailable.includes('DataUnavailableState'), 'liquidity must expose a governed unavailable-data state');
const receivablesUnavailable = fs.readFileSync('src/pages/ReceivablesReportCanonicalPage.tsx', 'utf8');
assert.ok(receivablesUnavailable.includes('DataUnavailableState'), 'canonical receivables report must expose a governed unavailable-data state');
const reportsUnavailable = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
assert.ok(reportsUnavailable.includes('DataUnavailableState'), 'report surfaces must expose a governed unavailable-data state');

const inventoryUnavailable = fs.readFileSync('src/pages/EntityPages.tsx', 'utf8');
assert.ok(inventoryUnavailable.includes('if (!snapshot) return <DataUnavailableState'), 'inventory must expose a governed unavailable-data state');
const canonicalProfitability = fs.readFileSync('src/pages/ProfitabilityReportCanonicalPage.tsx', 'utf8');
assert.ok(canonicalProfitability.includes('DataUnavailableState'), 'canonical profitability must expose a governed unavailable-data state');
assert.ok(canonicalProfitability.includes('<Link to="/import"'), 'canonical profitability unavailable state must use the unified import route');

// Deep Aghbari visual invariants: retain the executive dark navigation,
// live context rail, and decision evidence surface across future refactors.
const styles = fs.readFileSync('src/index.css', 'utf8');
assert.ok(/\.ag-app-shell \.ag-sidebar\{background:linear-gradient\(180deg,#052f2d 0%,#063b36 58%,#052825 100%\)!important/i.test(styles), 'Aghbari shell must retain the dark executive sidebar identity');
assert.ok(styles.includes('.ag-context-rail') && styles.includes('.ag-context-chip'), 'Aghbari shell must expose the shared live workspace context rail');
assert.ok(styles.includes('.ag-decision-evidence-grid') && styles.includes('.ag-decision-evidence-card'), 'Decision surface must retain the evidence-readiness visual contract');

const decisionExperienceSource = fs.readFileSync('src/pages/DecisionExperiencePage.tsx', 'utf8');
assert.ok(decisionExperienceSource.includes('حالة القرار:'), 'Decision Experience must expose explicit readiness state');
assert.ok(decisionExperienceSource.includes('role="status" aria-live="polite"'), 'Decision Experience readiness changes must be announced accessibly');
assert.ok(decisionExperienceSource.includes('data-readiness={readiness.status}'), 'Decision Experience readiness status must remain machine-addressable');
assert.ok(decisionExperienceSource.includes("type DecisionReadiness = { status: 'READY' | 'REVIEW' | 'BLOCKED';"), 'Decision Experience readiness must expose a typed terminal status contract');
assert.ok(decisionExperienceSource.includes('status: \'READY\''), 'Decision Experience must explicitly model ready decisions');
assert.ok(decisionExperienceSource.includes('status: \'REVIEW\''), 'Decision Experience must explicitly model review decisions');
assert.ok(decisionExperienceSource.includes('status: \'BLOCKED\''), 'Decision Experience must explicitly model blocked decisions');
console.log('Product wow UI contract: PASS (public proof theater + deterministic decision brief)');