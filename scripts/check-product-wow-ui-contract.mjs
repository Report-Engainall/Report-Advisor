import assert from 'node:assert/strict';
import fs from 'node:fs';

const indexCss = fs.readFileSync('src/index.css', 'utf8');
assert.ok(indexCss.includes('.ag-sidebar{background:linear-gradient(180deg,#052f2d 0%,#063b36 58%,#052825 100%)!important'), 'executive shell sidebar must retain the canonical dark surface');
assert.ok(indexCss.includes('.ag-topbar{') && indexCss.includes('background:linear-gradient(135deg,#052f2d 0%,#063b36 58%,#052825 100%)!important'), 'executive shell topbar must retain the canonical dark surface');
assert.ok(!indexCss.includes('AGHBARI VISUAL REFINEMENT — visible separators + stronger RTL navigation tree'), 'superseded light navigation override must not remain after dark-shell reconciliation');
const commandPalette = fs.readFileSync('src/components/CommandPalette.tsx', 'utf8');
assert.ok(commandPalette.includes('const COMMAND_CATEGORY_LABELS: Record<NavigationSectionId, CommandCategory>'), 'command palette category map must remain exhaustive against canonical navigation sections');
assert.ok(commandPalette.includes("trust: 'الثقة والأدلة'"), 'command palette must use the canonical Arabic Trust category');
assert.ok(commandPalette.includes("outputs: 'التقارير والمخرجات'"), 'command palette must use the canonical Arabic Outputs category');
assert.ok(commandPalette.includes('return COMMAND_CATEGORY_LABELS[section];'), 'command palette must resolve categories directly from the canonical section map');
assert.ok(commandPalette.includes('Enter للفتح') && commandPalette.trim().endsWith('}'), 'command palette source must retain its executable footer and terminal closure');
const languageToggle = fs.readFileSync('src/components/LanguageToggle.tsx', 'utf8');
assert.ok(languageToggle.includes('ag-language-toggle'), 'language toggle must expose the executive-shell styling hook');
assert.ok(languageToggle.includes('min-h-11 min-w-11'), 'language toggle must preserve the shared touch-target minimum');
const header = fs.readFileSync('src/components/Header.tsx', 'utf8');
assert.ok(header.includes('min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-ink-400'), 'alert close control must preserve the shared touch-target minimum');
const login = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');
const dashboard = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
const masterData = fs.readFileSync('src/pages/MasterDataHubPage.tsx', 'utf8');
for (const token of [
  "resolveCurrentCompanyId",
  "count: 'exact', head: true",
  "inventory_balances",
  "setCounts",
  "إعادة قراءة الحقيقة",
  "TENANT_REQUIRED",
  "LoadingState",
  "ErrorState",
  "to={value > 0 ? '/inventory' : '/import'}",
"source_analysis_snapshots",
  "canonical_dataset_records",
  "import_field_lineage",
  "analysisSnapshots",
  "canonicalDatasets",
  "fieldMappings",
]) assert.ok(masterData.includes(token), 'Master Data hub truth binding missing: ' + token);
assert.ok(masterData.includes("count === 0 ? '/import' : path"), 'Master Data empty entities must route to unified import');
assert.ok(masterData.includes("const [customers, products, inventory, suppliers, warehouses, branches, categories, analysisSnapshots, canonicalDatasets, fieldMappings]"), 'Master Data hub must bind every canonical count result without undefined destructuring');
assert.ok(masterData.includes('const evidenceRows = counts.analysisSnapshots + counts.canonicalDatasets + counts.fieldMappings'), 'Master Data hub must keep evidence/lineage rows separate from entity row totals');
assert.ok(masterData.includes("analysisSnapshots: 'source_analysis_snapshots'"), 'Master Data semantic analysis key must map to the canonical source-analysis table');
assert.ok(masterData.includes("canonicalDatasets: 'canonical_dataset_records'"), 'Master Data canonical-dataset key must map to the canonical dataset table');
assert.ok(masterData.includes("fieldMappings: 'import_field_lineage'"), 'Master Data field-lineage key must map to the canonical lineage table');
const entities = fs.readFileSync('src/pages/EntityPages.tsx', 'utf8');
const dataTable = fs.readFileSync('src/components/ui/DataTable.tsx', 'utf8');
assert.ok(dataTable.includes('role="status" aria-live="polite" aria-busy="true"'), 'shared table loading state must expose assistive status semantics');
assert.ok(dataTable.includes('role="status" aria-live="polite"'), 'shared table empty state must expose assistive status semantics');
assert.ok(dataTable.includes('scope="col"'), 'shared table headers must declare column scope');
assert.ok(dataTable.includes('aria-rowcount={data.length + 1}') && dataTable.includes('aria-colcount={columns.length}'), 'shared table must expose absolute row and column counts');
assert.ok(dataTable.includes('role="navigation" aria-label="تنقّل الجدول"'), 'shared table pagination must expose navigation semantics');

const workCenter = fs.readFileSync('src/pages/WorkCenterPage.tsx', 'utf8');
assert.ok(workCenter.includes('const zeroProgressActive = useMemo'), 'work center must expose an explicit zero-progress active signal');
assert.ok(workCenter.includes('تحقق من العمليات دون تقدم'), 'work center must route zero-progress work to a visible next action');
assert.ok(workCenter.includes('نشطة بلا تقدم'), 'work center must expose zero-progress active count in the decision summary');
assert.ok(workCenter.includes('بتقدم 0%'), 'work center active rows must distinguish zero-progress processing from ordinary active work');
assert.ok(workCenter.includes('role="progressbar"'), 'work center progress must expose a semantic progressbar');
assert.ok(workCenter.includes('aria-valuenow={Math.max(0, Math.min(100, r.progress))}'), 'work center progress must expose the numeric progress value');

const assistant = fs.readFileSync('src/components/DeterministicIntelligenceAssistant.tsx', 'utf8');
assert.ok(assistant.includes("type AssistantMode = 'LOADING' | 'READY' | 'INSUFFICIENT_DATA' | 'ERROR'"), 'assistant must distinguish loading from ready state');
assert.ok(assistant.includes("mode === 'LOADING'"), 'assistant must expose loading semantics while context is fetched');
assert.ok(assistant.includes('إعادة تحميل سياق المؤشرات'), 'assistant must expose explicit recovery when the canonical snapshot is unavailable');

const journey = fs.readFileSync('src/components/ProductJourneyNav.tsx', 'utf8');
assert.ok(journey.includes("path === '/intelligence'"), 'product journey must activate the intelligence stage for nested intelligence routes');
assert.ok(journey.includes("path === '/reports/executive'"), 'product journey must activate the outputs stage across nested report routes');
for (const token of [
  "label: 'الدليل'",
  "path: '/trust'",
  "label: 'الإشارات'",
  "path: '/intelligence'",
  "label: 'القرار'",
  "label: 'العمل'",
  "path: '/work-center'",
  "label: 'التعلّم'",
  "path: '/replay'",
]) assert.ok(journey.includes(token), 'product journey must expose the canonical stage: ' + token);
assert.ok((journey.match(/const steps: JourneyStep\[\] = \[/)?.length ?? 0) === 1, 'product journey must keep one canonical step definition');
assert.equal((journey.match(/label: '/g) ?? []).length, 8, 'product journey must expose exactly eight canonical visible stages');
const journeyCss = fs.readFileSync('src/index.css', 'utf8');
assert.ok(journeyCss.includes('min-height:44px'), 'product journey links must meet the shared 44px touch-target baseline');
const appShell = fs.readFileSync('src/App.tsx', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
assert.ok(sidebar.includes('flex min-h-11 items-center gap-1.5 rounded-[8px]'), 'sidebar quick-access links must preserve the shared touch-target minimum');
assert.ok(appShell.includes("language === 'ar' ? navigationItem.label : navigationItem.enLabel"), 'mobile primary navigation must respect the active language');
const navigationRegistry = fs.readFileSync('src/lib/navigation-registry.ts', 'utf8');
const navigationPaths = [...navigationRegistry.matchAll(/path:\s*'([^']+)'/g)].map((match) => match[1]);
const appRoutePaths = new Set([...appShell.matchAll(/<Route path="([^"]+)"/g)].map((match) => match[1]));
for (const sectionId of [
  'decision-center',
  'data-operations',
  'analytics',
  'intelligence',
  'trust',
  'outputs',
  'reference',
  'admin',
]) assert.ok(navigationRegistry.includes(`id: '${sectionId}'`), `canonical navigation section missing: ${sectionId}`);
assert.equal(navigationPaths.length, 38, 'canonical navigation registry must expose the current 38 navigation items');
for (const path of navigationPaths) assert.ok(appRoutePaths.has(path), `navigation route must exist in App router: ${path}`);



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
assert.ok(appShell.includes('<Route path="/import/analyze" element={<Navigate to="/import" replace />} />'), 'legacy file-analysis route must redirect to the canonical import entry point');
assert.ok(appShell.includes('ag-global-advisor'), 'global Aghbari Advisor must expose a stable drawer target');
assert.ok(appShell.includes('onOpenAdvisor'), 'mobile navigation must expose the Advisor action');
assert.ok(appShell.includes('advisorCounts.recommendations'), 'global Advisor must receive live recommendation context');
assert.ok(sidebar.includes("trust: { hint: 'إثبات، مصدر، وثقة', tag: 'TRUST' }"), 'Trust navigation section must have product metadata');
assert.ok(sidebar.includes("outputs: { hint: 'تقارير ومخرجات القرار', tag: 'OUTPUT' }"), 'Outputs navigation section must have product metadata');
assert.ok(!dashboard.includes('generateSynthetic'), 'decision brief must not invent synthetic business data');
const importEntry = fs.readFileSync('src/pages/ImportPage.tsx', 'utf8');
assert.ok(importEntry.includes("import { CanonicalImportPage } from '@/pages/CanonicalImportPage';"), 'import entry must wrap the canonical import implementation');
assert.ok((importEntry.match(/<CanonicalImportPage \/>/g) ?? []).length === 1, 'import entry must mount exactly one canonical import implementation');
assert.ok(!importEntry.includes('createImportRecord(') && !importEntry.includes('runCanonicalImportThroughDurableRunner('), 'import entry must not implement a second import execution path');

const importSurface = fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');
assert.ok(importSurface.includes('role="progressbar"'), 'canonical import saving state must expose a semantic progressbar');
assert.ok(importSurface.includes('aria-valuenow={Math.max(0, Math.min(100, progress))}'), 'canonical import progressbar must expose bounded numeric progress');
assert.ok(importSurface.includes('aria-live="polite" aria-busy="true"'), 'canonical import saving state must expose live/busy semantics');
assert.ok(importSurface.includes('لم يُثبت مصدر سابق لهذا الحساب بعد'), 'canonical import history empty state must distinguish an empty history');
assert.ok(importSurface.includes('اختيار مصدر'), 'canonical import history empty state must expose a real source-selection action');
assert.ok(importSurface.includes('onClick={reset}'), 'canonical import history empty state must use the existing reset/import path');
assert.ok(importSurface.includes('const [historyError, setHistoryError]'), 'canonical import history must preserve fetch failures instead of mapping them to an empty list');
assert.ok(importSurface.includes('fetchImportRecords(500, focusedJobId ?? undefined)'), 'canonical import history must read the declared 500-row window');
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
const reports = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
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

assert.ok(reports.includes("builder: '1'"), 'reports center must expose the source-bound Report Builder state without creating a second route');
assert.ok(reports.includes('ReportBuilder'), 'reports center must mount the canonical source-bound builder');
assert.ok(reports.includes('downloadReportArtifact'), 'report builder must reuse the canonical report export path');
assert.ok(reports.includes('SOURCE-BOUND DRAFT'), 'report builder must disclose session-scoped source binding rather than imply saved-template persistence');
assert.ok(reports.includes('window.print()'), 'report builder must preserve print output');
assert.ok(reports.includes('print:hidden space-y-5'), 'report builder print mode must isolate the builder from the reports-center shell');

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
const trustEvidence = fs.readFileSync('src/pages/TrustEvidencePage.tsx', 'utf8').replace(/\r\n/g, '\n');
assert.ok(!trustEvidence.includes("String(dataset.columnCount ?? 0)"), 'Evidence Passport must not convert missing dataset column count into zero');
assert.ok(trustEvidence.includes("dataset.columnCount == null ? 'غير متاح' : String(dataset.columnCount)"), 'Evidence Passport must render missing dataset column count as unavailable');
assert.ok(trustEvidence.includes('const [refreshing, setRefreshing]'), 'trust evidence must refresh in-place instead of reloading the whole page');
assert.ok(trustEvidence.includes("path: '/trust'"), 'Evidence Passport must use the canonical trust route');
assert.ok(!trustEvidence.includes('window.location.reload()'), 'trust evidence refresh must not discard page context with a full reload');
assert.ok(trustEvidence.includes('لا توجد بيانات مثبتة بعد'), 'empty trust state must explain the absence of evidence');
assert.ok(trustEvidence.includes('RECORDS CHECKED'), 'trust evidence must expose the source record count');
assert.ok(trustEvidence.includes('AS OF'), 'trust evidence must expose the evidence snapshot as-of label');
assert.ok(trustEvidence.includes("title: 'Snapshots / As-of'"), 'trust evidence must keep the snapshots as-of surface visible');
assert.ok(trustEvidence.includes("path: '/trust', available: true, icon: History"), 'snapshots as-of surface must point to the canonical Evidence Passport rather than a dead route');

assert.ok(trustEvidence.includes('وقت إنشاء Snapshot الدليل'), 'trust evidence as-of value must disclose that it is the snapshot creation time');
assert.ok(trustEvidence.includes('criticalIssueTotal'), 'trust evidence must expose critical issue pressure from the authoritative snapshot');
assert.ok(trustEvidence.includes("String(sourceSnapshot.analysis_status).toLowerCase() !== 'analyzed'"), 'trust evidence must not promote an un-analyzed source snapshot to VERIFIED');
assert.ok(trustEvidence.includes("sourceEvidenceStatus === 'PARTIAL'"), 'trust evidence must gate the next action when the source analysis state is partial');
assert.ok(trustEvidence.includes('أغلق المشكلات الحرجة'), 'trust evidence must route critical data-quality pressure to an actionable next step');
assert.ok(trustEvidence.includes("aria-label={'الخطوة التالية: ' + nextStep.label}"), 'trust evidence next-action link must use valid JSX');
const trustDatasetSection = trustEvidence.indexOf('DATASET UNDERSTANDING');
assert.ok(trustDatasetSection >= 0, 'trust evidence must expose dataset understanding');
const trustDatasetTail = trustEvidence.slice(trustDatasetSection, trustEvidence.indexOf('</section>', trustDatasetSection));
assert.ok(trustDatasetTail.includes('</>'), 'trust evidence dataset fragment must terminate cleanly');
assert.ok((trustDatasetTail.match(/<\/div>/g) ?? []).length >= 2, 'trust evidence dataset containers must close before conditional fragment termination');
assert.ok(trustEvidence.includes("dataset.rowCount == null ? 'غير متاح' : String(dataset.rowCount)"), 'trust evidence must not coerce missing dataset row count to zero');
assert.ok(trustEvidence.includes("dataset.specialtyConfidence == null ? 'غير متاح' : String(dataset.specialtyConfidence) + '%'"), 'trust evidence must not coerce missing dataset confidence to zero');
assert.ok(!trustEvidence.includes('aria-label={\\`'), 'trust evidence contract must reject escaped JSX template backticks');
const decisionExperience = fs.readFileSync('src/pages/DecisionExperiencePage.tsx', 'utf8');
assert.ok(decisionExperience.includes('recommendation.expected_impact == null'), 'decision readiness must treat zero expected impact as a valid value');
assert.ok(!decisionExperience.includes('if (!recommendation.expected_impact)'), 'decision readiness must not classify zero expected impact as missing');
assert.ok(decisionExperience.includes('فحص الثقة'), 'decision experience must provide a trust action when no active alerts exist');
assert.ok(decisionExperience.includes('إضافة مصدر'), 'decision experience must provide a canonical import action when no recommendations exist');
assert.ok(decisionExperience.includes('<Link to="/import"'), 'decision experience recommendation-empty state must use the unified import route');
assert.ok(decisionExperience.includes('العودة إلى الإشارات'), 'decision evidence empty-selection state must provide a return action');
assert.ok(decisionExperience.includes('<Link to="/trust"'), 'decision alerts must route source inspection to the trust/evidence surface');
assert.ok(decisionExperience.includes('As Of '), 'decision experience must disclose the evidence snapshot as-of context when an imported source is bound');
assert.ok(decisionExperience.includes('approval?.decided_by'), 'approval UI must expose the persisted approver when available');
assert.ok(decisionExperience.includes('approval?.decided_at'), 'approval UI must expose the persisted decision timestamp when available');
assert.ok(decisionExperience.includes('approval.requested_by'), 'approval UI must expose the persisted requester when available');
assert.ok(decisionExperience.includes('approval.requested_at'), 'approval UI must expose the persisted request timestamp when available');
assert.ok(decisionExperience.includes('approval.reason'), 'approval UI must expose the persisted approval reason when available');


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
assert.ok(canonicalImport.includes('CANONICAL_LIFECYCLE'), 'canonical import result must expose the full post-upload lifecycle surface');
assert.ok(canonicalImport.includes('id="post-import-journey"'), 'canonical import result must expose the post-import journey after file approval');
assert.ok(canonicalImport.includes('01 · EVIDENCE') && canonicalImport.includes('02 · SIGNALS') && canonicalImport.includes('03 · DECISION') && canonicalImport.includes('04 · WORK') && canonicalImport.includes('05 · OUTCOME'), 'post-import journey must expose evidence → signals → decision → work → outcome sequence');
assert.ok(canonicalImport.includes('ماذا بعد سحب الملف؟'), 'post-import journey must answer the next-step question explicitly');assert.ok(canonicalImport.includes('total: authoritativeRowCount'), 'canonical import result must render authoritative server row count');

assert.ok(canonicalImport.includes('specialtyLabel'), 'canonical import must present typed business specialties with customer-facing labels');
assert.ok(canonicalImport.includes('entityLabel'), 'canonical import must present canonical entity types with customer-facing labels');
assert.ok(canonicalImport.includes("from '@/lib/import/canonical-labels'"), 'canonical import must reuse the shared canonical label helper');
assert.ok(trustEvidence.includes("from '@/lib/import/canonical-labels'"), 'Evidence Passport must reuse the shared canonical specialty label helper');
assert.ok(canonicalImport.includes('Security') && canonicalImport.includes('Fingerprint'), 'canonical import lifecycle must expose source security and fingerprint stages');
assert.ok(canonicalImport.includes('Normalize') && canonicalImport.includes('Quality') && canonicalImport.includes('Trust'), 'canonical import lifecycle must expose normalize, quality and trust stages');
assert.ok(canonicalImport.includes('Canonical Commit') && canonicalImport.includes('Persistence') && canonicalImport.includes('Readback'), 'canonical import lifecycle must expose canonical commit, persistence and readback stages');
assert.ok(canonicalImport.includes('Business Understanding') && canonicalImport.includes('Signals') && canonicalImport.includes('Decision'), 'canonical import lifecycle must expose business understanding, signals and decision stages');
assert.ok(canonicalImport.includes('Outcome') && canonicalImport.includes('Learning'), 'canonical import lifecycle must expose outcome and learning stages');
assert.ok(canonicalImport.includes('إثباتها مرتبط بالحالة النهائية والدليل'), 'canonical import lifecycle must remain evidence-neutral rather than claiming VERIFIED per visible stage');
assert.ok(!canonicalImport.includes('تم عبور هذه الطبقة ضمن التنفيذ الكانوني'), 'canonical import lifecycle must not imply VERIFIED proof merely from stage visibility');

const commandCenter = fs.readFileSync('src/pages/ExecutiveCommandCenterPage.tsx', 'utf8');
const intelligence = fs.readFileSync('src/pages/IntelligencePage.tsx', 'utf8');
assert.ok(commandCenter.includes('kpis.totalReceivables'), 'money recovery surface must use authoritative receivables truth');
assert.ok(commandCenter.includes('kpis.overdueReceivables'), 'money recovery surface must expose overdue receivables truth when available');
assert.ok(intelligence.includes('const rejectRecommendation = useCallback'), 'intelligence center must route rejection through one governed mutation path');
assert.ok(!intelligence.includes("updateRecommendationStatus(recommendation.id, 'accepted')"), 'intelligence center must not bypass governed approval with direct accepted mutation');
assert.ok(intelligence.includes('/decision-experience?stage=decision&recommendationId='), 'intelligence center decision CTA must carry the recommendation context');
assert.ok(intelligence.includes("recommendation.status === 'OPEN' || recommendation.status === 'new'"), 'intelligence center rejection control must remain limited to valid pre-approval states');

assert.ok(commandCenter.includes('لا تُحسب فرصة استرداد إضافية دون ledger موثّق'), 'money recovery surface must remain fail-closed about actual recovery');

for (const token of [
  'Decision Coverage',
  'decisionAccountability.ownerCoverage',
  'decisionAccountability.outcomeCoverage',
  'aria-label="الإجراء التالي"',
  'commandNextAction.to',
  'commandNextAction.reason',
  'لا يتم دمجهما في درجة مخترعة',
]) assert.ok(commandCenter.includes(token), 'command center decision coverage/next-action guard missing: ' + token);assert.ok(commandCenter.includes('fetchBusinessReplaySnapshot'), 'command center replay state must use the canonical replay snapshot query');
assert.ok(commandCenter.includes('fetchBusinessReplaySnapshot(1)'), 'command center replay card must use a bounded one-row read window');

assert.ok(commandCenter.includes('const replayAvailable'), 'command center replay availability must be derived from canonical snapshot truth');assert.ok(commandCenter.includes('Promise.allSettled'), 'command center must isolate auxiliary replay read failures from core command-center failure');
assert.ok(commandCenter.includes('setReplayError(true)'), 'command center must expose an explicit replay-read review state');
assert.ok(commandCenter.includes("const replayState = replayError ? 'REVIEW'"), 'command center replay state must distinguish source read failure from insufficient history');

assert.ok(commandCenter.includes('to="/replay"'), 'command center replay action must route to the canonical replay surface');


assert.ok(commandCenter.includes("setAlerts(intelligence.alerts.filter((item) => !item.is_read));"), 'command center open-alert count must use the full canonical set');
assert.ok(commandCenter.includes('setRecommendations(intelligence.recommendations.filter((item) => isActionableRecommendationStatus(item.status)));'), 'command center recommendation loading must use canonical recommendation status semantics');
assert.ok(commandCenter.includes('alerts.slice(0, 5)'), 'command center may limit display to a bounded alert window only after full-state derivation');
assert.ok(commandCenter.includes('recommendations.slice(0, 5)'), 'command center may limit display to a bounded recommendation window only after full-state derivation');

assert.ok(commandCenter.includes('ضمن القراءة الحالية؛ لا يتم دمجهما في درجة مخترعة'), 'decision coverage card must disclose its read-window scope');
const decisionStatus = fs.readFileSync('src/lib/decision-status.ts', 'utf8');
assert.ok(decisionStatus.includes("'OPEN'"), 'canonical decision status resolver must include OPEN');
assert.ok(decisionStatus.includes("isActionableRecommendationStatus"), 'canonical decision status resolver must expose an actionable predicate');
const executiveReport = fs.readFileSync('src/pages/ExecutiveReportPage.tsx', 'utf8');
assert.ok(intelligence.includes('isActionableRecommendationStatus(item.status)'), 'intelligence queue must use canonical recommendation status semantics');
assert.ok(intelligence.includes('const actionableRecommendations = useMemo('), 'intelligence must derive one canonical actionable recommendation cohort');
assert.ok(intelligence.includes("in_progress: items.filter((item) => item.status === 'in_progress').length"), 'intelligence recommendation counts must use the canonical in_progress key');
assert.ok(intelligence.includes('counts.in_progress'), 'intelligence summary must consume the canonical in_progress count key');
assert.ok(!intelligence.includes('counts.inProgress'), 'intelligence must not regress to a camelCase count key that diverges from status filters');

assert.ok(intelligence.includes('isActionableRecommendationStatus(item.status)'), 'intelligence actionable cohort must use the canonical status resolver');
assert.ok(intelligence.includes("if (status === 'accepted') return 'مقبولة';") && intelligence.includes("if (status === 'approved') return 'معتمدة';"), 'recommendation readback must expose both legacy accepted and canonical approved states');
assert.ok(!intelligence.includes("updateRecommendationStatus(id, 'accepted')"), 'recommendation list must not bypass the governed decision/approval flow with a direct accepted mutation');
assert.ok(intelligence.includes("'/decision-experience?stage=decision&recommendationId='"), 'OPEN recommendations must enter the governed decision experience');
assert.ok(intelligence.includes("updateRecommendationStatus(id, 'rejected')"), 'OPEN/new recommendations may still use the valid terminal rejection transition');

assert.ok(intelligence.includes("setFilter] = useState<'all' | 'actionable' | 'approved' | 'in_progress' | 'rejected'>"), 'recommendation filters must expose canonical lifecycle states');

assert.ok(executiveReport.includes('isActionableRecommendationStatus(item.status)'), 'executive report coverage must use canonical recommendation status semantics');
assert.ok(!executiveReport.includes("['pending', 'proposed', 'approved', 'in_progress'].includes(item.status)"), 'executive report must not use an incompatible status cohort');

assert.ok(appShell.includes('mobileSidebarRef'), 'mobile navigation drawer must expose a focus boundary');
assert.ok(appShell.includes('aria-modal="true" aria-label="القائمة الرئيسية"'), 'mobile navigation drawer must declare modal semantics');
assert.ok(appShell.includes("event.key === 'Tab'") || appShell.includes("event.key !== 'Tab'"), 'mobile navigation drawer must trap keyboard focus');
assert.ok(appShell.includes('document.body.style.overflow = \'hidden\''), 'mobile navigation drawer must lock background scroll');

assert.ok(header.includes('alertPanelRef'), 'alert drawer must expose a dialog focus boundary');
assert.ok(header.includes("event.key === 'Tab'") || header.includes("event.key !== 'Tab'"), 'alert drawer must trap keyboard focus while open');
assert.ok(header.includes('aria-label="إغلاق التنبيهات"'), 'alert drawer must expose an accessible close control');
assert.ok(header.includes('document.body.style.overflow = \'hidden\''), 'alert drawer must lock background scroll while open');

const advisorSurface = fs.readFileSync('src/App.tsx', 'utf8');
assert.ok(advisorSurface.includes('advisorPanelRef'), 'global Advisor must expose a focus boundary');
assert.ok(advisorSurface.includes('advisorRestoreFocusRef'), 'global Advisor must restore focus to its trigger');
assert.ok(advisorSurface.includes('role="dialog" aria-modal="true"'), 'global Advisor must declare modal dialog semantics');
assert.ok(advisorSurface.includes('aria-labelledby="ag-global-advisor-title"'), 'global Advisor must have an accessible title binding');
assert.ok(advisorSurface.includes('aria-label="إغلاق المستشار"'), 'global Advisor must expose an accessible close control');
assert.ok(advisorSurface.includes("event.key === 'Escape'"), 'global Advisor must close on Escape');
assert.ok(advisorSurface.includes("event.key === 'Tab'") || advisorSurface.includes("event.key !== 'Tab'"), 'global Advisor must trap keyboard focus');
assert.ok(advisorSurface.includes('document.body.style.overflow = \'hidden\''), 'global Advisor must lock background scroll while open');

assert.ok(commandPalette.includes('restoreFocusRef'), 'command palette must restore focus to its opener');
assert.ok(commandPalette.includes('document.body.style.overflow = \'hidden\''), 'command palette must lock background scroll while open');
assert.ok(commandPalette.includes("event.key === 'Tab'") || commandPalette.includes("event.key !== 'Tab'"), 'command palette must trap keyboard focus inside the dialog');
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
assert.ok(masterDataHub.includes('غياب البيانات يبقى حالة حقيقية ولا يتحول إلى سجل افتراضي'), 'master data hub must preserve fail-closed reference semantics');
assert.ok(masterDataHub.includes('min-h-11'), 'master data actions must meet touch-target sizing');

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
assert.ok(!scenarioGuard.includes('CanonicalScenarioPage'), 'scenario truth gate must not depend on the removed superseded page');
assert.ok(scenarioGuard.includes('function ScenarioCalculator'), 'scenario truth gate must own the canonical deterministic scenario calculator');


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
assert.ok((metricInspector.match(/min-h-11/g) || []).length >= 5, 'metric inspector primary filters/actions must meet touch-target sizing');
assert.ok(metricInspector.includes('aria-live="assertive"'), 'metric inspector capture errors must be announced immediately');



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
assert.ok((workCenter.match(/min-h-11/g) || []).length >= 10, 'work center primary execution/review actions must meet touch-target sizing');
assert.ok(workCenter.includes('aria-pressed={filter === targetFilter}'), 'work center summary filter cards must expose selected state');

const executiveCommand = fs.readFileSync('src/pages/ExecutiveCommandCenterPage.tsx', 'utf8');
assert.ok(executiveCommand.includes('بيانات الذمم متاحة'), 'money recovery must describe receivables availability without claiming recoverable money');
assert.ok(executiveCommand.includes('فحص مساحة الإشارات'), 'executive command center alert-empty state must provide an intelligence action');
assert.ok(executiveCommand.includes('مراجعة جودة البيانات'), 'executive command center recommendation/trend empty states must expose the data-quality next step');
assert.ok(executiveCommand.includes('<Link to="/data-quality"'), 'executive command center empty states must use the canonical data-quality route');
assert.ok((executiveCommand.match(/min-h-11/g) || []).length >= 10, 'executive command operational actions must meet touch-target sizing');

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
assert.ok((connections.match(/min-h-11/g) || []).length >= 4, 'connections primary source CTAs must meet touch-target sizing');

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

assert.ok(profileSettings.includes('const load = useCallback(async () =>'), 'profile settings must expose a reusable initial-load/retry path');
assert.ok(profileSettings.includes('<ErrorState message={error} onRetry={() => void load()} />'), 'profile settings must fail closed when initial auth data cannot be loaded');
assert.ok(profileSettings.includes('setDisplayName'), 'profile settings must preserve the editable display-name control');
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
assert.ok(intelligence.includes('بوابة الاختبار الرجعي'), 'forecast surface must expose an explicit backtest gate');
assert.ok(intelligence.includes('الاختبار الرجعي غير متاح حاليًا'), 'backtest must remain fail-closed when historical paired forecast/outcome evidence is unavailable');
assert.ok(intelligence.includes('نسبة دقة مصطنعة'), 'backtest empty state must forbid fabricated accuracy');


assert.ok(executiveCommand.includes('Decision ROI'), 'decision center must expose Decision ROI state');
assert.ok(executiveCommand.includes('Money Recovery'), 'decision center must expose Money Recovery state');
assert.ok(executiveCommand.includes('Decision Coverage'), 'decision center must expose Decision Coverage state');
assert.ok(intelligence.includes('Decision Playbooks'), 'intelligence must expose the governed Decision Playbooks capability state');
assert.ok(reportsSurface.includes('Report Builder'), 'reports must expose the report-builder capability');
assert.ok(reportsSurface.includes('طباعة'), 'reports must preserve a visible print capability');
assert.ok(trustEvidence.includes('Evidence Passport'), 'trust surface must expose the Evidence Passport capability');
assert.ok(trustEvidence.includes('Snapshots / As-of'), 'trust surface must expose snapshot/as-of evidence semantics');
assert.ok(canonicalImport.includes('01 · EVIDENCE') && canonicalImport.includes('05 · OUTCOME'), 'canonical import must expose the full post-import decision continuum');

assert.ok(appShell.includes('href="#main-content"'), 'global shell must expose a keyboard skip link to the primary content');
assert.ok(appShell.includes('id="main-content"'), 'global shell must expose a stable main-content target');
assert.ok(appShell.includes('document.title ='), 'global shell must bind the browser title to canonical route context');
assert.ok(appShell.includes('alertsUnavailable'), 'global shell must represent alert-source unavailability explicitly');
assert.ok(appShell.includes('setAlertsUnavailable(true)'), 'alert retrieval failure must not be coerced into an empty alert list');

const headerSurface = fs.readFileSync('src/components/Header.tsx', 'utf8');
assert.ok(headerSurface.includes('alertsUnavailable ?'), 'header alert surface must distinguish unavailable data from an empty alert set');
assert.ok(headerSurface.includes('لم يتم اعتبارها صفرًا'), 'header alert state must explicitly preserve fail-closed semantics');
assert.ok(headerSurface.includes('إعادة الفحص'), 'header alert unavailability must expose a retry action');

const dataTableSurface = fs.readFileSync('src/components/ui/DataTable.tsx', 'utf8');
assert.ok(dataTableSurface.includes('gridTemplateColumns'), 'shared table loading must preserve column geometry');
assert.ok(dataTableSurface.includes('تجهيز الصفوف والحقول'), 'shared table loading must expose an explicit loading context');


const alternativeGroups = fs.readFileSync('src/pages/AlternativeGroupsPage.tsx', 'utf8');
assert.ok(alternativeGroups.includes('role="alert" aria-live="assertive"'), 'alternative groups must announce mutation/load failures');
assert.ok(alternativeGroups.includes('role="status" aria-live="polite"'), 'alternative groups loading must be announced without interruption');
assert.ok(alternativeGroups.includes('aria-busy={saving}'), 'alternative group writes must expose their busy state');
assert.ok(alternativeGroups.includes('min-h-11 min-w-11'), 'alternative group destructive actions must meet touch-target sizing');

const suppliers = fs.readFileSync('src/pages/SuppliersPage.tsx', 'utf8');
assert.ok((suppliers.match(/min-h-11/g) || []).length >= 3, 'supplier search/navigation controls must meet touch-target sizing');

const sharedStates = fs.readFileSync('src/components/ui/States.tsx', 'utf8');
assert.ok(sharedStates.includes('role="status" aria-live="polite" className="ag-state ag-state-empty'), 'governed data-unavailable state must be announced to assistive technology');

console.log('Product wow UI contract: PASS (public proof theater + deterministic decision brief)');